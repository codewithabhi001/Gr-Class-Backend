import * as NewsletterService from './newsletter.service.js';
import { extractUnsubscribeTokenFromRequest } from './newsletter-unsubscribe.util.js';
import env from '../../config/env.js';

export const unsubscribeOneClickGet = async (req, res, next) => {
    try {
        const token = extractUnsubscribeTokenFromRequest(req);
        const result = await NewsletterService.unsubscribeByToken(token);
        
        res.setHeader('Content-Type', 'text/html');
        if (!result.ok) {
            return res.send(`
                <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
                    <h2 style="color: #dc2626;">Invalid or Expired Link</h2>
                    <p>We could not process your unsubscribe request because the link is no longer valid.</p>
                </div>
            `);
        }
        return res.send(`
            <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
                <h2 style="color: #059669;">Unsubscribed Successfully</h2>
                <p>You have been removed from our mailing list and will no longer receive these emails.</p>
                <script>setTimeout(() => window.close(), 3000);</script>
            </div>
        `);
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
