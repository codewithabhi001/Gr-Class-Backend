import db from '../../models/index.js';
import * as emailService from '../../services/email.service.js';
import logger from '../../utils/logger.js';

const Notification = db.Notification;
const NotificationPreference = db.NotificationPreference;
const User = db.User;

export const sendNotification = async (userId, eventType, data) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) return;

        const pref = await NotificationPreference.findOne({ where: { user_id: userId } });
        const matchesType = !pref || pref.alert_types.length === 0 || pref.alert_types.includes(eventType);

        const emailAllowed = !pref || (pref.email_enabled && matchesType);
        const appAllowed = !pref || (pref.app_enabled && matchesType);

        if (appAllowed) {
            await Notification.create({
                user_id: userId,
                title: data.title || eventType,
                message: data.message || 'New notification',
                type: eventType
            });
        }

        if (emailAllowed && user.email) {
            // Don't await email - send in background
            emailService.sendTemplateEmail(user.email, eventType, data)
                .catch(err => logger.error(`Background Email error for user ${userId}:`, err));
        }

    } catch (err) {
        logger.error(`Failed to send notification to user ${userId}`, err);
    }
};

export const createNotification = async (userId, title, message, type = 'INFO') => {
    return await sendNotification(userId, type, { title, message });
};

export const notifyRoles = async (roles, title, message, type = 'INFO') => {
    try {
        const users = await User.findAll({
            where: { role: roles }
        });

        if (users.length === 0) return;

        const notificationsToCreate = [];
        const emailPromises = [];

        // Note: For consistency with the primary service, we could fetch preferences here too.
        // For now, let's at least bulk create the database records.
        for (const user of users) {
            notificationsToCreate.push({
                user_id: user.id,
                title: title,
                message: message,
                type: type
            });

            if (user.email) {
                emailPromises.push(
                    emailService.sendTemplateEmail(user.email, type, { title, message })
                        .catch(err => logger.error(`Email error for user ${user.id}:`, err))
                );
            }
        }

        // 1. Bulk Insert Database Notifications
        if (notificationsToCreate.length > 0) {
            Notification.bulkCreate(notificationsToCreate).catch(err => logger.error('Bulk notification error:', err));
        }

        // 2. Trigger Emails concurrently in background
        Promise.allSettled(emailPromises);

    } catch (error) {
        logger.error('Error in notifyRoles:', error);
    }
};

export const getNotifications = async (userId) => {
    return await Notification.findAll({
        where: { user_id: userId },
        attributes: ['id', 'title', 'message', 'type', 'is_read', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: 50
    });
};

export const markRead = async (id, userId) => {
    const notif = await Notification.findOne({ where: { id, user_id: userId } });
    if (notif) {
        await notif.update({ is_read: true });
    }
    return notif;
};

export const markAllRead = async (userId) => {
    return await Notification.update({ is_read: true }, { where: { user_id: userId, is_read: false } });
};
