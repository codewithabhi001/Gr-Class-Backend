import db from '../../models/index.js';
import { v4 as uuidv4 } from 'uuid';
import { RBAC, isRoleAllowed } from '../../config/rbac.config.js';
import * as notificationService from '../../services/notification.service.js';
import * as fileAccessService from '../../services/fileAccess.service.js';
import { JOB_STATUSES } from '../../constants/statuses.js';
import { buildFullStatusCounts } from '../../utils/statusCount.util.js';
import * as lifecycleService from '../../services/lifecycle.service.js';
import { Op } from 'sequelize';
import { finalizeSurvey } from '../surveys/survey.service.js';

const JobRequest = db.JobRequest;
const JobStatusHistory = db.JobStatusHistory;
const User = db.User;
const CertificateType = db.CertificateType;
const Vessel = db.Vessel;
const Certificate = db.Certificate;
const AuditLog = db.AuditLog;
const CertificateRequiredDocument = db.CertificateRequiredDocument;
const JobDocument = db.JobDocument;
const JobReschedule = db.JobReschedule;
const Survey = db.Survey;
const SurveyorProfile = db.SurveyorProfile;
const Payment = db.Payment;

/**
 * Map job_documents rows to client-facing uploaded_documents (signed URLs, no raw S3 keys).
 */
const enrichUploadedDocuments = async (jobId, user = null) => {
    const docs = await JobDocument.findAll({
        where: { job_id: jobId },
        include: [{
            model: CertificateRequiredDocument,
            attributes: ['id', 'document_name', 'is_mandatory']
        }],
        order: [['createdAt', 'ASC']]
    });

    return Promise.all(docs.map(async (doc) => {
        const plain = doc.get({ plain: true });
        const { fileName, signedUrl } = await fileAccessService.processFileAccess(plain, user);
        const documentType = plain.CertificateRequiredDocument?.document_name
            || plain.custom_document_name
            || null;

        return {
            id: plain.id,
            document_type: documentType,
            description: null,
            createdAt: plain.createdAt,
            filename: fileName,
            signedUrl
        };
    }));
};

// ─────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────

/**
 * Assert a job exists, is not terminal, and optionally that the job belongs
 * to the caller's client scope. Returns the job.
 * @param {string} id
 * @param {{ includeVessel?: boolean }} options
 */
const requireJob = async (id, { includeVessel = false, useMaster = false } = {}) => {
    const include = includeVessel ? ['Vessel'] : [];
    const job = await JobRequest.findByPk(id, { include, ...(useMaster ? { useMaster: true } : {}) });
    if (!job) throw { statusCode: 404, message: 'The requested job could not be found.' };
    return job;
};

/**
 * Validate that the assigned surveyor has the required authorizations
 * for the vessel type and certificate type of the job.
 */
const validateSurveyorAuthority = async (job, surveyorId) => {
    const profile = await SurveyorProfile.findOne({ where: { user_id: surveyorId }, useMaster: true });
    if (!profile) {
        throw { statusCode: 400, message: 'Surveyor profile not found. Cannot verify authorizations.' };
    }

    // ── Availability Guard ──
    if (profile.status !== 'ACTIVE') {
        throw { statusCode: 400, message: `This surveyor is currently ${profile.status}. Only ACTIVE surveyors can be assigned to jobs.` };
    }

    if (!profile.is_available) {
        throw { statusCode: 400, message: 'This surveyor is currently OFFLINE or UNAVAILABLE. Please select an online surveyor.' };
    }

    let vesselType = null;
    let certName = null;

    const [vessel, certType] = await Promise.all([
        job.vessel_id ? Vessel.findByPk(job.vessel_id, { useMaster: true }) : Promise.resolve(null),
        job.certificate_type_id ? CertificateType.findByPk(job.certificate_type_id, { useMaster: true }) : Promise.resolve(null)
    ]);

    vesselType = vessel?.ship_type;
    certName = certType?.name;

    if (vesselType) {
        // Ensure it's an array or handle string cases just in case
        let authorizedShips = profile.authorized_ship_types;
        if (typeof authorizedShips === 'string') {
            try { authorizedShips = JSON.parse(authorizedShips); } catch (e) { authorizedShips = []; }
        }
        if (!Array.isArray(authorizedShips)) authorizedShips = [];

        if (!authorizedShips.includes(vesselType)) {
            throw { statusCode: 400, message: `Surveyor is not authorized for vessel type: ${vesselType}` };
        }
    }

    if (certName) {
        let authorizedCerts = profile.authorized_certificates;
        if (typeof authorizedCerts === 'string') {
            try { authorizedCerts = JSON.parse(authorizedCerts); } catch (e) { authorizedCerts = []; }
        }
        if (!Array.isArray(authorizedCerts)) authorizedCerts = [];

        if (!authorizedCerts.includes(certName)) {
            throw { statusCode: 400, message: `Surveyor is not authorized for certificate: ${certName}` };
        }
    }
};

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

