import db from '../../models/index.js';
import * as fileAccessService from '../../services/fileAccess.service.js';
import * as s3Service from '../../services/s3.service.js';
import { fillDocxContentControls } from '../../utils/docxFill.util.js';

const ChecklistTemplate = db.ChecklistTemplate;
const CertificateType = db.CertificateType;
const JobRequest = db.JobRequest;
const Document = db.Document;

/**
 * Create a new checklist template
 */
export const createChecklistTemplate = async (data, userId) => {
    return await ChecklistTemplate.create({
        name: data.name,
        code: data.code,
        description: data.description,
        sections: data.sections,
        template_files: data.template_files,
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

    const templates = await ChecklistTemplate.findAll({
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

    return await fileAccessService.resolveEntity(templates);
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

    return await fileAccessService.resolveEntity(template);
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

    return await fileAccessService.resolveEntity(template);
};

const buildTagValuesForJob = (job) => {
    const vessel = job?.Vessel || job?.Vessel?.dataValues || null;
    const client = vessel?.Client || vessel?.Client?.dataValues || null;
    const surveyor = job?.surveyor || job?.surveyor?.dataValues || null;
    const certType = job?.CertificateType || job?.CertificateType?.dataValues || null;

    const toDate = (v) => {
        if (!v) return '';
        try {
            const d = (v instanceof Date) ? v : new Date(v);
            if (Number.isNaN(d.getTime())) return String(v);
            return d.toISOString().slice(0, 10);
        } catch {
            return String(v);
        }
    };

    return {
        vessel_name: vessel?.vessel_name || '',
        imo_number: vessel?.imo_number || '',
        call_sign: vessel?.call_sign || '',
        mmsi_number: vessel?.mmsi_number || '',
        port_of_registry: vessel?.port_of_registry || '',
        year_built: vessel?.year_built ?? '',
        ship_type: vessel?.ship_type || '',
        gross_tonnage: vessel?.gross_tonnage ?? '',
        net_tonnage: vessel?.net_tonnage ?? '',
        deadweight: vessel?.deadweight ?? '',

        owner_operators: client?.company_name || '',

        survey_commenced_date: toDate(job?.target_date || job?.createdAt || job?.created_at),
        survey_completed_date: '',
        place_of_survey: job?.target_port || '',
        job_id: job?.id || '',
        certificate_type: certType?.name || '',

        surveyor_name: surveyor?.name || '',
    };
};

/**
 * Download a job-specific auto-filled checklist (DOCX), generate + cache in documents table.
 */
export const downloadChecklistTemplateForJob = async (jobId, user, { force = false } = {}) => {
    const job = await JobRequest.findByPk(jobId, {
        include: [
            { model: db.Vessel, include: [{ model: db.Client, as: 'Client' }] },
            { model: db.User, as: 'surveyor' },
            { model: db.CertificateType },
        ]
    });
    if (!job) throw { statusCode: 404, message: 'Job not found' };

    // Find active template (raw keys, no resolveEntity here)
    const template = await ChecklistTemplate.findOne({
        where: { certificate_type_id: job.certificate_type_id, status: 'ACTIVE' },
    });
    if (!template) {
        throw { statusCode: 404, message: 'No active checklist template found for this job' };
    }

    const templateFiles = Array.isArray(template.template_files) ? template.template_files : [];
    if (templateFiles.length === 0) {
        throw { statusCode: 400, message: 'Checklist template has no template_files configured' };
    }

    const tagValues = buildTagValuesForJob(job);
    const results = [];

    for (const templateKey of templateFiles) {
        const cacheDescription = `prefilled-checklist:${template.id}:${templateKey}`;
        let docRecord = null;

        if (!force) {
            const existing = await Document.findOne({
                where: {
                    entity_type: 'JOB',
                    entity_id: jobId,
                    document_type: 'CHECKLIST_PREFILLED',
                    description: cacheDescription,
                },
                order: [['uploaded_at', 'DESC']],
            });
            if (existing) {
                docRecord = existing.get({ plain: true });
            }
        }

        if (!docRecord) {
            // Fetch master docx, fill, upload, store Document
            const masterBuffer = await s3Service.getFileContent(templateKey);
            const filledBuffer = await fillDocxContentControls(masterBuffer, tagValues);

            // Give it a meaningful name from the original key or use template code
            const originalNameMatch = templateKey.match(/[^/]+$/);
            const baseFileName = originalNameMatch ? originalNameMatch[0].replace(/^[0-9]+-/, '') : `${template.code || template.id}.docx`;
            
            const outKey = `documents/jobs/${jobId}/checklists/${Date.now()}-${baseFileName}`;
            await s3Service.uploadFile(
                filledBuffer,
                baseFileName,
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                '',
                outKey
            );

            const doc = await Document.create({
                entity_type: 'JOB',
                entity_id: jobId,
                file_url: outKey,
                file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                document_type: 'CHECKLIST_PREFILLED',
                description: cacheDescription,
                uploaded_by: user?.id || null,
                uploaded_at: new Date(),
            });
            docRecord = doc.get({ plain: true });
        }

        const accessInfo = await fileAccessService.processFileAccess(docRecord, user);
        results.push(accessInfo);
    }

    // Return the array of signed documents!
    return results;
};

/**
 * Generate a pre-signed URL for uploading a checklist template PDF
 */
export const getUploadUrl = async (fileName, contentType, userId) => {
    const key = `checklist-templates/${Date.now()}_${fileName}`;
    const signedUrl = await s3Service.getUploadSignedUrl(key, contentType);

    return {
        uploadUrl: signedUrl,
        fileKey: key,
    };
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

    return await fileAccessService.resolveEntity(await template.update({
        ...data,
        updated_by: userId
    }));
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
