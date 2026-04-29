import db from '../../models/index.js';
import * as s3Service from '../../services/s3.service.js';

const { CertificateTemplate } = db;

export const createTemplate = async (data) => {
    return await CertificateTemplate.create({
        template_name: data.template_name,
        certificate_type_id: data.certificate_type_id,
        certificate_term: data.certificate_term ?? null,
        template_file_url: data.template_file_url,
        variables: data.variables || [],
        is_active: data.is_active !== false
    });
};

/**
 * Generate a pre-signed S3 PUT URL so admin can upload a certificate
 * template DOCX directly to S3. The returned `fileKey` should then be sent
 * back as `template_file_url` on
 *   POST /api/v1/certificate-templates  (create)
 *   PUT  /api/v1/certificate-templates/:id  (update)
 */
export const getUploadUrl = async (fileName, contentType) => {
    const key = `certificate-templates/${Date.now()}_${fileName}`;
    const uploadUrl = await s3Service.getUploadSignedUrl(key, contentType);
    return { uploadUrl, fileKey: key };
};

export const getTemplates = async (filters = {}) => {
    const where = {};
    if (filters.is_active !== undefined) where.is_active = filters.is_active;
    if (filters.certificate_type_id) where.certificate_type_id = filters.certificate_type_id;
    if (filters.certificate_term) where.certificate_term = filters.certificate_term;

    return await CertificateTemplate.findAll({
        where,
        include: ['CertificateType']
    });
};

export const getTemplateById = async (id) => {
    const template = await CertificateTemplate.findByPk(id, {
        include: ['CertificateType']
    });
    if (!template) throw { statusCode: 404, message: 'Template not found' };
    return template;
};

export const updateTemplate = async (id, data) => {
    const template = await CertificateTemplate.findByPk(id);
    if (!template) throw { statusCode: 404, message: 'Template not found' };

    return await template.update(data);
};

export const deleteTemplate = async (id) => {
    const template = await CertificateTemplate.findByPk(id);
    if (!template) throw { statusCode: 404, message: 'Template not found' };

    await template.destroy();
    return { message: 'Template deleted successfully' };
};
