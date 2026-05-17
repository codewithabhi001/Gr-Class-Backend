import db from '../../models/index.js';
import * as fileAccessService from '../../services/fileAccess.service.js';

// Helper to resolve model instance
const getContentByKey = async (key) => {
    return await db.SiteStaticContent.findOne({ where: { key } });
};

// 1. FAQ Endpoint
export const getFaq = async (req, res, next) => {
    try {
        const record = await getContentByKey('faq');
        if (!record) return res.status(404).json({ success: false, message: 'FAQ content not found.' });
        res.status(200).json({ success: true, data: await fileAccessService.resolveEntity(record) });
    } catch (error) {
        next(error);
    }
};

// 2. NEWS Endpoint
export const getNews = async (req, res, next) => {
    try {
        const record = await getContentByKey('news');
        if (!record) return res.status(404).json({ success: false, message: 'News content not found.' });
        // Return array directly to keep backwards compatibility with list payload
        res.status(200).json({ success: true, data: await fileAccessService.resolveEntity(record.news_items || []) });
    } catch (error) {
        next(error);
    }
};

// 3. Privacy Endpoint
export const getPrivacy = async (req, res, next) => {
    try {
        const record = await getContentByKey('privacy');
        if (!record) return res.status(404).json({ success: false, message: 'Privacy policy not found.' });
        res.status(200).json({ success: true, data: await fileAccessService.resolveEntity(record) });
    } catch (error) {
        next(error);
    }
};

// 4. Terms and Compliance Endpoint
export const getTerms = async (req, res, next) => {
    try {
        const record = await getContentByKey('terms-compliance');
        if (!record) return res.status(404).json({ success: false, message: 'Terms and compliance content not found.' });
        res.status(200).json({ success: true, data: await fileAccessService.resolveEntity(record) });
    } catch (error) {
        next(error);
    }
};

// 5. About Us Endpoint
export const getAboutUs = async (req, res, next) => {
    try {
        const record = await getContentByKey('about-us');
        if (!record) return res.status(404).json({ success: false, message: 'About Us content not found.' });
        res.status(200).json({ success: true, data: await fileAccessService.resolveEntity(record) });
    } catch (error) {
        next(error);
    }
};

// Admin Update Endpoint
export const updateContent = async (req, res, next) => {
    try {
        const { key } = req.params;
        const record = await getContentByKey(key);
        if (!record) {
            return res.status(404).json({ success: false, message: `Static content for key '${key}' not found.` });
        }

        const { title, body_html, faq_items, news_items } = req.body;

        if (title !== undefined) record.title = title;
        if (body_html !== undefined) record.body_html = body_html;
        if (faq_items !== undefined) record.faq_items = faq_items;
        if (news_items !== undefined) record.news_items = news_items;

        await record.save();

        res.status(200).json({ success: true, message: 'Content updated successfully.', data: await fileAccessService.resolveEntity(record) });
    } catch (error) {
        next(error);
    }
};

export const createContent = async (req, res, next) => {
    try {
        const { key, title, body_html, faq_items, news_items } = req.body;
        const existing = await getContentByKey(key);
        if (existing) {
            return res.status(400).json({ success: false, message: `Content with key '${key}' already exists.` });
        }
        const record = await db.SiteStaticContent.create({
            key,
            title,
            body_html,
            faq_items,
            news_items
        });
        res.status(201).json({ success: true, message: 'Content created successfully.', data: await fileAccessService.resolveEntity(record) });
    } catch (error) {
        next(error);
    }
};
