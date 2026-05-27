import * as ncService from './nc.service.js';

export const createNC = async (req, res, next) => {
    try {
        const nc = await ncService.createNC(req.body, req.user);
        res.status(201).json({ success: true, data: nc });
    } catch (error) {
        next(error);
    }
};

export const closeNC = async (req, res, next) => {
    try {
        const nc = await ncService.closeNC(req.params.id, req.body.closure_remarks);
        res.json({ success: true, data: nc });
    } catch (error) {
        next(error);
    }
};


export const getNCs = async (req, res, next) => {
    try {
        const result = await ncService.getNCs(req.query);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getNCById = async (req, res, next) => {
    try {
        const nc = await ncService.getNCById(req.params.id);
        res.json({ success: true, data: nc });
    } catch (error) {
        next(error);
    }
};

export const getByJob = async (req, res, next) => {
    try {
        const list = await ncService.getByJob(req.params.jobId, req.query.job_certificate_id || null);
        res.json({ success: true, data: list });
    } catch (error) {
        next(error);
    }
};

