import db from '../../models/index.js';
import emailService from '../../services/email.service.js';
const NewsletterSubscriber = db.NewsletterSubscriber;

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
    const subscriber = await NewsletterSubscriber.findOne({ where: { email: trimmedEmail } });

    if (!subscriber || !subscriber.is_active) {
        return { message: 'Email not found or already unsubscribed.' };
    }

    await subscriber.update({
        is_active: false,
        unsubscribed_at: new Date()
    });

    return { message: 'Successfully unsubscribed from newsletter.' };
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

    const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #1a365d;">Girik Class Updates</h2>
            <div style="line-height: 1.6; color: #333;">
                ${message.replace(/\n/g, '<br>')}
            </div>
            <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999; text-align: center;">
                You received this email because you subscribed to Girik Class newsletter.<br>
                To unsubscribe, please visit our website.
            </p>
        </div>
    `;

    // Send in batches or one by one (Service's sendEmail handles array of recipients as BCC/Comma-separated)
    // Note: SES has limits on CC/BCC count, so we'll send to each individually for personalization if needed, 
    // but here we use the service's array support.
    const success = await emailService.sendEmail(emails, subject, htmlBody, 'notification');
    
    return { 
        success, 
        recipient_count: emails.length,
        message: success ? 'Newsletter broadcasted successfully.' : 'Failed to send some or all emails.'
    };
};