export const createJob = async (data, userId, options = {}) => {
    const {
        transaction: externalTxn,
        requestedByUserId,
        statusHistoryReason = 'Initial creation',
        skipNotifications = false,
        skipMandatoryDocumentCheck = false,
    } = options;
    let isSurveyRequired = true;
    const [certType, requiredDocs, vessel] = await Promise.all([
        data.certificate_type_id ? CertificateType.findByPk(data.certificate_type_id, { useMaster: true }) : Promise.resolve(null),
        data.certificate_type_id ? CertificateRequiredDocument.findAll({
            where: { certificate_type_id: data.certificate_type_id, is_mandatory: true },
            useMaster: true
        }) : Promise.resolve([]),
        data.vessel_id ? Vessel.findByPk(data.vessel_id, { include: [{ model: db.Client, as: 'Client' }], useMaster: true }) : Promise.resolve(null)
    ]);

    if (data.certificate_type_id) {
        if (!certType) throw { statusCode: 400, message: 'The selected certificate type is invalid.' };
        isSurveyRequired = certType.requires_survey;

        if (!skipMandatoryDocumentCheck && requiredDocs.length > 0) {
            const uploadedDocIds = data.uploaded_documents?.map(d => d.required_document_id) || [];
            const missingDocs = requiredDocs.filter(rd => !uploadedDocIds.includes(rd.id));

            if (missingDocs.length > 0) {
                throw {
                    statusCode: 400,
                    message: 'Please upload all mandatory documents to create the job.',
                    missing_documents: missingDocs.map(md => ({ id: md.id, name: md.document_name }))
                };
            }
        }
    }

    if (data.vessel_id) {
        if (!vessel) throw { statusCode: 400, message: 'The selected vessel is invalid.' };

        if (vessel.class_status !== 'ACTIVE') {
            throw {
                statusCode: 400,
                message: `Cannot create job: Vessel status is '${vessel.class_status}'. Only ACTIVE vessels are eligible for survey.`
            };
        }

        if (vessel.Client && vessel.Client.status !== 'ACTIVE') {
            throw {
                statusCode: 400,
                message: 'Cannot create job: The associated client company is currently INACTIVE.'
            };
        }
    }

    const { job_status: _omit, uploaded_documents, requested_by_user_id: _rbu, payment: paymentData, ...safeData } = data;
    const requestedBy = requestedByUserId || userId;

    const txn = externalTxn || await db.sequelize.transaction();
    const ownsTransaction = !externalTxn;
    try {
        const job = await JobRequest.create({
            ...safeData,
            requested_by_user_id: requestedBy,
            job_status: 'CREATED',
            is_survey_required: isSurveyRequired
        }, { transaction: txn });

        // Save uploaded documents if any
        if (uploaded_documents && uploaded_documents.length > 0) {
            const docsToCreate = uploaded_documents.map(doc => ({
                job_id: job.id,
                required_document_id: doc.required_document_id || null,
                custom_document_name: doc.custom_document_name || null,
                file_url: doc.file_url,
                uploaded_by: userId,
                verification_status: 'PENDING'
            }));
            await JobDocument.bulkCreate(docsToCreate, { transaction: txn });
        }

        await JobStatusHistory.create({
            job_id: job.id,
            previous_status: null,
            new_status: 'CREATED',
            changed_by: userId,
            reason: statusHistoryReason
        }, { transaction: txn });

        if (paymentData) {
            const payment = await db.Payment.create({
                job_id: job.id,
                invoice_number: `INV-${uuidv4().substring(0, 8).toUpperCase()}`,
                amount: paymentData.amount,
                currency: paymentData.currency || 'USD',
                payment_status: 'UNPAID'
            }, { transaction: txn });

            await db.AuditLog.create({
                user_id: userId, action: 'CREATE_INVOICE',
                entity_name: 'Payment', entity_id: payment.id,
                old_values: null,
                new_values: { job_id: job.id, amount: paymentData.amount, currency: payment.currency, payment_status: 'UNPAID' }
            }, { transaction: txn });
        }

        if (ownsTransaction) {
            await txn.commit();

            if (!skipNotifications) {
                const jobWithVessel = await JobRequest.findByPk(job.id, { include: ['Vessel'], useMaster: true });
                notificationService.notifyRoles(['ADMIN', 'GM', 'TM'], 'JOB_CREATED', {
                    vesselName: jobWithVessel.Vessel.vessel_name,
                    port: jobWithVessel.target_port
                });

                const clientUser = await User.findOne({ where: { client_id: jobWithVessel.Vessel.client_id, role: 'CLIENT' } });
                if (clientUser) {
                    notificationService.sendNotification(clientUser.id, 'JOB_CREATED', {
                        vesselName: jobWithVessel.Vessel.vessel_name, port: jobWithVessel.target_port
                    });
                }
            }
        }

        return job;
    } catch (error) {
        if (ownsTransaction) await txn.rollback();
        throw error;
    }
};

export const createJobForClient = async (data, clientId, userId) => {
    if (!data.vessel_id) throw { statusCode: 400, message: 'Vessel ID is required' };
    const vessel = await Vessel.findOne({ where: { id: data.vessel_id, client_id: clientId } });
    if (!vessel) throw { statusCode: 403, message: 'Access denied: you do not have permission to select this vessel.' };
    return createJob(data, userId);
};

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

const ALLOWED_JOB_FILTERS = ['id', 'vessel_id', 'certificate_type_id', 'requested_by_user_id',
    'assigned_surveyor_id', 'assigned_by_user_id', 'target_port', 'target_date'];
const INTERNAL_RECENT_ROLES = new Set(['ADMIN', 'GM', 'TM', 'TO']);
const RECENT_JOBS_DEFAULT_DAYS = 30;

const parseCsvOrSingle = (value) => {
    if (value == null || value === '') return [];
    return String(value).split(',').map(i => i.trim()).filter(Boolean);
};

const hasAnyUserFilter = (rest) =>
    [...ALLOWED_JOB_FILTERS, 'status', 'created_from', 'created_to']
        .some(k => rest[k] != null && String(rest[k]).trim() !== '');

