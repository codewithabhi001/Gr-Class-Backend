import db from '../../models/index.js';
import { v4 as uuidv4 } from 'uuid';
import * as certificatePdfService from '../../services/certificate-pdf.service.js';
import logger from '../../utils/logger.js';
import { buildCertificateScopeWhere } from './certificate-scope.js';
import { buildFallbackCertificateHtml } from './templates/fallback-certificate.template.js';
import * as fileAccessService from '../../services/fileAccess.service.js';
import * as lifecycleService from '../../services/lifecycle.service.js';
import env from '../../config/env.js';
import { RBAC, isRoleAllowed } from '../../config/rbac.config.js';
import QRCode from 'qrcode';
import * as emailService from '../../services/email.service.js';
import * as s3Service from '../../services/s3.service.js';

const Certificate = db.Certificate;
const CertificateType = db.CertificateType;
const CertificateTemplate = db.CertificateTemplate;
const JobRequest = db.JobRequest;
const Vessel = db.Vessel;
const JobStatusHistory = db.JobStatusHistory;
const AuditLog = db.AuditLog;
const { Op } = db.Sequelize;

const buildCertificateQrTargetUrl = (certificateNumber) => {
    const configuredBase = process.env.CERTIFICATE_VERIFY_PUBLIC_URL
        || (env.frontendUrl ? `${env.frontendUrl.replace(/\/$/, '')}/certificate/verify` : null)
        || (process.env.APP_BASE_URL ? `${process.env.APP_BASE_URL.replace(/\/$/, '')}/api/v1/certificates/verify` : null)
        || 'https://api.grclass.com/api/v1/certificates/verify';
    let baseUrl = configuredBase.startsWith('http') ? configuredBase : `https://${configuredBase}`;
    baseUrl = baseUrl.replace(/\/$/, '');

    if (baseUrl.includes('{number}')) {
        return baseUrl.replace('{number}', encodeURIComponent(certificateNumber));
    }

    if (baseUrl.endsWith('/verify')) {
        return `${baseUrl}/${encodeURIComponent(certificateNumber)}`;
    }

    return `${baseUrl}/${encodeURIComponent(certificateNumber)}`;
};

/** Reusable scope filter for certificate list/get by role. Used in getCertificates, getCertificateById, getExpiringCertificates, preview, getHistory, download. */
export const getCertificateScopeFilter = async (user) => {
    return buildCertificateScopeWhere(user, { JobRequest, Vessel });
};

/** List certificate types — minimal fields only (no required_documents for performance). */
export const getCertificateTypes = async (includeInactive = false) => {
    const where = includeInactive ? {} : { status: 'ACTIVE' };
    return await CertificateType.findAll({
        where,
        attributes: ['id', 'name', 'issuing_authority', 'validity_years', 'status', 'requires_survey'],
        order: [['name', 'ASC']],
    });
};

/** Get a single certificate type by ID with full detail including all required documents. */
export const getCertificateTypeById = async (id) => {
    const type = await CertificateType.findByPk(id, {
        attributes: ['id', 'name', 'issuing_authority', 'validity_years', 'status', 'description', 'requires_survey'],
        include: [{
            model: db.CertificateRequiredDocument,
            attributes: ['id', 'document_name', 'is_mandatory'],
            order: [['document_name', 'ASC']]
        }],
    });
    if (!type) throw { statusCode: 404, message: 'Certificate type not found' };
    return type;
};

/** Create a new certificate type (ADMIN). */
export const createCertificateType = async (data) => {
    const existing = await CertificateType.findOne({ where: { name: data.name } });
    if (existing) throw { statusCode: 409, message: 'A certificate type with this name already exists' };

    const { required_documents, ...certData } = data;
    const txn = await db.sequelize.transaction();
    try {
        const type = await CertificateType.create({
            name: certData.name,
            issuing_authority: certData.issuing_authority,
            validity_years: certData.validity_years,
            status: certData.status ?? 'ACTIVE',
            description: certData.description ?? null,
            requires_survey: certData.requires_survey ?? true,
        }, { transaction: txn });

        if (required_documents && required_documents.length > 0) {
            const docsToCreate = required_documents.map(doc => ({
                certificate_type_id: type.id,
                document_name: doc.document_name,
                is_mandatory: doc.is_mandatory ?? true
            }));
            await db.CertificateRequiredDocument.bulkCreate(docsToCreate, { transaction: txn });
        }

        await txn.commit();
        return await CertificateType.findByPk(type.id, {
            include: [{ model: db.CertificateRequiredDocument, attributes: ['id', 'document_name', 'is_mandatory'] }]
        });
    } catch (e) {
        await txn.rollback();
        throw e;
    }
};

