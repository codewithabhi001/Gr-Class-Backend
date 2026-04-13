import db from '../../models/index.js';
import * as s3Service from '../../services/s3.service.js';
import * as fileAccessService from '../../services/fileAccess.service.js';
import logger from '../../utils/logger.js';

export const getAuthorities = async (req, res, next) => {
    try {
        const authorities = await db.CertificateAuthority.findAll({
            where: { status: 'ACTIVE' },
            attributes: ['id', 'name', 'code', 'country', 'logo_url', 'status'],
            order: [['name', 'ASC']]
        });
        const resolved = await fileAccessService.resolveEntity(authorities, req.user);
        res.json({ success: true, count: authorities.length, data: resolved });
    } catch (err) {
        next(err);
    }
};

export const createAuthority = async (req, res, next) => {
    try {
        const authority = await db.CertificateAuthority.create(req.body);
        const resolved = await fileAccessService.resolveEntity(authority, req.user);
        res.status(201).json({ success: true, data: resolved });
    } catch (err) {
        next(err);
    }
};

export const getAuthorityById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const authority = await db.CertificateAuthority.findByPk(id);
        if (!authority) {
            return res.status(404).json({ success: false, message: 'Authority not found' });
        }
        const resolved = await fileAccessService.resolveEntity(authority, req.user);
        res.json({ success: true, data: resolved });
    } catch (err) {
        next(err);
    }
};

export const updateAuthority = async (req, res, next) => {
    try {
        const { id } = req.params;
        const authority = await db.CertificateAuthority.findByPk(id);
        if (!authority) {
            return res.status(404).json({ success: false, message: 'Authority not found' });
        }
        await authority.update(req.body);
        const resolved = await fileAccessService.resolveEntity(authority, req.user);
        res.json({ success: true, data: resolved });
    } catch (err) {
        next(err);
    }
};

export const deleteAuthority = async (req, res, next) => {
    try {
        const { id } = req.params;
        const authority = await db.CertificateAuthority.findByPk(id);
        if (!authority) {
            return res.status(404).json({ success: false, message: 'Authority not found' });
        }
        // Soft delete
        await authority.update({ status: 'INACTIVE' });
        res.json({ success: true, message: 'Authority deactivated' });
    } catch (err) {
        next(err);
    }
};

/**
 * Get S3 Upload URL for Authority Logo
 */
export const getLogoUploadUrl = async (req, res, next) => {
    try {
        const { fileName, contentType } = req.query;
        if (!fileName || !contentType) {
            return res.status(400).json({ success: false, message: 'fileName and contentType are required' });
        }

        const key = s3Service.generateKey(fileName, 'authorities/logos');
        const uploadUrl = await s3Service.getUploadSignedUrl(key, contentType);

        res.json({
            success: true,
            data: {
                uploadUrl,
                key,
                expiresIn: 3600
            }
        });
    } catch (err) {
        next(err);
    }
};
