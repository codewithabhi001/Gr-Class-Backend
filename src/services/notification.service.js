import firebaseApp from '../config/firebase.js';
import db from '../models/index.js';
import * as emailService from './email.service.js';
import logger from '../utils/logger.js';
import { formatNotification } from '../utils/notification.formatter.js';

const Notification = db.Notification;
const NotificationPreference = db.NotificationPreference;
const User = db.User;

/**
 * Core notification dispatch logic
 * @param {string} userId 
 * @param {string} eventType - e.g. SLA_BREACH, INFO, JOB_ASSIGNMENT
 * @param {object} data - { title, message, ...otherDetails }
 */
export const sendNotification = async (userId, eventType, data = {}, userObj = null) => {
    try {
        const user = userObj || await User.findByPk(userId);
        if (!user) return;

        const pref = await NotificationPreference.findOne({ where: { user_id: user.id } });

        // Logic: Enabled if no preference set, or if explicitly enabled
        const matchesType = !pref || pref.alert_types.length === 0 || pref.alert_types.includes(eventType);

        const emailAllowed = !pref || (pref.email_enabled && matchesType);
        const appAllowed = !pref || (pref.app_enabled && matchesType);

        // Populate title and message if not present
        const formatted = formatNotification(eventType, data);
        data.title = data.title || formatted.title;
        data.message = data.message || formatted.message;

        // 1. In-App Notification (Database)
        if (appAllowed) {
            await Notification.create({
                user_id: user.id,
                title: data.title,
                message: data.message,
                type: eventType
            });
        }

        // 2. Push Notification (Firebase FCM)
        if (appAllowed && user.fcm_token && firebaseApp) {
            try {
                const message = {
                    notification: {
                        title: data.title,
                        body: data.message,
                        ...(data.imageUrl && { image: data.imageUrl })
                    },
                    data: {
                        eventType: eventType,
                        ...Object.fromEntries(
                            Object.entries(data).map(([k, v]) => [k, String(v)])
                        )
                    },
                    android: {
                        notification: {
                            ...(data.imageUrl && { image: data.imageUrl }),
                            priority: 'high',
                            sound: 'default'
                        }
                    },
                    apns: {
                        payload: {
                            aps: {
                                'mutable-content': 1,
                                sound: 'default'
                            }
                        },
                        fcm_options: {
                            ...(data.imageUrl && { image: data.imageUrl })
                        }
                    },
                    token: user.fcm_token,
                };

                await firebaseApp.messaging().send(message);
                logger.debug(`FCM notification sent to user ${user.id}`);
            } catch (fcmError) {
                logger.error(`Failed to send FCM notification to user ${user.id}:`, fcmError);
                // If token is invalid/expired, we might want to clear it
                if (fcmError.code === 'messaging/registration-token-not-registered' ||
                    fcmError.code === 'messaging/invalid-registration-token') {
                    await user.update({ fcm_token: null });
                }
            }
        }

        // 3. Email Notification
        if (emailAllowed && user.email) {
            await emailService.sendTemplateEmail(user.email, eventType, data);
        }

    } catch (err) {
        logger.error(`Failed to send notification to user ${userId}`, err);
    }
};

/**
 * Legacy/Simple wrapper for creating a single notification
 */
export const createNotification = async (userId, title, message, type = 'INFO') => {
    return await sendNotification(userId, type, { title, message });
};

/**
 * Notify all users with specific roles
 */
export const notifyRoles = async (roles, title, message, type = 'INFO') => {
    try {
        const users = await User.findAll({
            where: {
                role: roles
            }
        });

        // Send notifications in parallel
        await Promise.all(users.map(user => sendNotification(user.id, type, { title, message }, user)));
    } catch (error) {
        logger.error('Error in notifyRoles:', error);
    }
};

export const getNotifications = async (userId) => {
    return await Notification.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: 20
    });
};

export const markRead = async (id, userId) => {
    const notif = await Notification.findOne({ where: { id, user_id: userId } });
    if (notif) {
        await notif.update({ is_read: true });
    }
    return notif;
};
