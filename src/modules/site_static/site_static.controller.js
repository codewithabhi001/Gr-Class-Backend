import * as siteStaticService from './site_static.service.js';

const isAdmin = (user) => user && user.role === 'ADMIN';

export const list = async (req, res, next) => {
    try {
        const data = await siteStaticService.list({ forAdmin: isAdmin(req.user) });
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const getOne = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const row = await siteStaticService.getBySlug(slug, { forAdmin: isAdmin(req.user) });
        if (!row) {
            return res.status(404).json({ success: false, message: 'Not found.' });
        }
        res.status(200).json({ success: true, data: row });
    } catch (error) {
        next(error);
    }
};

export const create = async (req, res, next) => {
    try {
        const row = await siteStaticService.create(req.body, req.user.id);
        res.status(201).json({ success: true, message: 'Created.', data: row });
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const row = await siteStaticService.updateBySlug(slug, req.body, req.user.id);
        res.status(200).json({ success: true, message: 'Updated.', data: row });
    } catch (error) {
        next(error);
    }
};

export const remove = async (req, res, next) => {
    try {
        const { slug } = req.params;
        await siteStaticService.removeBySlug(slug);
        res.status(200).json({ success: true, message: 'Deleted.' });
    } catch (error) {
        next(error);
    }
};
