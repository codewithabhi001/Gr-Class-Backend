import db from '../../models/index.js';
import * as s3Service from '../../services/s3.service.js';
import * as fileAccessService from '../../services/fileAccess.service.js';

const { CertificateTemplate } = db;

const addFilenameToTemplate = (template) => {
    if (!template) return template;
    
    const processSingle = (tpl) => {
        if (!tpl || !tpl.template_file_url) return tpl;
        const key = fileAccessService.getKeyFromUrl(tpl.template_file_url);
        if (key) {
            const fullFileName = key.split('/').pop();
            const cleanFileName = fullFileName.replace(/^[0-9]+_/, '');
            tpl.template_file_name = fullFileName;
            tpl.original_file_name = cleanFileName;
        }
        return tpl;
    };

    if (Array.isArray(template)) {
        return template.map(processSingle);
    }
    return processSingle(template);
};

export const createTemplate = async (data) => {
    const template = await CertificateTemplate.create({
        template_name: data.template_name,
        certificate_type_id: data.certificate_type_id,
        certificate_term: data.certificate_term ?? null,
        template_file_url: data.template_file_url,
        variables: data.variables || [],
        is_active: data.is_active !== false
    });
    const resolved = await fileAccessService.resolveEntity(template);
    return addFilenameToTemplate(resolved);
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

    const templates = await CertificateTemplate.findAll({
        where,
        include: ['CertificateType']
    });
    const resolved = await fileAccessService.resolveEntity(templates);
    return addFilenameToTemplate(resolved);
};

export const getTemplateById = async (id) => {
    const template = await CertificateTemplate.findByPk(id, {
        include: ['CertificateType']
    });
    if (!template) throw { statusCode: 404, message: 'Template not found' };
    const resolved = await fileAccessService.resolveEntity(template);
    return addFilenameToTemplate(resolved);
};

export const updateTemplate = async (id, data) => {
    const template = await CertificateTemplate.findByPk(id);
    if (!template) throw { statusCode: 404, message: 'Template not found' };

    const updated = await template.update(data);
    const resolved = await fileAccessService.resolveEntity(updated);
    return addFilenameToTemplate(resolved);
};

export const deleteTemplate = async (id) => {
    const template = await CertificateTemplate.findByPk(id);
    if (!template) throw { statusCode: 404, message: 'Template not found' };

    await template.destroy();
    return { message: 'Template deleted successfully' };
};
