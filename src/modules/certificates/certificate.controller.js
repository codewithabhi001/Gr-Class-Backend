import * as certService from './certificate.service.js';

export const generateCertificate = async (req, res, next) => {
    try {
        const cert = await certService.generateCertificate(req.body, req.user);
        res.status(201).json({
            success: true,
            message: 'Certificate generated successfully',
            data: cert
        });
    } catch (error) { next(error); }
};

export const getCertificates = async (req, res, next) => {
    try {
        const certs = await certService.getCertificates(req.query, req.user);
        res.json({
            success: true,
            message: 'Certificates fetched successfully',
            data: certs
        });
    } catch (error) { next(error); }
};

export const getCertificatesByVessel = async (req, res, next) => {
    try {
        const certs = await certService.getCertificatesByVessel(req.params.vesselId, req.user);
        res.json({
            success: true,
            message: 'Vessel certificates fetched successfully',
            data: certs
        });
    } catch (error) { next(error); }
};

export const getCertificateByJobId = async (req, res, next) => {
    try {
        const cert = await certService.getCertificateByJobId(req.params.jobId, req.user);
        res.json({
            success: true,
            message: 'Certificate for job fetched successfully',
            data: cert
        });
    } catch (error) { next(error); }
};

export const getCertificateById = async (req, res, next) => {
    try {
        const cert = await certService.getCertificateById(req.params.id, req.user);
        res.json({
            success: true,
            message: 'Certificate details fetched successfully',
            data: cert
        });
    } catch (error) { next(error); }
};

import * as fileAccessService from '../../services/fileAccess.service.js';

export const downloadCertificate = async (req, res, next) => {
    try {
        const cert = await certService.getCertificateById(req.params.id, req.user);
        if (cert.pdf_file_url) {
            const process = await fileAccessService.processFileAccess({ file_url: cert.pdf_file_url }, req.user);
            // If processFileAccess returns a signedUrl (which it does for both CDN and S3), redirect to it.
            if (process.signedUrl) {
                return res.redirect(302, process.signedUrl);
            }
        }
        res.status(404).json({
            success: false,
            message: 'Certificate PDF is not available for download yet.'
        });
    } catch (error) { next(error); }
};

export const suspendCertificate = async (req, res, next) => {
    try {
        const result = await certService.updateStatus(req.params.id, 'SUSPENDED', req.body.reason, req.user.id);
        res.json({
            success: true,
            message: 'Certificate suspended successfully',
            data: result
        });
    } catch (error) { next(error); }
};

export const revokeCertificate = async (req, res, next) => {
    try {
        const result = await certService.updateStatus(req.params.id, 'REVOKED', req.body.reason, req.user.id);
        res.json({
            success: true,
            message: 'Certificate revoked successfully',
            data: result
        });
    } catch (error) { next(error); }
};

export const restoreCertificate = async (req, res, next) => {
    try {
        const result = await certService.updateStatus(req.params.id, 'VALID', req.body.reason, req.user.id);
        res.json({
            success: true,
            message: 'Certificate restored successfully',
            data: result
        });
    } catch (error) { next(error); }
};

export const renewCertificate = async (req, res, next) => {
    try {
        const { validity_years, reason } = req.body;
        const result = await certService.renewCertificate(req.params.id, validity_years, reason, req.user.id);
        res.json({
            success: true,
            message: 'Certificate renewed successfully',
            data: result
        });
    } catch (error) { next(error); }
};

export const updateDraft = async (req, res, next) => {
    try {
        const result = await certService.updateDraft(req.params.id, req.body, req.user);
        res.json({
            success: true,
            message: 'Draft updated successfully',
            data: result
        });
    } catch (error) { next(error); }
};

export const issueCertificate = async (req, res, next) => {
    try {
        if (req.body && Object.keys(req.body).length > 0) {
            await certService.updateDraft(req.params.id, req.body, req.user);
        }
        const result = await certService.issueCertificate(req.params.id, req.user);
        res.json({
            success: true,
            message: 'Certificate issued successfully',
            data: result
        });
    } catch (error) { next(error); }
};

export const reissueCertificate = async (req, res, next) => {
    try {
        const result = await certService.reissueCertificate(req.params.id, req.body.reason, req.user.id);
        res.json({
            success: true,
            message: 'Certificate reissued. New draft created.',
            data: result
        });
    } catch (error) { next(error); }
};

export const getCertificateUploadUrl = async (req, res, next) => {
    try {
        const { fileName, contentType } = req.query;
        if (!fileName || !contentType) {
            return res.status(400).json({ success: false, message: 'fileName and contentType are required' });
        }
        const result = await certService.getCertificateUploadUrl(fileName, contentType);
        res.json({ success: true, data: result });
    } catch (error) { next(error); }
};