export const getJobs = async (query, scopeFilters = {}, userRole = null) => {
    const { page = 1, limit = 10, status, created_from, created_to, recent_days, search, ...rest } = query;

    const whereClause = {};
    Object.entries(scopeFilters || {}).forEach(([k, v]) => {
        whereClause[k] = Array.isArray(v) ? { [Op.in]: v } : v;
    });

    const statuses = parseCsvOrSingle(status);
    if (statuses.length === 1) whereClause.job_status = statuses[0];
    else if (statuses.length > 1) whereClause.job_status = { [Op.in]: statuses };

    ALLOWED_JOB_FILTERS.forEach(k => {
        if (rest[k] == null || String(rest[k]).trim() === '') return;
        const values = parseCsvOrSingle(rest[k]);
        if (values.length === 1) whereClause[k] = values[0];
        else if (values.length > 1) whereClause[k] = { [Op.in]: values };
    });

    if (created_from || created_to) {
        whereClause.createdAt = {};
        if (created_from) whereClause.createdAt[Op.gte] = new Date(created_from);
        if (created_to) whereClause.createdAt[Op.lte] = new Date(created_to);
    } else if (INTERNAL_RECENT_ROLES.has(userRole) && !hasAnyUserFilter({ status, created_from, created_to, ...rest })) {
        const days = Math.max(1, parseInt(recent_days || RECENT_JOBS_DEFAULT_DAYS, 10));
        const since = new Date();
        since.setDate(since.getDate() - days);
        whereClause.createdAt = { [Op.gte]: since };
    }

    if (search && String(search).trim().length >= 3) {
        const term = String(search).trim();
        whereClause[Op.or] = [
            { job_request_number: { [Op.like]: `%${term}%` } },
            { target_port: { [Op.like]: `%${term}%` } }
        ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, parseInt(limit, 10));
    const isSurveyor = userRole === 'SURVEYOR';

    const jobAttributes = ['id', 'job_request_number', 'vessel_id', 'certificate_type_id', 'target_port', 'target_date', 'job_status', 'priority', 'createdAt', 'updatedAt'];

    const include = [
        { model: Vessel, attributes: ['id', 'vessel_name', 'imo_number'] },
        { model: CertificateType, attributes: ['id', 'name', 'issuing_authority'] }
    ];

    const { count, rows } = await JobRequest.findAndCountAll({
        where: whereClause, attributes: jobAttributes,
        limit: pageLimit, offset: (pageNum - 1) * pageLimit,
        order: [['updatedAt', 'DESC']], include,
        useReplica: true
    });

    // Calculate status counts
    const statusWhere = { ...whereClause };
    delete statusWhere.job_status;
    const statusCounts = await JobRequest.findAll({
        where: statusWhere,
        attributes: [
            ['job_status', 'status'],
            [db.sequelize.fn('COUNT', db.sequelize.col('job_status')), 'count']
        ],
        group: ['job_status'],
        raw: true,
        useReplica: true
    });

    const jobs = (await fileAccessService.resolveEntity(rows)).map(j => {
        const vessel_name = j.Vessel?.vessel_name || 'N/A';
        const imo_number = j.Vessel?.imo_number || 'N/A';
        const certificate_name = j.CertificateType?.name || 'N/A';
        const issuing_authority = j.CertificateType?.issuing_authority || 'N/A';

        return {
            id: j.id || 'N/A',
            job_request_number: j.job_request_number || 'N/A',
            job_status: j.job_status || 'N/A',
            priority: j.priority || 'N/A',
            target_port: j.target_port || 'N/A',
            target_date: j.target_date || 'N/A',
            createdAt: j.createdAt || 'N/A',
            updatedAt: j.updatedAt || 'N/A',

            // Flat related fields (no IDs!)
            vessel_name,
            imo_number,
            certificate_name,
            issuing_authority
        };
    });
    return {
        total: count, page: parseInt(page), limit: parseInt(limit),
        totalPages: Math.ceil(count / pageLimit),
        status_counts: buildFullStatusCounts(statusCounts, JOB_STATUSES),
        jobs
    };
};

export const getJobById = async (id, scopeFilters = {}, user = null) => {
    const job = await JobRequest.findOne({
        where: { id, ...scopeFilters },
        include: [
            {
                model: Vessel,
                include: [
                    { model: db.FlagAdministration, as: 'FlagAdministration', attributes: ['id', 'flag_state_name'] },
                    { model: db.Client, as: 'Client', attributes: ['id', 'company_name'] }
                ]
            },
            'CertificateType',
            {
                model: db.ActivityRequest,
                as: 'SourceActivityRequest',
                attributes: ['id', 'request_number', 'status', 'activity_type', 'requested_service'],
            },
            {
                model: Survey,
                as: 'survey'
            },
            {
                model: Certificate,
                as: 'Certificate',
                attributes: ['id', 'certificate_number', 'source_type', 'uploaded_file_url', 'generated_pdf_url', 'pdf_file_url'],
            },
            { model: User, as: 'approver', attributes: ['id', 'name', 'role'] },
            { model: User, as: 'requester', attributes: ['id', 'name', 'email', 'role'] },
            { model: User, as: 'surveyor', attributes: ['id', 'name', 'email'] },
            { model: Payment, attributes: ['id', 'payment_status', 'amount', 'currency', 'invoice_number', 'payment_date'] }
        ]
    });
    if (!job) throw { statusCode: 404, message: 'The requested job could not be found.' };

    const jobPlain = job.get({ plain: true });

    // ── Vessel Details (flat, N/A for nulls) ──
    const v = jobPlain.Vessel || {};
    jobPlain.vessel_details = {
        vessel_name:  v.vessel_name   || 'N/A',
        imo_number:   v.imo_number    || 'N/A',
        ship_type:    v.ship_type     || 'N/A',
        flag_state:   v.FlagAdministration?.flag_state_name || 'N/A',
        company_name: v.Client?.company_name               || 'N/A',
        class_status: v.class_status  || 'N/A',
    };

    // Expose payment status at top level
    jobPlain.payment_status = jobPlain.Payments?.[0]?.payment_status || 'N/A';

    if (job.Certificate) {
        const cert = job.Certificate;
        const fileKey = cert.source_type === 'EXTERNAL'
            ? (cert.uploaded_file_url || cert.pdf_file_url)
            : (cert.generated_pdf_url || cert.pdf_file_url);
        if (fileKey) {
            const key = fileAccessService.getKeyFromUrl(fileKey);
            jobPlain.certificate_url = key?.startsWith('public/certificates/')
                ? fileAccessService.generatePublicCdnUrl(key)
                : await fileAccessService.generateSignedUrl(key, 3600);
        }
        jobPlain.certificate_number = cert.certificate_number;
        jobPlain.certificate_id = cert.id;
        jobPlain.Certificate = { id: cert.id, certificate_number: cert.certificate_number, source_type: cert.source_type };
    }

    jobPlain.uploaded_documents = await enrichUploadedDocuments(id, user);

    if (jobPlain.SourceActivityRequest) {
        jobPlain.source_activity_request = {
            id: jobPlain.SourceActivityRequest.id,
            request_number: jobPlain.SourceActivityRequest.request_number,
            status: jobPlain.SourceActivityRequest.status,
            activity_type: jobPlain.SourceActivityRequest.activity_type,
            requested_service: jobPlain.SourceActivityRequest.requested_service,
        };
        delete jobPlain.SourceActivityRequest;
    }

    return await fileAccessService.resolveEntity(jobPlain, user);
};

export const getEligibleSurveyors = async (jobId, queryParams = {}) => {
    const job = await requireJob(jobId);

    let vesselType = null;
    let certName = null;

    if (job.vessel_id) {
        const vessel = await Vessel.findByPk(job.vessel_id);
        vesselType = vessel?.ship_type;
    }

    if (job.certificate_type_id) {
        const certType = await CertificateType.findByPk(job.certificate_type_id);
        certName = certType?.name;
    }

    const { search } = queryParams;

    const profileWhere = { status: 'ACTIVE' };
    const userWhere = { status: 'ACTIVE', role: 'SURVEYOR' };

    if (search) {
        profileWhere[Op.or] = [
            { license_number: { [Op.like]: `%${search}%` } },
            db.sequelize.where(db.sequelize.col('User.name'), { [Op.like]: `%${search}%` })
        ];
    }

    // Fetch all active surveyors matching the search
    const allSurveyors = await SurveyorProfile.findAll({
        where: profileWhere,
        include: [{
            model: User,
            where: userWhere,
            attributes: ['id', 'name', 'email', 'phone', 'profile_pic_url']
        }],
        useReplica: true
    });

    const surveyors = [];

    for (const profile of allSurveyors) {
        let isEligible = true;
        const missing_reasons = [];

        if (vesselType) {
            let authorizedShips = profile.authorized_ship_types;
            if (typeof authorizedShips === 'string') {
                try { authorizedShips = JSON.parse(authorizedShips); } catch (e) { authorizedShips = []; }
            }
            if (!Array.isArray(authorizedShips)) authorizedShips = [];

            if (!authorizedShips.includes(vesselType)) {
                isEligible = false;
                missing_reasons.push(`Missing Vessel Authority (${vesselType})`);
            }
        }

        if (certName) {
            let authorizedCerts = profile.authorized_certificates;
            if (typeof authorizedCerts === 'string') {
                try { authorizedCerts = JSON.parse(authorizedCerts); } catch (e) { authorizedCerts = []; }
            }
            if (!Array.isArray(authorizedCerts)) authorizedCerts = [];

            if (!authorizedCerts.includes(certName)) {
                isEligible = false;
                missing_reasons.push(`Missing Certificate Authority (${certName})`);
            }
        }

        // Availability check
        if (!profile.is_available) {
            isEligible = false;
            missing_reasons.push('Surveyor is currently UNAVAILABLE/OFFLINE');
        }

        surveyors.push({
            id: profile.User.id,
            name: profile.User.name,
            email: profile.User.email,
            phone: profile.User.phone,
            profile_pic_url: profile.User.profile_pic_url,
            is_available: profile.is_available,
            status: profile.status,
            license_number: profile.license_number,
            years_of_experience: profile.years_of_experience,
            is_eligible: isEligible,
            missing_reasons
        });
    }

    return {
        surveyors,
        eligible: surveyors.filter(s => s.is_eligible),
        not_eligible: surveyors.filter(s => !s.is_eligible)
    };
};

// ─────────────────────────────────────────────
// WORKFLOW TRANSITIONS — one function per transition
// All transitions delegate to lifecycle.service to maintain single source of truth.
// ─────────────────────────────────────────────

/**
 * CREATED → DOCUMENT_VERIFIED
 * Roles: TO
 */
export const verifyJobDocuments = async (id, body, user) => {
    if (!['TO', 'GM', 'ADMIN'].includes(user.role)) {
        throw { statusCode: 403, message: 'Only Technical Officers (TO), General Managers (GM) or Admins have permission to verify documents.' };
    }
    const userId = user.id;
    const job = await requireJob(id, { includeVessel: true, useMaster: true });
    if (job.job_status !== 'CREATED') {
        throw { statusCode: 400, message: `Documents can only be verified when the job is in CREATED status.` };
    }

    // Check if certificate type has mandatory documents
    const requiredDocs = await CertificateRequiredDocument.findAll({
        where: { certificate_type_id: job.certificate_type_id, is_mandatory: true },
        useMaster: true
    });

    if (requiredDocs.length > 0) {
        const uploadedDocs = await JobDocument.findAll({
            where: { job_id: id },
            useMaster: true
        });
        const uploadedDocIds = uploadedDocs.map(d => d.required_document_id);
        const missingDocs = requiredDocs.filter(rd => !uploadedDocIds.includes(rd.id));

        if (missingDocs.length > 0) {
            throw {
                statusCode: 400,
                message: 'Mandatory documents are missing. Please ensure all required files are uploaded.',
                missing_documents: missingDocs.map(md => ({ id: md.id, name: md.document_name }))
            };
        }
    }

    // ── Document Rejection Flow ──────────────────────────────
    // body.approved = false  → TO found invalid/fake documents
    // body.rejected_documents = [{ document_id, reason }]
    const approved = body?.approved !== false; // default true for backward compatibility

    if (!approved) {
        const rejectedDocs = body.rejected_documents;
        if (!rejectedDocs || !Array.isArray(rejectedDocs) || rejectedDocs.length === 0) {
            throw { statusCode: 400, message: 'Please specify which documents are invalid (rejected_documents array required).' };
        }

        // Mark each rejected document (only if they are currently PENDING)
        for (const rd of rejectedDocs) {
            if (!rd.document_id) continue;
            await JobDocument.update(
                {
                    verification_status: 'REJECTED',
                    rejection_reason: rd.reason || 'Document is invalid or not acceptable.',
                    verified_by: userId
                },
                { where: { id: rd.document_id, job_id: id, verification_status: 'PENDING' } }
            );
        }

        // Mark remaining (non-rejected) docs as APPROVED
        const rejectedIds = rejectedDocs.map(rd => rd.document_id).filter(Boolean);
        await JobDocument.update(
            { verification_status: 'APPROVED', verified_by: userId },
            { where: { job_id: id, id: { [Op.notIn]: rejectedIds }, verification_status: 'PENDING' } }
        );

        // Audit trail — log the rejection without changing job status
        await JobStatusHistory.create({
            job_id: id,
            previous_status: 'CREATED',
            new_status: 'CREATED',
            changed_by: userId,
            reason: `Documents rejected by ${user.role}: ${rejectedDocs.map(rd => rd.reason || 'Invalid document').join('; ')}`
        });

        // Notify client to re-upload
        const clientUser = await User.findOne({ where: { client_id: job.Vessel.client_id, role: 'CLIENT' }, useMaster: true });
        if (clientUser) {
            notificationService.sendNotification(clientUser.id, 'JOB_DOCUMENTS_REJECTED', {
                jobId: id,
                vesselName: job.Vessel.vessel_name,
                rejectedCount: rejectedDocs.length,
                reasons: rejectedDocs.map(rd => rd.reason).filter(Boolean)
            }).catch(() => { });
        }

        // Fetch updated docs to return
        const updatedDocs = await JobDocument.findAll({
            where: { job_id: id },
            include: [{ model: CertificateRequiredDocument }]
        });

        return {
            message: `${rejectedDocs.length} document(s) rejected. Client has been notified to re-upload.`,
            data: {
                job_id: id,
                job_status: 'CREATED',
                rejected_documents: updatedDocs.filter(d => d.verification_status === 'REJECTED'),
                approved_documents: updatedDocs.filter(d => d.verification_status === 'APPROVED')
            }
        };
    }

    // ── Document Approval Flow (all docs valid) ──────────────
    // A requirement is considered "satisfied" if it has at least one PENDING or APPROVED version.
    // We only block "Approve All" if there are mandatory requirements that have ONLY REJECTED versions (or no versions at all).

    // 1. Get all documents for this job
    const allDocs = await JobDocument.findAll({
        where: { job_id: id }
    });

    // 2. Check if every mandatory requirement has at least one version that is NOT rejected
    if (requiredDocs.length > 0) {
        const satisfiedReqIds = new Set(
            allDocs
                .filter(d => d.verification_status !== 'REJECTED')
                .map(d => d.required_document_id)
        );

        const missingMandatory = requiredDocs.filter(rd => !satisfiedReqIds.has(rd.id));

        if (missingMandatory.length > 0) {
            throw {
                statusCode: 400,
                message: 'Cannot approve: One or more mandatory documents are missing or currently rejected.',
                missing_documents: missingMandatory.map(md => ({ id: md.id, name: md.document_name }))
            };
        }
    }

    // 3. Mark all PENDING documents as APPROVED
    const pendingDocs = allDocs.filter(d => d.verification_status === 'PENDING');
    if (pendingDocs.length > 0) {
        await JobDocument.update(
            { verification_status: 'APPROVED', verified_by: userId },
            { where: { id: { [Op.in]: pendingDocs.map(d => d.id) } } }
        );
    }

    const updated = await lifecycleService.updateJobStatus(id, 'DOCUMENT_VERIFIED', userId, 'Technical Officer verified all documents');

    // Notify ADMIN/GM/TM
    notificationService.notifyRoles(['ADMIN', 'GM', 'TM'], 'JOB_DOCUMENT_VERIFIED', {
        jobId: id, vesselName: job.Vessel.vessel_name
    }).catch(() => { });

    return { message: 'All documents verified successfully.', data: updated };
};

/**
 * DOCUMENT_VERIFIED → APPROVED
 * Roles: ADMIN, GM
 */
export const approveRequest = async (id, remarks, user) => {
    if (!['GM', 'ADMIN'].includes(user.role)) {
        throw { statusCode: 403, message: 'Only General Managers (GM) or Admins have permission to approve job requests.' };
    }
    const job = await requireJob(id, { includeVessel: true, useMaster: true });
    if (job.job_status !== 'DOCUMENT_VERIFIED') {
        throw { statusCode: 400, message: `Jobs can only be approved after documents have been verified.` };
    }
    const updated = await lifecycleService.updateJobStatus(id, 'APPROVED', user.id, remarks || `${user.role} approved request`);
    await updated.update({ approved_by_user_id: user.id });

    // Notify Client (vessel already loaded)
    const clientUser = await User.findOne({ where: { client_id: job.Vessel.client_id, role: 'CLIENT' }, useMaster: true });
    if (clientUser) {
        notificationService.sendNotification(clientUser.id, 'JOB_APPROVED', {
            jobId: id, vesselName: job.Vessel.vessel_name
        }).catch(() => { });
    }

    return updated;
};

/**
 * APPROVED → FINALIZED (for non-survey jobs)
 * Roles: ADMIN, GM, TM
 */
export const finalizeJob = async (id, remarks, user) => {
    const job = await requireJob(id, { useMaster: true });
    if (job.is_survey_required) {
        if (!['REVIEWED', 'SURVEY_DONE'].includes(job.job_status)) {
            throw { statusCode: 400, message: 'This job requires a survey report. It must be Reviewed before finalization.' };
        }
        // Redirect to survey finalization logic
        return await finalizeSurvey(id, user);
    }
    if (job.job_status !== 'APPROVED') {
        throw { statusCode: 400, message: `Only approved jobs can be finalized.` };
    }
    return await lifecycleService.updateJobStatus(id, 'FINALIZED', user.id, remarks || `${user.role} finalized non-survey job`);
};

/**
 * APPROVED → ASSIGNED (sets surveyor)
 * Roles: ADMIN, GM
 */
export const assignSurveyor = async (jobId, surveyorId, user) => {
    if (!isRoleAllowed(RBAC.ASSIGN_JOB, user.role)) {
        throw { statusCode: 403, message: 'Only General Managers (GM) or Admins have permission to assign surveyors.' };
    }
    const userId = user.id;
    const job = await requireJob(jobId, { includeVessel: true, useMaster: true });
    if (job.job_status !== 'APPROVED') {
        throw { statusCode: 400, message: 'A surveyor can only be assigned after the job has been approved.' };
    }
    const surveyor = await User.findByPk(surveyorId, { useMaster: true });
    if (!surveyor || surveyor.role !== 'SURVEYOR') {
        throw { statusCode: 400, message: 'Invalid surveyor selection. Please select a user with the Surveyor role.' };
    }

    // Validate surveyor authority
    await validateSurveyorAuthority(job, surveyorId);

    await job.update({ assigned_surveyor_id: surveyorId, assigned_by_user_id: userId });

    const updated = await lifecycleService.updateJobStatus(jobId, 'ASSIGNED', userId, `Surveyor ${surveyorId} assigned`);

    // Vessel already loaded
    notificationService.sendNotification(surveyorId, 'JOB_ASSIGNED', {
        jobId, vesselName: job.Vessel.vessel_name, port: job.target_port
    });
    return updated;
};

/**
 * Surveyor update without status change (ASSIGNED or later)
 * Roles: GM, TM
 */
export const reassignSurveyor = async (jobId, surveyorId, reason, user) => {
    if (!isRoleAllowed(RBAC.REASSIGN_JOB, user.role)) {
        throw { statusCode: 403, message: 'You do not have permission to reassign surveyors.' };
    }
    const userId = user.id;
    const job = await requireJob(jobId, { includeVessel: true, useMaster: true });

    // Validate new surveyor authority
    await validateSurveyorAuthority(job, surveyorId);

    const oldSurveyor = job.assigned_surveyor_id;
    await job.update({ assigned_surveyor_id: surveyorId, assigned_by_user_id: userId });

    // Status sync is now handled by lifecycle.updateJobStatus
    // We just need to trigger a status update to current status if we want to force a refresh (or rely on next transition)
    // Actually, for reassignment specifically, we update the job and add history. The lifecycle will see the new surveyor on next transition.
    // If we want immediate survey sync, we'd trigger a dummy 'updateJobStatus' but better to just call it reassignment history.

    await JobStatusHistory.create({
        job_id: jobId, previous_status: job.job_status, new_status: job.job_status,
        changed_by: userId, reason: `Reassigned from ${oldSurveyor} to ${surveyorId}: ${reason}`
    });

    // Explicitly sync survey in reassignment case since it doesn't change job status
    if (job.is_survey_required) {
        const survey = await Survey.findOne({ where: { job_id: jobId }, useMaster: true });
        if (survey) await survey.update({ surveyor_id: surveyorId });
    }
    return job;
};

/**
 * ASSIGNED → SURVEY_AUTHORIZED
 * Roles: ADMIN, TM
 */
export const authorizeSurvey = async (id, remarks, user) => {
    if (!isRoleAllowed(RBAC.AUTHORIZE_SURVEY, user.role)) {
        throw { statusCode: 403, message: 'Only Technical Managers (TM) or Admins have permission to authorize surveys.' };
    }
    const job = await requireJob(id, { includeVessel: true, useMaster: true });
    if (job.job_status !== 'ASSIGNED') {
        throw { statusCode: 400, message: `Survey authorization is possible only after a surveyor has been assigned.` };
    }
    if (!job.assigned_surveyor_id) {
        throw { statusCode: 400, message: 'Cannot authorize survey: please assign a surveyor first.' };
    }

    const updated = await lifecycleService.updateJobStatus(id, 'SURVEY_AUTHORIZED', user.id,
        remarks || `${user.role} authorized survey`);
    await updated.update({ approved_by_user_id: user.id });

    // Vessel already loaded
    notificationService.sendNotification(job.assigned_surveyor_id, 'JOB_APPROVED', {
        jobId: id, status: 'SURVEY_AUTHORIZED', vesselName: job.Vessel.vessel_name
    });
    const clientUser = await User.findOne({ where: { client_id: job.Vessel.client_id, role: 'CLIENT' }, useMaster: true });
    if (clientUser) {
        notificationService.sendNotification(clientUser.id, 'JOB_APPROVED', {
            jobId: id, vesselName: job.Vessel.vessel_name
        });
    }
    return updated;
};

/**
 * SURVEY_DONE → REVIEWED
 * Roles: TO
 */
export const reviewJob = async (id, remarks, user) => {
    if (user.role !== 'TO') {
        throw { statusCode: 403, message: 'Only Technical Officers (TO) have permission to mark a job as reviewed.' };
    }
    const job = await requireJob(id, { includeVessel: true, useMaster: true });
    if (job.job_status !== 'SURVEY_DONE') {
        throw { statusCode: 400, message: `Jobs can only be reviewed after the survey has been completed.` };
    }

    if (job.is_survey_required) {
        const txn = await db.sequelize.transaction();
        try {
            // 1. Automatically approve all checklist items (ActivityPlanning) for the job
            await db.ActivityPlanning.update(
                { status: 'APPROVED' },
                { where: { job_id: id }, transaction: txn }
            );

            // 2. Automatically approve all signed checklist files in the Survey model
            const survey = await db.Survey.findOne({
                where: { job_id: id },
                transaction: txn,
                lock: txn.LOCK.UPDATE
            });
            if (!survey) {
                throw { statusCode: 400, message: 'Cannot review job: survey report is missing.' };
            }

            let signedFiles = survey.signed_checklist_files;
            if (Array.isArray(signedFiles) && signedFiles.length > 0) {
                const updatedFiles = signedFiles.map(file => {
                    if (typeof file === 'object' && file !== null) {
                        return { ...file, status: 'APPROVED' };
                    }
                    return file;
                });
                await survey.update({ signed_checklist_files: updatedFiles }, { transaction: txn });
            }

            await txn.commit();
        } catch (error) {
            await txn.rollback();
            throw error;
        }
    }

    const updated = await lifecycleService.updateJobStatus(id, 'REVIEWED', user.id, remarks || 'TO technical review passed.');

    // Notify ADMIN/TM (vessel already loaded)
    notificationService.notifyRoles(['ADMIN', 'TM'], 'JOB_REVIEWED', {
        jobId: id, vesselName: job.Vessel.vessel_name
    }).catch(() => { });

    return updated;
};

/**
 * Job status for rescheduling
 */
const RESCHEDULE_ALLOWED_STATUSES = ['CREATED', 'DOCUMENT_VERIFIED', 'APPROVED', 'ASSIGNED', 'SURVEY_AUTHORIZED'];
const RESCHEDULE_BLOCKED_STATUSES = ['IN_PROGRESS', 'SURVEY_DONE', 'REVIEWED', 'FINALIZED', 'PAYMENT_DONE', 'CERTIFIED', 'REJECTED'];

/**
 * Reschedule Job
 * Roles: ADMIN, GM
 */
export const rescheduleJob = async (id, data, userId) => {
    const { new_target_date, new_target_port, reason } = data;
    if (!reason) throw { statusCode: 400, message: 'Reschedule requires a specific reason.' };

    const txn = await db.sequelize.transaction();
    try {
        const job = await JobRequest.findByPk(id, { transaction: txn, lock: txn.LOCK.UPDATE });
        if (!job) throw { statusCode: 404, message: 'The requested job could not be found.' };

        if (!RESCHEDULE_ALLOWED_STATUSES.includes(job.job_status)) {
            throw { statusCode: 400, message: `Rescheduling is not possible while the job is in ${job.job_status} status.` };
        }

        if (RESCHEDULE_BLOCKED_STATUSES.includes(job.job_status)) {
            throw { statusCode: 400, message: `Rescheduling is blocked as the survey has already started or the job is closed.` };
        }

        const old_target_date = job.target_date;
        const old_target_port = job.target_port;

        // Insert into job_reschedules
        await JobReschedule.create({
            job_id: id,
            old_target_date,
            new_target_date,
            old_target_port,
            new_target_port,
            reason,
            requested_by: userId
        }, { transaction: txn });

        // Update job
        await job.update({
            target_date: new_target_date,
            target_port: new_target_port,
            reschedule_count: (job.reschedule_count || 0) + 1
        }, { transaction: txn });

        // Audit Log
        await JobStatusHistory.create({
            job_id: id,
            previous_status: job.job_status,
            new_status: job.job_status,
            changed_by: userId,
            reason: `Rescheduled: ${reason} (Port: ${old_target_port} -> ${new_target_port}, Date: ${old_target_date} -> ${new_target_date})`
        }, { transaction: txn });

        await txn.commit();

        // Notify surveyor if assigned
        if (job.assigned_surveyor_id) {
            const jobWithVessel = await JobRequest.findByPk(id, { include: ['Vessel'], useMaster: true });
            notificationService.sendNotification(job.assigned_surveyor_id, 'JOB_RESCHEDULED', {
                jobId: id,
                vesselName: jobWithVessel.Vessel.vessel_name,
                newDate: new_target_date,
                newPort: new_target_port,
                reason
            });
        }

        return job;
    } catch (error) {
        await txn.rollback();
        throw error;
    }
};



/**
 * → REJECTED (terminal)
 * ADMIN: any non-terminal | GM: CREATED only | TM: ASSIGNED, SURVEY_DONE, REVIEWED
 */
export const rejectJob = async (id, remarks, user) => {
    const job = await requireJob(id, { useMaster: true });
    const { role } = user;
    const current = job.job_status;

    // Terminal guard
    if (lifecycleService.JOB_TERMINAL_STATES.includes(current)) {
        throw { statusCode: 400, message: `This job is already closed (${current}) and cannot be rejected.` };
    }

    if (['ADMIN', 'GM'].includes(role)) {
        // Can reject any status BEFORE Finalized or Certified
        if (lifecycleService.JOB_POST_FINALIZATION_STATES.includes(current)) {
            throw { statusCode: 400, message: `Jobs that are already ${current} cannot be rejected.` };
        }
    } else if (role === 'TM') {
        // Technical Managers restricted to their specific oversight states
        if (!['ASSIGNED', 'SURVEY_DONE', 'REVIEWED'].includes(current)) {
            throw { statusCode: 403, message: 'Technical Managers can only reject jobs that are in ASSIGNED, SURVEY_DONE, or REVIEWED status.' };
        }
    } else {
        throw { statusCode: 403, message: `Role ${role} does not have permission to reject jobs.` };
    }

    return await lifecycleService.updateJobStatus(id, 'REJECTED', user.id, remarks || `${role} rejected job`);
};

/**
 * → REJECTED (cancel path — ADMIN / GM can cancel any non-terminal job)
 */
export const cancelJob = async (id, reason, userId) => {
    const job = await requireJob(id, { useMaster: true });
    const current = job.job_status;

    if (lifecycleService.JOB_TERMINAL_STATES.includes(current)) {
        throw { statusCode: 400, message: `This job is already closed (${current}) and cannot be cancelled.` };
    }

    // Block cancellation of finalized/certified jobs
    if (lifecycleService.JOB_POST_FINALIZATION_STATES.includes(current)) {
        throw { statusCode: 400, message: `Jobs that are already ${current} cannot be cancelled.` };
    }

    return await lifecycleService.updateJobStatus(id, 'REJECTED', userId, reason || 'Job cancelled');
};

/**
 * → REJECTED (CLIENT cancel path — allowed ONLY when job is in CREATED status)
 * Once the job progresses beyond CREATED (e.g. DOCUMENT_VERIFIED), only ADMIN/GM can cancel.
 */
export const cancelJobForClient = async (id, reason, clientId, userId) => {
    const job = await JobRequest.findByPk(id, { include: ['Vessel'], useMaster: true });
    if (!job) throw { statusCode: 404, message: 'The requested job could not be found.' };
    if (job.Vessel.client_id !== clientId) {
        throw { statusCode: 403, message: 'Access denied: this job does not belong to your account.' };
    }
    if (job.job_status !== 'CREATED') {
        throw {
            statusCode: 400,
            message: 'You can only cancel a job that is still in CREATED status. Please contact the GR-CLASS team for further assistance.'
        };
    }
    return await lifecycleService.updateJobStatus(id, 'REJECTED', userId, reason || 'Cancelled by client');
};

// ─────────────────────────────────────────────
// JOB DOCUMENTS
// ─────────────────────────────────────────────

/**
 * List all documents for a job with their verification status.
 */
export const getJobDocuments = async (jobId, user) => {
    const job = await requireJob(jobId, { includeVessel: true });

    // Client can only see their own jobs' docs
    if (user.role === 'CLIENT') {
        const vessel = await Vessel.findByPk(job.vessel_id);
        if (!vessel || vessel.client_id !== user.client_id) {
            throw { statusCode: 403, message: 'Access denied: this job does not belong to your account.' };
        }
    }

    const docs = await JobDocument.findAll({
        where: { job_id: jobId },
        include: [{
            model: CertificateRequiredDocument,
            attributes: ['id', 'document_name', 'is_mandatory']
        }],
        order: [['createdAt', 'ASC']],
        useReplica: true
    });

    const resolvedDocs = await fileAccessService.resolveEntity(docs, user);

    // Also get required docs to show what's still needed
    const requiredDocs = job.certificate_type_id
        ? await CertificateRequiredDocument.findAll({
            where: { certificate_type_id: job.certificate_type_id },
            useReplica: true
        })
        : [];

    const certificateType = job.certificate_type_id
        ? await db.CertificateType.findByPk(job.certificate_type_id, {
            attributes: ['id', 'name', 'issuing_authority', 'requires_survey'],
            useReplica: true
        })
        : null;

    const uploadedDocIds = docs.map(d => d.required_document_id);
    const missingDocs = requiredDocs.filter(rd => !uploadedDocIds.includes(rd.id));

    // Grouping by requirement
    const groupedRequirements = requiredDocs.map(rd => {
        const docsForReq = resolvedDocs.filter(d => d.required_document_id === rd.id);

        let status = 'MISSING';
        if (docsForReq.length > 0) {
            // Sort by createdAt desc to get the latest version first
            docsForReq.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            status = docsForReq[0].verification_status; // latest status: 'PENDING', 'APPROVED', or 'REJECTED'
        }

        return {
            requirement_id: rd.id,
            document_name: rd.document_name,
            is_mandatory: rd.is_mandatory,
            status: status,
            uploaded_versions: docsForReq
        };
    });

    const customDocuments = resolvedDocs.filter(d => !d.required_document_id);

    return {
        certificate_type: certificateType,
        grouped_requirements: groupedRequirements,
        custom_documents: customDocuments,
        documents: resolvedDocs,
        required_documents: requiredDocs,
        missing_documents: missingDocs,
        summary: {
            total_uploaded: docs.length,
            approved: docs.filter(d => d.verification_status === 'APPROVED').length,
            rejected: docs.filter(d => d.verification_status === 'REJECTED').length,
            pending: docs.filter(d => d.verification_status === 'PENDING').length,
            missing: missingDocs.length
        }
    };
};

/**
 * Upload additional documents for a job (Client adds new/missing docs).
 * Only allowed while job is in CREATED status.
 * documents: [{ required_document_id, file_url }]
 */
export const uploadJobDocuments = async (jobId, documents, user) => {
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
        throw { statusCode: 400, message: 'Please provide at least one document to upload.' };
    }

    const job = await requireJob(jobId, { includeVessel: true, useMaster: true });

    if (job.job_status !== 'CREATED') {
        throw { statusCode: 400, message: 'Documents can only be uploaded while the job is in CREATED status.' };
    }

    // Client ownership check
    if (user.role === 'CLIENT') {
        const vessel = await Vessel.findByPk(job.vessel_id, { useMaster: true });
        if (!vessel || vessel.client_id !== user.client_id) {
            throw { statusCode: 403, message: 'Access denied: this job does not belong to your account.' };
        }
    }

    const created = [];
    for (const doc of documents) {
        if (!doc.file_url) {
            throw { statusCode: 400, message: 'Each document must have a file_url.' };
        }
        if (!doc.required_document_id && !doc.custom_document_name) {
            throw { statusCode: 400, message: 'Each document must have either required_document_id or custom_document_name.' };
        }

        // Check if a PENDING document already exists for this requirement/name
        const existingPending = await JobDocument.findOne({
            where: {
                job_id: jobId,
                verification_status: 'PENDING',
                ...(doc.required_document_id ? { required_document_id: doc.required_document_id } : { custom_document_name: doc.custom_document_name })
            },
            useMaster: true
        });

        if (existingPending) {
            // Overwrite existing pending document
            await existingPending.update({
                file_url: doc.file_url,
                uploaded_by: user.id,
                rejection_reason: null // Clear any old rejection reason if it was somehow reused
            });
            created.push(existingPending);
        } else {
            // Create a new record
            const newDoc = await JobDocument.create({
                job_id: jobId,
                required_document_id: doc.required_document_id || null,
                custom_document_name: doc.custom_document_name || null,
                file_url: doc.file_url,
                uploaded_by: user.id,
                verification_status: 'PENDING'
            });
            created.push(newDoc);
        }
    }

    // Notify TO that new documents were uploaded
    notificationService.notifyRoles(['TO'], 'JOB_DOCUMENTS_UPLOADED', {
        jobId,
        vesselName: job.Vessel.vessel_name,
        count: created.length
    }).catch(() => { });

    return created;
};

