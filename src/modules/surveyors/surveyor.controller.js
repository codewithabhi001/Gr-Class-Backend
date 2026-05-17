import * as surveyorService from './surveyor.service.js';
import * as fileAccessService from '../../services/fileAccess.service.js';

export const applySurveyor = async (req, res, next) => {
    try {
        // Enforce 2MB size limit per document for multipart/form-data file uploads
        if (req.files) {
            const limit = 2 * 1024 * 1024; // 2MB
            if (req.files.cv && req.files.cv[0] && req.files.cv[0].size > limit) {
                throw { statusCode: 400, message: 'CV file size exceeds the limit of 2MB.' };
            }
            if (req.files.id_proof && req.files.id_proof[0] && req.files.id_proof[0].size > limit) {
                throw { statusCode: 400, message: 'ID Proof file size exceeds the limit of 2MB.' };
            }
            if (req.files.certificates) {
                const certFiles = Array.isArray(req.files.certificates) ? req.files.certificates : [req.files.certificates];
                for (const file of certFiles) {
                    if (file.size > limit) {
                        throw { statusCode: 400, message: 'Certificate file size exceeds the limit of 2MB.' };
                    }
                }
            }
        }
        const application = await surveyorService.applySurveyor(req.body, req.files);
        res.status(201).json({
            success: true,
            message: 'Surveyor application submitted successfully',
            data: application
        });
    } catch (error) { next(error); }
};

export const getApplications = async (req, res, next) => {
    try {
        const result = await surveyorService.getApplications(req.query, req.user);
        res.json({
            success: true,
            message: 'Applications fetched successfully',
            data: result
        });
    } catch (error) { next(error); }
};

export const reviewApplication = async (req, res, next) => {
    try {
        const { status, remarks } = req.body;
        const result = await surveyorService.reviewApplication(req.params.id, status, remarks, req.user.id);
        res.json({
            success: true,
            message: `Application ${status.toLowerCase()} successfully`,
            data: result
        });
    } catch (error) { next(error); }
};

export const getProfile = async (req, res, next) => {
    try {
        const profile = await surveyorService.getProfile(req.params.id, req.user);
        res.json({
            success: true,
            message: 'Profile fetched successfully',
            data: profile
        });
    } catch (error) { next(error); }
};

export const updateProfile = async (req, res, next) => {
    try {
        const profile = await surveyorService.updateProfile(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: profile
        });
    } catch (error) { next(error); }
};

export const createSurveyor = async (req, res, next) => {
    try {
        const result = await surveyorService.createSurveyor(req.body);
        res.status(201).json({
            success: true,
            message: 'Surveyor created successfully',
            data: result
        });
    } catch (error) { next(error); }
};

export const updateAvailability = async (req, res, next) => {
    try {
        const profile = await surveyorService.updateAvailability(req.user.id, req.body.is_available);
        res.json({ success: true, data: profile });
    } catch (e) { next(e); }
};

export const reportLocation = async (req, res, next) => {
    try {
        const result = await surveyorService.reportLocation(req.user.id, req.body);
        res.json({ success: true, data: result });
    } catch (e) { next(e); }
};

export const getGPSHistory = async (req, res, next) => {
    try {
        const history = await surveyorService.getGPSHistory(req.params.id);
        res.json({ success: true, data: history });
    } catch (e) { next(e); }
};

export const getSurveyors = async (req, res, next) => {
    try {
        const result = await surveyorService.getSurveyors(req.query, req.user);
        res.json({
            success: true,
            message: 'Surveyors fetched successfully',
            data: result
        });
    } catch (error) { next(error); }
};

export const updateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const result = await surveyorService.updateStatus(req.params.id, status);
        res.json({
            success: true,
            message: `Surveyor status updated to ${status}`,
            data: result
        });
    } catch (error) { next(error); }
};

export const getUploadUrls = async (req, res, next) => {
    try {
        const result = await surveyorService.getUploadUrls(req.query);
        res.json({ success: true, data: result });
    } catch (e) { next(e); }
};

export const getApplication = async (req, res, next) => {
    try {
        const result = await surveyorService.getApplication(req.params.id, req.user);
        res.json({ success: true, message: 'Application details fetched successfully', data: result });
    } catch (error) { next(error); }
};