/** Update certificate type and required documents (ADMIN/TM). */
export const updateCertificateType = async (id, data) => {
    const type = await CertificateType.findByPk(id);
    if (!type) throw { statusCode: 404, message: 'Certificate type not found' };

    if (data.name && data.name !== type.name) {
        const existing = await CertificateType.findOne({ where: { name: data.name } });
        if (existing) throw { statusCode: 409, message: 'A certificate type with this name already exists' };
    }

    const { required_documents, ...certData } = data;
    const txn = await db.sequelize.transaction();
    try {
        await type.update(certData, { transaction: txn });

        if (required_documents) {
            // Re-create the required documents list for simplicity
            await db.CertificateRequiredDocument.destroy({ where: { certificate_type_id: id }, transaction: txn });
            if (required_documents.length > 0) {
                const docsToCreate = required_documents.map(doc => ({
                    certificate_type_id: id,
                    document_name: doc.document_name,
                    is_mandatory: doc.is_mandatory ?? true
                }));
                await db.CertificateRequiredDocument.bulkCreate(docsToCreate, { transaction: txn });
            }
        }

        await txn.commit();
        return await CertificateType.findByPk(id, {
            include: [{ model: db.CertificateRequiredDocument, attributes: ['id', 'document_name', 'is_mandatory'] }]
        });
    } catch (e) {
        await txn.rollback();
        throw e;
    }
};

const generateUniqueCertificateNumber = async (typeCode = null) => {
    const year = new Date().getFullYear();
    let isUnique = false;
    let certNumber;

    while (!isUnique) {
        const randomStr = uuidv4().substring(0, 8).toUpperCase();
        // Format: GR/TYPE/YEAR/RANDOM or GR/YEAR/RANDOM
        if (typeCode) {
            certNumber = `GR/${typeCode}/${year}/${randomStr}`;
        } else {
            certNumber = `GR/${year}/${randomStr}`;
        }
        
        const existing = await Certificate.findOne({ where: { certificate_number: certNumber } });
        if (!existing) {
            isUnique = true;
        }
    }
    return certNumber;
};

