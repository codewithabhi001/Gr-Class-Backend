import db from '../../models/index.js';
import env from '../../config/env.js';
import emailService from '../../services/email.service.js';
import logger from '../../utils/logger.js';
import { createNewsletterUnsubscribeToken, verifyNewsletterUnsubscribeToken } from '../../utils/newsletter-unsubscribe-token.util.js';

const NewsletterSubscriber = db.NewsletterSubscriber;

/** RFC 8058 one-click URL (HTTPS in prod). Gmail POSTs here with List-Unsubscribe=One-Click. */
const buildOneClickUnsubscribeUrl = (email) => {
    const token = createNewsletterUnsubscribeToken(email);
    const base = env.publicApiBaseUrl.replace(/\/$/, '');
    return `${base}/api/v1/website/newsletter/unsubscribe-one-click?token=${encodeURIComponent(token)}`;
};

export const subscribe = async (email, source = 'website') => {
    const trimmedEmail = String(email || '').trim().toLowerCase();
    
    // Check if already subscribed
    const existing = await NewsletterSubscriber.findOne({ where: { email: trimmedEmail } });
    
    if (existing) {
        if (existing.is_active) {
            return { message: 'You are already subscribed to our newsletter.', already_active: true };
        } else {
            // Re-activate
            await existing.update({ is_active: true, unsubscribed_at: null, source: source || existing.source });
            return { message: 'Subscription re-activated successfully.', re_activated: true };
        }
    }

    const subscriber = await NewsletterSubscriber.create({
        email: trimmedEmail,
        source: source || 'website',
        is_active: true,
        subscribed_at: new Date()
    });

    return { 
        message: 'Subscribed to newsletter successfully.', 
        subscriber: { 
            id: subscriber.id, 
            email: subscriber.email, 
            subscribed_at: subscriber.subscribed_at 
        } 
    };
};

export const unsubscribe = async (email) => {
    const trimmedEmail = String(email || '').trim().toLowerCase();

    const [affected] = await NewsletterSubscriber.update(
        { is_active: false, unsubscribed_at: new Date() },
        { where: { email: trimmedEmail } }
    );

    if (affected === 0) {
        return { message: 'Email not found or already unsubscribed.' };
    }

    return { message: 'Successfully unsubscribed from newsletter.' };
};

/**
 * Used by GET/POST one-click (RFC 8058). Invalid token → ok: false.
 */
export const unsubscribeByToken = async (token) => {
    const email = verifyNewsletterUnsubscribeToken(token);
    if (!email) return { ok: false };

    const [affected] = await NewsletterSubscriber.update(
        { is_active: false, unsubscribed_at: new Date() },
        { where: { email } }
    );

    if (affected === 0) {
        logger.warn(`[Newsletter] One-click: valid token but no DB row for ${email} — check broadcast list vs subscribers table`);
    } else {
        logger.info(`[Newsletter] One-click unsubscribed ${email} (rows=${affected})`);
    }

    return { ok: true };
};

export const listSubscribers = async () => {
    return await NewsletterSubscriber.findAll({
        attributes: ['email', 'is_active', 'subscribed_at', 'source'],
        order: [['subscribed_at', 'DESC']]
    });
};

export const broadcastMessage = async (emails, subject, message) => {
    if (!Array.isArray(emails) || emails.length === 0) {
        throw { statusCode: 400, message: 'No recipients specified.' };
    }

    let sent = 0;
    let failed = 0;

    for (const raw of emails) {
        const email = String(raw || '').trim().toLowerCase();
        if (!email) {
            failed++;
            continue;
        }

        const oneClickUrl = buildOneClickUnsubscribeUrl(email);
        const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #1a365d;">Girik Class Updates</h2>
            <div style="line-height: 1.6; color: #333;">
                ${message.replace(/\n/g, '<br>')}
            </div>
        </div>
    `;

        const ok = await emailService.sendEmail(email, subject, htmlBody, 'subscribe', {
            headers: {
                // RFC 2919 — Gmail uses this for the list name in the unsubscribe popup (not "(Unknown)")
                'List-Id': env.newsletterListId,
                'List-Unsubscribe': `<${oneClickUrl}>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
                Precedence: 'bulk'
            }
        });

        if (ok) sent++;
        else failed++;
    }

    const success = failed === 0 && sent > 0;

    return {
        success,
        recipient_count: emails.length,
        sent_count: sent,
        failed_count: failed,
        message: success
            ? 'Newsletter broadcasted successfully.'
            : sent > 0
                ? `Partially sent: ${sent} ok, ${failed} failed.`
                : 'Failed to send newsletter emails.'
    };
};

