import * as flagService from './flag.service.js';
import * as cache from '../../services/cache.service.js';

export const createFlag = async (req, res, next) => {
    try {
        const flag = await flagService.createFlag(req.body);
        await cache.invalidatePattern('flag:*');
        await cache.del('flag:list:all');
        res.status(201).json({ success: true, data: flag });
    } catch (error) { next(error); }
};

export const getFlags = async (req, res, next) => {
    try {
        const search = req.query.search;
        const list = await flagService.getFlags(search);
        res.json({ success: true, data: list });
    } catch (error) { next(error); }
};

export const getFlag = async (req, res, next) => {
    try {
        const flag = await flagService.getFlag(req.params.id);
        res.json({ success: true, data: flag });
    } catch (error) { next(error); }
};  

export const updateFlag = async (req, res, next) => {
    try {
        const flag = await flagService.updateFlag(req.params.id, req.body);
        await cache.invalidatePattern('flag:*');
        await cache.del('flag:list:all');
        await cache.del(`flag:detail:${req.params.id}`);
        res.json({ success: true, data: flag });
    } catch (error) { next(error); }
};

export const updateFlagStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!status || !['ACTIVE', 'INACTIVE'].includes(status.toUpperCase())) {
            return res.status(400).json({ success: false, message: 'Status must be ACTIVE or INACTIVE' });
        }
        const flag = await flagService.updateFlag(req.params.id, { status: status.toUpperCase() });
        await cache.invalidatePattern('flag:*');
        await cache.del('flag:list:all');
        await cache.del(`flag:detail:${req.params.id}`);
        res.json({ success: true, data: flag });
    } catch (error) { next(error); }
};

export const deleteFlag = async (req, res, next) => {
    try {
        const result = await flagService.deleteFlag(req.params.id);
        await cache.invalidatePattern('flag:*');
        await cache.del('flag:list:all');
        await cache.del(`flag:detail:${req.params.id}`);
        res.json({ success: true, ...result });
    } catch (error) { next(error); }
};
