import db from '../../models/index.js';

const ChecklistTemplate = db.ChecklistTemplate;
const CertificateType = db.CertificateType;
const JobRequest = db.JobRequest;

/**
 * Create a new checklist template
 */
export const createChecklistTemplate = async (data, userId) => {
    return await ChecklistTemplate.create({
        name: data.name,
        code: data.code,
        description: data.description,
        sections: data.sections,
        certificate_type_id: data.certificate_type_id,
        status: data.status || 'DRAFT',
        metadata: data.metadata || {},
        created_by: userId,
        updated_by: userId
    });
};

/**
 * Get all checklist templates with optional filters
 */
export const getChecklistTemplates = async (filters = {}) => {
    const where = {};

    if (filters.status) where.status = filters.status;
    if (filters.certificate_type_id) where.certificate_type_id = filters.certificate_type_id;
    if (filters.code) where.code = filters.code;

    return await ChecklistTemplate.findAll({
        where,
        attributes: { exclude: ['sections', 'metadata'] }, // Exclude heavy JSON fields for list view
        include: [
            {
                model: CertificateType,
                as: 'CertificateType',
                attributes: ['id', 'name', 'issuing_authority']
            },
            {
                model: db.User,
                as: 'Creator',
                attributes: ['id', 'name', 'email']
            }
        ],
        order: [['created_at', 'DESC']]
    });
};

/**
 * Get a specific checklist template by ID
 */
export const getChecklistTemplateById = async (id) => {
    const template = await ChecklistTemplate.findByPk(id, {
        include: [
            {
                model: CertificateType,
                as: 'CertificateType',
                attributes: ['id', 'name', 'issuing_authority', 'description']
            },
            {
                model: db.User,
                as: 'Creator',
                attributes: ['id', 'name', 'email']
            },
            {
                model: db.User,
                as: 'Updater',
                attributes: ['id', 'name', 'email']
            }
        ]
    });

    if (!template) {
        throw { statusCode: 404, message: 'Checklist template not found' };
    }

    return template;
};

/**
 * Get checklist template for a specific job
 * This is what surveyors will use to know what questions to answer
 */
export const getChecklistTemplateForJob = async (jobId) => {
    // Get job with certificate type
    const job = await JobRequest.findByPk(jobId, {
        include: ['CertificateType']
    });
    console.log(job);
    if (!job) {
        throw { statusCode: 404, message: 'Job not found' };
    }

    // Find active checklist template for this certificate type
    const template = await ChecklistTemplate.findOne({
        where: {
            certificate_type_id: job.certificate_type_id,
            status: 'ACTIVE'
        },
        include: [
            {
                model: CertificateType,
                as: 'CertificateType',
                attributes: ['id', 'name', 'issuing_authority']
            }
        ]
    });

    if (!template) {
        throw {
            statusCode: 404,
            message: `No active checklist template found for certificate type: ${job.CertificateType?.name || 'Unknown'}`
        };
    }

    return template;
};

/**
 * Update a checklist template
 */
export const updateChecklistTemplate = async (id, data, userId) => {
    const template = await ChecklistTemplate.findByPk(id);

    if (!template) {
        throw { statusCode: 404, message: 'Checklist template not found' };
    }

    if (template.status !== 'DRAFT') {
        throw { statusCode: 400, message: 'Cannot modify a finalized Checklist Template. Please clone and version increment instead.' };
    }

    return await template.update({
        ...data,
        updated_by: userId
    });
};

/**
 * Delete a checklist template (soft delete by setting status to INACTIVE)
 */
export const deleteChecklistTemplate = async (id) => {
    const template = await ChecklistTemplate.findByPk(id);

    if (!template) {
        throw { statusCode: 404, message: 'Checklist template not found' };
    }

    // Soft delete by setting status to INACTIVE
    await template.update({ status: 'INACTIVE' });

    return { message: 'Checklist template deleted successfully' };
};

/**
 * Activate a checklist template
 */
export const activateChecklistTemplate = async (id, userId) => {
    return await db.sequelize.transaction(async (t) => {
        const template = await ChecklistTemplate.findByPk(id, { transaction: t });

        if (!template) {
            throw { statusCode: 404, message: 'Checklist template not found' };
        }

        // Deactivate all other active templates for this certificate type
        if (template.certificate_type_id) {
            await ChecklistTemplate.update(
                { status: 'INACTIVE', updated_by: userId },
                {
                    where: {
                        certificate_type_id: template.certificate_type_id,
                        status: 'ACTIVE',
                        id: { [db.Sequelize.Op.ne]: id }
                    },
                    transaction: t
                }
            );
        }

        return await template.update({
            status: 'ACTIVE',
            updated_by: userId
        }, { transaction: t });
    });
};

/**
 * Clone a checklist template
 */
export const cloneChecklistTemplate = async (id, userId) => {
    const originalTemplate = await ChecklistTemplate.findByPk(id);

    if (!originalTemplate) {
        throw { statusCode: 404, message: 'Checklist template not found' };
    }

    const metadata = { ...(originalTemplate.metadata || {}) };
    metadata.version = metadata.version ? (parseFloat(metadata.version) + 1.0).toFixed(1) : "2.0";

    const baseCode = originalTemplate.code.split('_V')[0]; // Strip old version suffix if present
    const newVersionSuffix = `_V${metadata.version.replace('.', '_')}`;

    const newTemplate = await ChecklistTemplate.create({
        name: originalTemplate.name, // Keep the same name to align visually as subsequent version
        code: `${baseCode}${newVersionSuffix}`,
        description: originalTemplate.description,
        sections: originalTemplate.sections,
        certificate_type_id: originalTemplate.certificate_type_id,
        status: 'DRAFT',
        metadata: metadata,
        created_by: userId,
        updated_by: userId
    });

    return newTemplate;
};
