import db from '../../models/index.js';

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

export const getTemplates = async (filters = {}) => {
    const where = {};
    if (filters.is_active !== undefined) where.is_active = filters.is_active;
    if (filters.certificate_type_id) where.certificate_type_id = filters.certificate_type_id;
    if (filters.certificate_term) where.certificate_term = filters.certificate_term;

    return await CertificateTemplate.findAll({
        where,
        attributes: { exclude: ['variables'] }, // Show less detail in list view
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