/**
 * Re-upload a rejected document (Client fixes the doc TO flagged as invalid).
 * Replaces the old file_url and resets status to PENDING.
 */
export const reuploadJobDocument = async (jobId, documentId, body, user) => {
    if (!body.file_url) {
        throw { statusCode: 400, message: 'Please provide the new file_url for the document.' };
    }

    const job = await requireJob(jobId, { includeVessel: true, useMaster: true });

    if (job.job_status !== 'CREATED') {
        throw { statusCode: 400, message: 'Documents can only be re-uploaded while the job is in CREATED status.' };
    }

    // Client ownership check
    if (user.role === 'CLIENT') {
        const vessel = await Vessel.findByPk(job.vessel_id, { useMaster: true });
        if (!vessel || vessel.client_id !== user.client_id) {
            throw { statusCode: 403, message: 'Access denied: this job does not belong to your account.' };
        }
    }

    const doc = await JobDocument.findOne({
        where: { id: documentId, job_id: jobId },
        useMaster: true
    });
    if (!doc) {
        throw { statusCode: 404, message: 'Document not found for this job.' };
    }

    if (doc.verification_status !== 'REJECTED') {
        throw { statusCode: 400, message: `Only rejected documents can be re-uploaded. This document is currently: ${doc.verification_status}.` };
    }

    // Check if a PENDING version already exists for this requirement/name
    const existingPending = await JobDocument.findOne({
        where: {
            job_id: jobId,
            verification_status: 'PENDING',
            ...(doc.required_document_id ? { required_document_id: doc.required_document_id } : { custom_document_name: doc.custom_document_name })
        },
        useMaster: true
    });

    let resultDoc;
    if (existingPending) {
        // Overwrite existing pending document
        await existingPending.update({
            file_url: body.file_url,
            uploaded_by: user.id,
            rejection_reason: null
        });
        resultDoc = existingPending;
    } else {
        // Create a NEW record to maintain the audit trail of the rejected document
        resultDoc = await JobDocument.create({
            job_id: jobId,
            required_document_id: doc.required_document_id,
            custom_document_name: doc.custom_document_name,
            file_url: body.file_url,
            verification_status: 'PENDING',
            uploaded_by: user.id
        });
    }

    // Notify TO that a document was re-uploaded (or updated)
    notificationService.notifyRoles(['TO'], 'JOB_DOCUMENT_REUPLOADED', {
        jobId,
        vesselName: job.Vessel.vessel_name,
        documentId: resultDoc.id
    }).catch(() => { });

    return resultDoc;
};

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────

