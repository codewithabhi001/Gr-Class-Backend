import db from '../../models/index.js';
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
