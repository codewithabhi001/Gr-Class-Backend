import * as NewsletterService from './newsletter.service.js';
import { extractUnsubscribeTokenFromRequest } from './newsletter-unsubscribe.util.js';
import env from '../../config/env.js';

/** Same as POST: no HTML page — Gmail uses POST; GET is for rare client follow-ups. */
export const unsubscribeOneClickGet = async (req, res, next) => {
    try {
        const token = extractUnsubscribeTokenFromRequest(req);
        const result = await NewsletterService.unsubscribeByToken(token);
        
        const redirectBase = env.newsletterUnsubscribeUrl;
        if (!result.ok) {
            return res.redirect(`${redirectBase}?status=error&message=invalid_token`);
        }
        return res.redirect(`${redirectBase}?status=success`);
    } catch (error) {
        next(error);
    }
};

/**
 * RFC 8058: Gmail sends POST with body List-Unsubscribe=One-Click to the same HTTPS URL as in List-Unsubscribe.
 * CORS must allow https://mail.google.com or the browser never sends this POST.
 */
export const unsubscribeOneClickPost = async (req, res, next) => {
    try {
        const token = extractUnsubscribeTokenFromRequest(req);
        const result = await NewsletterService.unsubscribeByToken(token);
        if (!result.ok) {
            return res.status(400).end();
        }
        return res.status(204).end();
    } catch (error) {
        next(error);
    }
};

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

export const broadcast = async (req, res, next) => {
    try {
        const { emails, subject, message } = req.body;
        const result = await NewsletterService.broadcastMessage(emails, subject, message);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};