export const updatePriority = async (jobId, priority, reason, userId) => {
    const job = await requireJob(jobId, { useMaster: true });
    const oldPriority = job.priority;
    await job.update({ priority });
    await AuditLog.create({
        user_id: userId, action: 'UPDATE_PRIORITY',
        entity_name: 'JobRequest', entity_id: job.id,
        old_values: { priority: oldPriority }, new_values: { priority }, reason
    });
    return job;
};

export const getJobHistory = async (id, scopeFilters = {}) => {
    // Check if job exists and is accessible by the user (scope filtering)
    const job = await JobRequest.findOne({ where: { id, ...scopeFilters } });
    if (!job) {
        throw { statusCode: 404, message: 'The requested job could not be found or you do not have permission to view its history.' };
    }

    const jobHistory = await JobStatusHistory.findAll({
        where: { job_id: id },
        order: [['created_at', 'ASC']],
        attributes: ['id', 'job_id', 'previous_status', 'new_status', 'changed_by', 'reason', 'created_at'],
        include: [{ model: User, attributes: ['name', 'email', 'role'] }],
        useReplica: true
    });

    const survey = await Survey.findOne({ where: { job_id: id }, useReplica: true });
    const surveyHistory = survey ? await db.SurveyStatusHistory.findAll({
        where: { survey_id: survey.id },
        order: [['created_at', 'ASC']],
        attributes: ['id', 'survey_id', 'previous_status', 'new_status', 'changed_by', 'reason', 'submission_iteration', 'createdAt'],
        include: [{ model: User, as: 'User', attributes: ['name', 'email', 'role'] }],
        useReplica: true
    }) : [];

    return {
        job_history: jobHistory,
        survey_history: surveyHistory
    };
};

export const addInternalNote = async (jobId, noteText, userId) => {
    const note = await db.JobNote.create({ job_id: jobId, user_id: userId, note_text: noteText, is_internal: true });
    await db.Message.create({
        job_id: jobId,
        sender_id: userId,
        message_text: noteText,
        is_internal: true,
        attachment_url: null
    });
    return note;
};

export const updateJobStatus = (id, status, remarks, userId) => {
    throw { statusCode: 400, message: 'Direct status update is disabled. Use semantic workflow endpoints.' };
};