export const uploadExternalCertificate = async (req, res, next) => {
    try {
        const result = await certService.uploadExternalCertificate(req.params.vesselId, req.body, req.user.id);
        res.status(201).json({
            success: true,
            message: 'External certificate uploaded successfully',
            data: result
        });
    } catch (error) { next(error); }
};

export const previewCertificate = async (req, res, next) => {
    try {
        const result = await certService.previewCertificate(req.params.id, req.user);
        res.json({
            success: true,
            message: 'Certificate preview data fetched',
            data: result
        });
    } catch (error) { next(error); }
};


export const getHistory = async (req, res, next) => {
    try {
        const history = await certService.getHistory(req.params.id, req.user);
        res.json({
            success: true,
            message: 'Certificate history fetched',
            data: history
        });
    } catch (error) { next(error); }
};

export const transferCertificate = async (req, res, next) => {
    try {
        const result = await certService.transferCertificate(req.params.id, req.body.newOwnerId, req.body.reason, req.user.id);
        res.json({
            success: true,
            message: 'Certificate transferred successfully',
            data: result
        });
    } catch (error) { next(error); }
};

export const extendCertificate = async (req, res, next) => {
    try {
        const result = await certService.extendCertificate(req.params.id, req.body.extensionMonths, req.body.reason, req.user.id);
        res.json({
            success: true,
            message: 'Certificate extension applied successfully',
            data: result
        });
    } catch (error) { next(error); }
};

export const downgradeCertificate = async (req, res, next) => {
    try {
        const result = await certService.downgradeCertificate(req.params.id, req.body.newTypeId, req.body.reason, req.user.id);
        res.json({
            success: true,
            message: 'Certificate downgraded successfully',
            data: result
        });
    } catch (error) { next(error); }
};

export const getCertificateTypes = async (req, res, next) => {
    try {
        const includeInactive = req.query.include_inactive === 'true' && ['ADMIN', 'GM'].includes(req.user?.role);
        const search = req.query.search;
        const types = await certService.getCertificateTypes({ includeInactive, search });
        res.json({ success: true, data: types });
    } catch (e) { next(e); }
};

export const getCertificateTypeById = async (req, res, next) => {
    try {
        const type = await certService.getCertificateTypeById(req.params.id);
        res.json({ success: true, data: type });
    } catch (e) { next(e); }
};

export const createCertificateType = async (req, res, next) => {
    try {
        const type = await certService.createCertificateType(req.body);
        res.status(201).json({ success: true, message: 'Certificate type created', data: type });
    } catch (e) { next(e); }
};

export const updateCertificateType = async (req, res, next) => {
    try {
        const type = await certService.updateCertificateType(req.params.id, req.body);
        res.json({ success: true, message: 'Certificate type updated', data: type });
    } catch (e) { next(e); }
};

export const getCertificateTypeRequiredDocuments = async (req, res, next) => {
    try {
        const docs = await certService.getCertificateTypeRequiredDocuments(req.params.id);
        res.json({ success: true, data: docs });
    } catch (e) { next(e); }
};

export const addCertificateTypeRequiredDocument = async (req, res, next) => {
    try {
        const doc = await certService.addCertificateTypeRequiredDocument(req.params.id, req.body);
        res.status(201).json({ success: true, message: 'Required document added', data: doc });
    } catch (e) { next(e); }
};

export const updateCertificateTypeRequiredDocument = async (req, res, next) => {
    try {
        const doc = await certService.updateCertificateTypeRequiredDocument(req.params.id, req.params.docId, req.body);
        res.json({ success: true, message: 'Required document updated', data: doc });
    } catch (e) { next(e); }
};

export const deleteCertificateTypeRequiredDocument = async (req, res, next) => {
    try {
        const result = await certService.deleteCertificateTypeRequiredDocument(req.params.id, req.params.docId);
        res.json({ success: true, message: 'Required document deleted', data: result });
    } catch (e) { next(e); }
};

export const bulkRenew = async (req, res, next) => {
    try {
        const result = await certService.bulkRenew(req.body.ids, req.body.validity_years, req.body.reason, req.user.id);
        res.json({ success: true, data: result });
    } catch (e) { next(e); }
};

export const verifyCertificate = async (req, res, next) => {
    try {
        const result = await certService.verifyCertificate(req.params.number);
        res.json({ success: true, data: result });
    } catch (e) { next(e); }
};
