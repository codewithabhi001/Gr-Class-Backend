import * as NewsletterService from './newsletter.service.js';

export const subscribe = async (req, res, next) => {
    try {
        const { email, source } = req.body;
        const result = await NewsletterService.subscribe(email, source);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const unsubscribe = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await NewsletterService.unsubscribe(email);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const listSubscribers = async (req, res, next) => {
    try {
        const subscribers = await NewsletterService.listSubscribers();
        res.status(200).json({ success: true, data: subscribers });
    } catch (error) {
        next(error);
    }
};