export const generateCertificate = async (data, user) => {
    if (!isRoleAllowed(RBAC.GENERATE_CERTIFICATE, user.role)) {
        throw { statusCode: 403, message: 'Only Admins, General Managers, or Technical Managers have permission to generate certificates.' };
    }
    const userId = user.id;
    const { job_id, validity_years, expiry_date, certificate_authority_id, flag_administration_id, certificate_term } = data;

    const transaction = await db.sequelize.transaction();
    try {
        // Lock Job row for the entire operation
        const job = await JobRequest.findByPk(job_id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
            include: [
                { model: db.Vessel, attributes: ['id', 'vessel_name', 'imo_number'] },
                { model: db.CertificateType, attributes: ['id', 'name', 'issuing_authority', 'short_code'] },
            ],
        });
        if (!job) throw { statusCode: 404, message: 'Job not found' };

        // ── Guard 1: Job status and Payment Compliance ──
        if (job.job_status !== 'FINALIZED') {
            throw { statusCode: 400, message: `Certificate can only be generated when job is FINALIZED. Current: ${job.job_status}` };
        }

        const payment = await db.Payment.findOne({
            where: { job_id: job.id, payment_status: 'PAID' },
            transaction
        });
        if (!payment) {
            throw { statusCode: 400, message: 'Compliance Violation: No verified PAID payment found for this job.' };
        }

        // ── Guard 2: Survey Compliance (if required) ──
        if (job.is_survey_required) {
            const survey = await db.Survey.findOne({ where: { job_id }, transaction, lock: transaction.LOCK.UPDATE });
            if (!survey) throw { statusCode: 400, message: 'Cannot generate certificate: Survey not found.' };

            if (survey.survey_status !== 'FINALIZED') {
                throw { statusCode: 400, message: 'Cannot generate certificate: Survey must be FINALIZED first.' };
            }

            if (survey.survey_statement_status !== 'ISSUED') {
                throw { statusCode: 400, message: 'Certificate cannot be generated before Survey Statement is issued.' };
            }

            if (!survey.attendance_photo_url) {
                throw { statusCode: 400, message: 'Compliance Violation: Attendance photo missing in survey records.' };
            }

            if (!survey.submit_latitude || !survey.submit_longitude) {
                throw { statusCode: 400, message: 'Compliance Violation: GPS coordinates missing in survey records.' };
            }
        }

        // ── Guard 3: No certificate already linked to this job ──
        if (job.generated_certificate_id) {
            throw { statusCode: 409, message: 'Certificate already issued for this job.' };
        }
        const existingCert = await Certificate.findOne({ where: { vessel_id: job.vessel_id, certificate_type_id: job.certificate_type_id, status: 'VALID' }, transaction });
        if (existingCert) {
            logger?.warn('Possible duplicate certificate attempt', { job_id, existing_cert_id: existingCert.id });
        }

        // ── Guard 4: No open Non-Conformities ──
        if (db.NonConformity) {
            const openNCs = await db.NonConformity.count({
                where: { job_id, status: { [Op.notIn]: ['CLOSED', 'RESOLVED'] } },
                transaction
            });
            if (openNCs > 0) {
                throw { statusCode: 400, message: `Cannot generate certificate: ${openNCs} open non-conformit${openNCs > 1 ? 'ies' : 'y'} must be resolved first.` };
            }
        }

        const issueDate = new Date();
        let expiryDate;
        if (expiry_date) {
            expiryDate = new Date(expiry_date);
        } else {
            expiryDate = new Date();
            expiryDate.setFullYear(issueDate.getFullYear() + (validity_years || 1));
            // In maritime, certificates usually expire the day before their anniversary
            expiryDate.setDate(expiryDate.getDate() - 1);
        }
        const certificateNumber = await generateUniqueCertificateNumber(job.CertificateType?.short_code);

        const cert = await Certificate.create({
            vessel_id: job.vessel_id,
            certificate_type_id: job.certificate_type_id,
            certificate_number: certificateNumber,
            issue_date: issueDate,
            expiry_date: expiryDate,
            status: 'DRAFT', // Changed from VALID to DRAFT
            source_type: 'INTERNAL',
            version: 1,
            issued_by_user_id: userId,
            certificate_authority_id: certificate_authority_id || null,
            flag_administration_id: flag_administration_id || null,
            certificate_term: certificate_term || null,
        }, { transaction });

        // Update job to CERTIFIED via lifecycle (ensures history record + terminal guard)
        await lifecycleService.updateJobStatus(job_id, 'CERTIFIED', userId,
            `Certificate ${certificateNumber} generated`, { transaction });
        await job.update({ generated_certificate_id: cert.id }, { transaction });

        await AuditLog.create({
            user_id: userId, action: 'GENERATE_CERTIFICATE',
            entity_name: 'Certificate', entity_id: cert.id,
            old_values: null,
            new_values: { job_id, certificate_number: certificateNumber, certificate_type_id: cert.certificate_type_id, vessel_id: cert.vessel_id }
        }, { transaction });

        await transaction.commit();

        // Generate PDF outside transaction (non-critical, best-effort)
        const template = await CertificateTemplate.findOne({
            where: { certificate_type_id: job.certificate_type_id, is_active: true },
            order: [['createdAt', 'DESC']]
        });
        const vessel = job.Vessel;
        let authority = null;
        let flagState = null;
        if (certificate_authority_id) {
            authority = await db.CertificateAuthority.findByPk(certificate_authority_id);
        }
        if (flag_administration_id) {
            flagState = await db.FlagAdministration.findByPk(flag_administration_id);
        }
        const grClassLogo = 'https://grclass.com/grclass-logo.webp';
        let authorityLogo = null;
        if (authority?.logo_url) {
            authorityLogo = await fileAccessService.resolveUrl(authority.logo_url, user, true);
        }
        let flagLogo = null;
        if (flagState?.logo_url) {
            flagLogo = await fileAccessService.resolveUrl(flagState.logo_url, user, true);
        }
        const issuingAuthority = authority?.name || job.CertificateType?.issuing_authority || 'GR CLASS';
        const variables = {
            vessel_name: vessel?.vessel_name ?? '',
            imo_number: vessel?.imo_number ?? '',
            issue_date: issueDate,
            expiry_date: expiryDate,
            certificate_number: certificateNumber,
            certificate_type: job.CertificateType?.name ?? '',
            port: job.target_port ?? '',
            place: job.target_port ?? '',
            certificate_term: certificate_term || '',
            issuing_authority: issuingAuthority,
            flag_state: flagState?.flag_state_name || '',
            gr_class_logo: grClassLogo,
            authority_logo: authorityLogo,
            flag_logo: flagLogo
        };
        let qrDataUrl = null;
        try {
            const qrTargetUrl = buildCertificateQrTargetUrl(certificateNumber);

            qrDataUrl = await QRCode.toDataURL(qrTargetUrl, {
                margin: 1,
                width: 300,
                errorCorrectionLevel: 'H'
            });
        } catch (e) {
            logger?.warn('QR generation failed', { err: e?.message });
        }

        variables.qr_image = qrDataUrl
            ? `<img src="${qrDataUrl}" alt="QR" style="width:140px;height:140px;"/>`
            : null;
        variables.qr_data_url = qrDataUrl;

        if (qrDataUrl) {
            logger.info({ entity: 'CERTIFICATE', event: 'QR_GENERATED', jobId: job_id, qrLength: qrDataUrl.length });
        } else {
            logger.warn({ entity: 'CERTIFICATE', event: 'QR_FAILED', jobId: job_id });
        }

        let fullHtml;
        if (template?.template_content) {
            let content = template.template_content;
            // Check if QR placeholder exists
            if (!content.includes('{{qr_image}}') && !content.includes('{{qr_data_url}}')) {
                // If missing, append it at the bottom with some styling
                content += `\n<div style="margin-top: 40px; text-align: center;">{{qr_image}}<br/><span style="font-size: 10px; color: #666;">Scan to verify</span></div>`;
            }
            const hasLogoPlaceholder = /\{\{\s*(gr_class_logo|authority_logo|flag_logo)\s*\}\}/.test(content);
            if (!hasLogoPlaceholder && (variables.gr_class_logo || variables.authority_logo || variables.flag_logo)) {
                const header = `
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
  <div style="width:140px;">
    ${variables.gr_class_logo ? `<img src="${variables.gr_class_logo}" style="max-width:140px;height:auto;" alt="GR CLASS"/>` : ''}
  </div>
  <div style="text-align:center;flex:1;font-weight:bold;font-size:13px;">
    ${variables.issuing_authority ? `By ${variables.issuing_authority}` : ''}
  </div>
  <div style="width:160px;text-align:right;">
    ${variables.flag_logo ? `<img src="${variables.flag_logo}" style="max-width:70px;max-height:50px;height:auto;margin-right:6px;" alt="Flag"/>` : ''}
    ${variables.authority_logo ? `<img src="${variables.authority_logo}" style="max-width:90px;max-height:60px;height:auto;" alt="Authority"/>` : ''}
  </div>
</div>
`;
                content = header + content;
            }
            fullHtml = certificatePdfService.wrapHtmlForPdf(certificatePdfService.fillTemplate(content, variables));
        } else {
            fullHtml = certificatePdfService.wrapHtmlForPdf(buildFallbackCertificateHtml({
                variables, issuingAuthority, qrDataUrl
            }));
        }
        try {
            const pdfBuffer = await certificatePdfService.htmlToPdfBuffer(fullHtml);
            const pdfUrl = await certificatePdfService.uploadCertificatePdf(pdfBuffer, certificateNumber);
            await cert.update({ pdf_file_url: pdfUrl });
        } catch (err) {
            logger?.warn('Certificate PDF generation/upload failed', { certId: cert.id, err: err?.message });
        }

        const finalCert = await Certificate.findByPk(cert.id, {
            include: [
                { model: db.Vessel, attributes: ['vessel_name', 'imo_number'] },
                { model: db.CertificateType, attributes: ['name'] }
            ]
        });
        if (finalCert && finalCert.pdf_file_url) {
            const key = fileAccessService.getKeyFromUrl(finalCert.pdf_file_url);
            const signedUrl = await fileAccessService.generateSignedUrl(key, 3600, user);
            finalCert.setDataValue('pdf_url', signedUrl);
        }

        // ── Non-blocking Notification Dispatch ──
        (async () => {
            try {
                const vesselId = job.vessel_id;
                const vesselFull = await Vessel.findByPk(vesselId, { attributes: ['client_id'] });
                
                const commonData = {
                    certificateNumber,
                    vesselName: vessel?.vessel_name,
                    certificateType: job.CertificateType?.name,
                    expiryDate: expiryDate.toLocaleDateString(),
                    jobId: job.id,
                    status: 'ISSUED'
                };

                // 1. Notify Client Users
                if (vesselFull?.client_id) {
                    const clientUsers = await db.User.findAll({
                        where: { client_id: vesselFull.client_id, role: 'CLIENT', status: 'ACTIVE' },
                        attributes: ['email']
                    });
                    const clientEmails = clientUsers.map(u => u.email);
                    if (clientEmails.length > 0) {
                        await emailService.sendTemplateEmail(clientEmails, 'CERTIFICATE_GENERATED', { 
                            ...commonData, 
                            isInternal: false 
                        });
                    }
                }

                // 2. Notify Internal Managers (GM & TM)
                const internalUsers = await db.User.findAll({
                    where: { role: { [Op.in]: ['GM', 'TM'] }, status: 'ACTIVE' },
                    attributes: ['email']
                });
                const internalEmails = internalUsers.map(u => u.email);
                
                // 3. Notify Assigned Surveyor
                if (job.assigned_surveyor_id) {
                    const surveyor = await db.User.findByPk(job.assigned_surveyor_id, { attributes: ['email'] });
                    if (surveyor?.email && !internalEmails.includes(surveyor.email)) {
                        internalEmails.push(surveyor.email);
                    }
                }

                if (internalEmails.length > 0) {
                    await emailService.sendTemplateEmail(internalEmails, 'CERTIFICATE_GENERATED', { 
                        ...commonData, 
                        isInternal: true 
                    });
                }
            } catch (err) {
                logger.error('Failed to dispatch certificate generation emails', { certificateNumber, err: err.message });
            }
        })();

        return finalCert;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const ALLOWED_CERT_LIST_FILTERS = ['vessel_id', 'certificate_type_id', 'status'];

export const getCertificates = async (query, user) => {
    const scopeWhere = await getCertificateScopeFilter(user);
    const { page = 1, limit = 10, ...rest } = query;
    const where = { ...scopeWhere };
    ALLOWED_CERT_LIST_FILTERS.forEach((key) => {
        if (rest[key] != null && rest[key] !== '') {
            where[key] = rest[key];
        }
    });

    return await Certificate.findAndCountAll({
        where,
        attributes: ['id', 'vessel_id', 'certificate_type_id', 'certificate_number', 'issue_date', 'expiry_date', 'status', 'createdAt'],
        limit: Math.min(parseInt(limit, 10) || 10, 100),
        offset: (Math.max(1, parseInt(page, 10)) - 1) * (parseInt(limit, 10) || 10),
        include: [{ model: db.Vessel, attributes: ['id', 'vessel_name', 'imo_number'] }, { model: db.CertificateType, attributes: ['id', 'name'] }],
    });
};

export const getCertificatesByVessel = async (vesselId, user) => {
    const scopeWhere = await getCertificateScopeFilter(user);
    // Security check: ensure user can access this vessel based on scope
    // The scopeWhere usually restricts by vessel_id list. We combine it.
    const where = { ...scopeWhere, vessel_id: vesselId };

    // Explicitly check if scopeWhere allows this vesselId if it has restrictions
    if (scopeWhere.vessel_id && scopeWhere.vessel_id[Op.in]) {
        if (!scopeWhere.vessel_id[Op.in].includes(vesselId) && !scopeWhere.vessel_id[Op.in].includes(null)) { // Handle [null] case for no access
            // In some cases Op.in might be complex, but for our simple scope builder:
            // If user scope restricts vessels, we must ensure requested vesselId is allowed.
            // Ideally simply querying with { ...scopeWhere, vessel_id: vesselId } handles it implicitly.
            // If scopeWhere says vessel_id IN [A, B] and we ask for C, result is empty. Correct.
        }
    }

    return await Certificate.findAll({
        where,
        include: [{ model: db.CertificateType, attributes: ['name'] }],
        order: [['expiry_date', 'ASC']]
    });
};

/** Get certificate generated for a specific job. */
export const getCertificateByJobId = async (jobId, user) => {
    const job = await JobRequest.findByPk(jobId, {
        attributes: ['id', 'generated_certificate_id']
    });

    if (!job) throw { statusCode: 404, message: 'Job not found' };
    if (!job.generated_certificate_id) {
        throw { statusCode: 404, message: 'Certificate not yet generated for this job' };
    }

    return await getCertificateById(job.generated_certificate_id, user);
};

/** Returns certificate by id. Throws 403 if certificate exists but user has no access (ownership scope). */
export const getCertificateById = async (id, user) => {
    const scopeWhere = await getCertificateScopeFilter(user);
    const cert = await Certificate.findOne({
        where: { id, ...scopeWhere },
        include: [{ model: db.Vessel, attributes: ['vessel_name', 'imo_number'] }, { model: db.CertificateType, attributes: ['name'] }],
    });
    if (cert) {
        if (cert.pdf_file_url) {
            const key = fileAccessService.getKeyFromUrl(cert.pdf_file_url);
            let pdfUrl = fileAccessService.generatePublicCdnUrl(key);
            if (!pdfUrl) {
                // Generate signed URL (1 hour access for internal/authorized users)
                pdfUrl = await fileAccessService.generateSignedUrl(key, 3600, user);
            }
            cert.setDataValue('pdf_url', pdfUrl);
        }
        return cert;
    }
    const exists = await Certificate.findByPk(id);
    if (exists) {
        logger.warn('Certificate access denied', { userId: user?.id, role: user?.role, certificateId: id });
        throw { statusCode: 403, message: 'You do not have access to this certificate' };
    }
    throw { statusCode: 404, message: 'Certificate not found' };
};

const CERT_TRANSITIONS = {
    VALID: ['SUSPENDED', 'REVOKED', 'EXPIRED'],
    SUSPENDED: ['VALID', 'REVOKED'],
    REVOKED: [],
    EXPIRED: ['VALID']
};

export const updateStatus = async (id, status, reason, userId) => {
    const cert = await Certificate.findByPk(id);
    if (!cert) throw { statusCode: 404, message: 'Certificate not found' };

    if (!CERT_TRANSITIONS[cert.status]?.includes(status)) {
        throw { statusCode: 400, message: `Invalid certificate status transition: ${cert.status} → ${status}` };
    }
    if (cert.status === 'REVOKED') throw { statusCode: 400, message: 'Revoked certificates cannot be modified.' };

    await cert.update({ status });

    await db.CertificateHistory.create({
        certificate_id: cert.id,
        status: status,
        changed_by_user_id: userId,
        change_reason: reason,
        changed_at: new Date()
    });

    return cert;
};

export const renewCertificate = async (id, validityYears, reason, userId) => {
    const oldCert = await Certificate.findByPk(id, { include: [db.CertificateType] });
    if (!oldCert) throw { statusCode: 404, message: 'Certificate not found' };

    await oldCert.update({ status: 'EXPIRED' });

    const issueDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(issueDate.getFullYear() + validityYears);

    const newCert = await Certificate.create({
        vessel_id: oldCert.vessel_id,
        certificate_type_id: oldCert.certificate_type_id,
        certificate_number: await generateUniqueCertificateNumber(oldCert.CertificateType?.short_code),
        issue_date: issueDate,
        expiry_date: expiryDate,
        status: 'VALID',
        issued_by_user_id: userId
    });

    await db.CertificateHistory.create({
        certificate_id: oldCert.id,
        status: 'RENEWED',
        changed_by_user_id: userId,
        change_reason: `Renewed. New Cert: ${newCert.certificate_number}`,
        changed_at: new Date()
    });

    return newCert;
};

export const updateDraft = async (id, data, user) => {
    const cert = await Certificate.findByPk(id);
    if (!cert) throw { statusCode: 404, message: 'Certificate not found' };
    if (cert.status !== 'DRAFT') throw { statusCode: 400, message: 'Only draft certificates can be updated' };

    const { flag_administration_id, certificate_authority_id, certificate_term, manual_text, remarks, issue_date, expiry_date } = data;
    
    await cert.update({
        flag_administration_id,
        certificate_authority_id,
        certificate_term,
        manual_text,
        remarks,
        issue_date,
        expiry_date
    });

    await db.CertificateHistory.create({
        certificate_id: cert.id,
        status: cert.status,
        changed_by_user_id: user.id,
        change_reason: 'Draft updated with manual data/remarks',
        changed_at: new Date()
    });

    return cert;
};

export const issueCertificate = async (id, user) => {
    const transaction = await db.sequelize.transaction();
    try {
        const cert = await Certificate.findByPk(id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
            include: [
                { model: db.Vessel },
                { model: db.CertificateType },
                { model: db.FlagAdministration, as: 'FlagState' },
                { model: db.CertificateAuthority, as: 'Authority' }
            ]
        });

        if (!cert) throw { statusCode: 404, message: 'Certificate not found' };
        if (cert.status !== 'DRAFT') throw { statusCode: 400, message: 'Only draft certificates can be issued' };

        const issuedAt = new Date();
        await cert.update({
            status: 'ISSUED',
            issued_at: issuedAt,
            issued_by_user_id: user.id
        }, { transaction });

        // Resolve Logos
        const grClassLogo = 'https://grclass.com/grclass-logo.webp';
        let authorityLogo = null;
        if (cert.Authority?.logo_url) {
            authorityLogo = await fileAccessService.resolveUrl(cert.Authority.logo_url, user, true);
        }
        let flagLogo = null;
        if (cert.FlagState?.logo_url) {
            flagLogo = await fileAccessService.resolveUrl(cert.FlagState.logo_url, user, true);
        }

        // Generate PDF
        const variables = {
            vessel_name: cert.Vessel?.vessel_name || '',
            imo_number: cert.Vessel?.imo_number || '',
            certificate_number: cert.certificate_number,
            certificate_type: cert.CertificateType?.name || '',
            issue_date: cert.issue_date,
            expiry_date: cert.expiry_date,
            certificate_term: cert.certificate_term,
            flag_state: cert.FlagState?.flag_state_name || '',
            issuing_authority: cert.Authority?.name || 'GR CLASS',
            manual_text: cert.manual_text ? JSON.parse(cert.manual_text) : {},
            remarks: cert.remarks || '',
            gr_class_logo: grClassLogo,
            authority_logo: authorityLogo,
            flag_logo: flagLogo
        };

        let qrDataUrl = null;
        try {
            qrDataUrl = await QRCode.toDataURL(buildCertificateQrTargetUrl(cert.certificate_number), {
                margin: 1, width: 300, errorCorrectionLevel: 'H'
            });
        } catch (e) { logger.warn('QR generation failed', { err: e.message }); }

        const fullHtml = buildFallbackCertificateHtml({
            variables, 
            issuingAuthority: variables.issuing_authority,
            qrDataUrl
        });

        const pdfBuffer = await certificatePdfService.htmlToPdfBuffer(certificatePdfService.wrapHtmlForPdf(fullHtml));
        const pdfKey = await s3Service.uploadFile(pdfBuffer, `${cert.certificate_number}.pdf`, 'application/pdf', 'certificates');

        await cert.update({ generated_pdf_url: pdfKey, pdf_file_url: pdfKey }, { transaction });

        await db.CertificateHistory.create({
            certificate_id: cert.id,
            status: 'ISSUED',
            changed_by_user_id: user.id,
            change_reason: 'Certificate officially issued and PDF generated',
            changed_at: issuedAt
        }, { transaction });

        await transaction.commit();
        return cert;
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

export const reissueCertificate = async (id, reason, userId) => {
    const transaction = await db.sequelize.transaction();
    try {
        const oldCert = await Certificate.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
        if (!oldCert) throw { statusCode: 404, message: 'Original certificate not found' };

        // Revoke old certificate
        await oldCert.update({ status: 'REVOKED' }, { transaction });

        // Create new version as DRAFT
        const newCertData = {
            ...oldCert.toJSON(),
            id: undefined,
            status: 'DRAFT',
            version: oldCert.version + 1,
            certificate_number: await generateUniqueCertificateNumber(),
            issued_at: null,
            pdf_file_url: null,
            generated_pdf_url: null,
            qr_code_url: null,
            issued_by_user_id: userId
        };

        const newCert = await Certificate.create(newCertData, { transaction });

        await db.CertificateHistory.create({
            certificate_id: oldCert.id,
            status: 'REVOKED',
            changed_by_user_id: userId,
            change_reason: `Re-issued as Version ${newCert.version}. Reason: ${reason}`,
            changed_at: new Date()
        }, { transaction });

        await transaction.commit();
        return newCert;
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

export const getCertificateUploadUrl = async (fileName, contentType) => {
    const key = s3Service.generateKey(fileName, 'certificates/external');
    const uploadUrl = await s3Service.getUploadSignedUrl(key, contentType);
    return { uploadUrl, key };
};

export const uploadExternalCertificate = async (vesselId, data, userId) => {
    const { certificate_type_id, certificate_number, issue_date, expiry_date, s3_key, certificate_authority_id } = data;

    const cert = await Certificate.create({
        vessel_id: vesselId,
        certificate_type_id,
        certificate_authority_id,
        certificate_number,
        issue_date,
        expiry_date,
        source_type: 'EXTERNAL',
        status: 'ISSUED', // External certs are issued by default
        uploaded_file_url: s3_key,
        pdf_file_url: s3_key,
        issued_by_user_id: userId,
        version: 1
    });

    await db.CertificateHistory.create({
        certificate_id: cert.id,
        status: 'ISSUED',
        changed_by_user_id: userId,
        change_reason: 'External certificate uploaded manually',
        changed_at: new Date()
    });

    return cert;
};

export const previewCertificate = async (id, user) => {
    const cert = await getCertificateById(id, user);
    return { preview_url: `https://mock-pdf.com/preview/${id}`, data: cert };
};

export const getHistory = async (id, user) => {
    await getCertificateById(id, user);
    return await db.CertificateHistory.findAll({ where: { certificate_id: id }, order: [['changed_at', 'DESC']] });
};

export const transferCertificate = async (id, newOwnerId, reason, userId) => {
    const cert = await Certificate.findByPk(id, { include: [db.CertificateType] });
    if (!cert) throw { statusCode: 404, message: 'Certificate not found' };

    await cert.update({ status: 'TRANSFERRED' });

    const newCert = await Certificate.create({
        vessel_id: cert.vessel_id,
        certificate_type_id: cert.certificate_type_id,
        certificate_number: await generateUniqueCertificateNumber(cert.CertificateType?.short_code),
        issue_date: new Date(),
        expiry_date: cert.expiry_date,
        status: 'VALID',
        issued_by_user_id: userId
    });

    await db.CertificateHistory.create({
        certificate_id: cert.id,
        status: 'TRANSFERRED',
        changed_by_user_id: userId,
        change_reason: `Transferred ownership. New Cert: ${newCert.certificate_number}. Reason: ${reason}`,
        changed_at: new Date()
    });

    return newCert;
};

export const extendCertificate = async (id, extensionMonths, reason, userId) => {
    const cert = await Certificate.findByPk(id);
    if (!cert) throw { statusCode: 404, message: 'Certificate not found' };

    const newExpiry = new Date(cert.expiry_date);
    newExpiry.setMonth(newExpiry.getMonth() + extensionMonths);

    await cert.update({ expiry_date: newExpiry });

    await db.CertificateHistory.create({
        certificate_id: cert.id,
        status: cert.status,
        changed_by_user_id: userId,
        change_reason: `Extended by ${extensionMonths} months: ${reason}`,
        changed_at: new Date()
    });

    return cert;
};

export const downgradeCertificate = async (id, newTypeId, reason, userId) => {
    const cert = await Certificate.findByPk(id);
    const newType = await db.CertificateType.findByPk(newTypeId);
    if (!cert) throw { statusCode: 404, message: 'Certificate not found' };

    await cert.update({ status: 'DOWNGRADED' });

    const newCert = await Certificate.create({
        vessel_id: cert.vessel_id,
        certificate_type_id: newTypeId,
        certificate_number: await generateUniqueCertificateNumber(newType?.short_code),
        issue_date: new Date(),
        expiry_date: cert.expiry_date,
        status: 'VALID',
        issued_by_user_id: userId
    });

    await db.CertificateHistory.create({
        certificate_id: cert.id,
        status: 'DOWNGRADED',
        changed_by_user_id: userId,
        change_reason: `Downgraded to type ${newTypeId}. New Cert: ${newCert.certificate_number}. Reason: ${reason}`,
        changed_at: new Date()
    });

    return newCert;
};

export const getExpiringCertificates = async (days, user) => {
    const scopeWhere = await getCertificateScopeFilter(user);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const target = new Date();
    target.setDate(today.getDate() + days);
    target.setHours(23, 59, 59, 999); // End of target day

    return await Certificate.findAll({
        where: {
            ...scopeWhere,
            status: 'VALID',
            expiry_date: {
                [Op.between]: [today, target],
            },
        },
        include: [{ model: db.Vessel, attributes: ['vessel_name', 'imo_number', 'client_id'] }],
    });
};

export const bulkRenew = async (ids, validityYears, reason, userId) => {
    const renewalPromises = ids.map(async (id) => {
        try {
            const cert = await renewCertificate(id, validityYears, reason, userId);
            return { id, status: 'SUCCESS', cert };
        } catch (e) {
            return { id, status: 'FAILED', error: e.message };
        }
    });

    const results = await Promise.all(renewalPromises);
    return results;
};

export const verifyCertificate = async (certificateNumber) => {
    const cert = await Certificate.findOne({
        where: { certificate_number: certificateNumber },
        include: [
            { model: db.Vessel, attributes: ['vessel_name', 'imo_number'] }, 
            { model: db.CertificateType, attributes: ['name'] },
            { model: db.CertificateAuthority, as: 'Authority', attributes: ['name', 'code'] },
            { model: db.FlagAdministration, as: 'FlagState', attributes: ['flag_state_name'] },
            { model: db.User, as: 'issuer', attributes: ['first_name', 'last_name'] }
        ]
    });
    if (!cert) throw { statusCode: 404, message: 'Certificate not found' };

    let pdfUrl = null;
    if (cert.pdf_file_url) {
        const key = fileAccessService.getKeyFromUrl(cert.pdf_file_url);
        pdfUrl = fileAccessService.generatePublicCdnUrl(key);
        if (!pdfUrl) {
            pdfUrl = await fileAccessService.generateSignedUrl(key, 900);
        }
    }

    return {
        valid: ['VALID', 'ISSUED'].includes(cert.status) && new Date(cert.expiry_date) >= new Date().setHours(0, 0, 0, 0),
        certificate: {
            certificate_number: cert.certificate_number,
            status: cert.status,
            issue_date: cert.issue_date,
            expiry_date: cert.expiry_date,
            vessel_name: cert.Vessel?.vessel_name,
            imo_number: cert.Vessel?.imo_number,
            certificate_type: cert.CertificateType?.name,
            issuing_authority: cert.Authority?.name,
            flag_state: cert.FlagState?.flag_state_name,
            issued_by: cert.issuer ? `${cert.issuer.first_name} ${cert.issuer.last_name}` : 'GR CLASS'
        },
        pdf_url: pdfUrl
    };
};
