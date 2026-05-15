import db from '../../models/index.js';
import * as fileAccessService from '../../services/fileAccess.service.js';
import * as lifecycleService from '../../services/lifecycle.service.js';
import * as s3Service from '../../services/s3.service.js';

const { ActivityPlanning, ChecklistTemplate, JobRequest, Survey } = db;

// ─────────────────────────────────────────────────────────────────────────────
// GET CHECKLIST
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns checklist items for a job, plus the signed-checklist scan files
 * attached on the survey row.
 *
 * Response shape:
 *   {
 *     items: [{ id, job_id, question_code, ..., file_url }],
 *     signed_checklist_files: [<full https url>, ...]   // resolved
 *     template_files: [<full https url>, ...]           // resolved
 *     template: { id, name, code }                     // minimal template metadata (or null)
 *   }
 *
 * All file_url / signed_checklist_files entries are guaranteed to be either
 * fully-qualified HTTPS URLs or null — raw S3 keys are never leaked.
 */
export const getChecklist = async (jobId, filters = {}, user = null) => {
    const { answer, question_code, search } = filters;
    const job = await JobRequest.findByPk(jobId);
    if (!job) throw { statusCode: 404, message: 'The requested job could not be found.' };
    const where = { job_id: jobId };

    if (answer) where.answer = answer;
    if (question_code) where.question_code = question_code;
    if (search) {
        where[db.Sequelize.Op.or] = [
            { question_text: { [db.Sequelize.Op.like]: `%${search}%` } },
            { remarks: { [db.Sequelize.Op.like]: `%${search}%` } }
        ];
    }

    const items = await ActivityPlanning.findAll({
        where,
        attributes: [
            'id',
            'job_id',
            'question_code',
            'question_text',
            'answer',
            'remarks',
            'file_url',
            'status',
            'rejection_reason',
            'created_at',
            'updated_at'
        ]
    });

    const resolvedItems = await fileAccessService.resolveEntity(items, user);
    await ensureFullFileUrls(resolvedItems);

    // Pull the signed-checklist scan keys from the survey row (if any) and
    // resolve them to full HTTPS URLs.
    const survey = await Survey.findOne({
        where: { job_id: jobId },
        attributes: ['signed_checklist_files']
    });
    const signedFiles = await resolveKeyArray(survey?.signed_checklist_files, user);

    // Pull active checklist template reference docs (blank DOCX/PDF) for this job's
    // certificate type. These are read-only and help the surveyor download/print.
    let templateMeta = null;
    let templateFiles = [];
    let templateSections = [];
    try {
        const template = await ChecklistTemplate.findOne({
            where: { certificate_type_id: job.certificate_type_id, status: 'ACTIVE' },
            attributes: ['id', 'name', 'code', 'template_files', 'sections'],
        });
        if (template) {
            templateMeta = { id: template.id, name: template.name, code: template.code };
            templateSections = template.sections || [];
            const resolvedTemplate = await fileAccessService.resolveEntity(template, user);
            templateFiles = Array.isArray(resolvedTemplate?.template_files) ? resolvedTemplate.template_files : [];
        }
    } catch (err) {
        // Non-blocking: checklist answers should still be viewable even if template lookup fails.
        templateMeta = null;
        templateFiles = [];
        templateSections = [];
    }

    return {
        items: resolvedItems,
        signed_checklist_files: signedFiles,
        template_files: templateFiles,
        template: templateMeta,
        sections: templateSections // Added full sections for UI initialization
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT CHECKLIST
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Persists checklist answers and (optionally) the S3 keys of the full
 * signed-checklist scan document(s) on the same call.
 *
 * Returns:
 *   {
 *     items: [...],                         // saved rows, file_url fully resolved
 *     signed_checklist_files: [https, ...]  // resolved URLs (or [])
 *   }
 *
 * Accepts the full `req.user` (or a raw user id string for legacy callers
 * such as test_full_flow.js) so audit log entries are attributed correctly.
 */
export const submitChecklist = async (jobId, items, user, signedChecklistFiles = null) => {
    // Normalise: caller may pass a full req.user object OR just the user id (string).
    const userObj = (typeof user === 'object' && user !== null) ? user : (user ? { id: user } : null);
    const userId = userObj?.id;
    const job = await JobRequest.findByPk(jobId);
    if (!job) throw { statusCode: 404, message: 'The requested job could not be found.' };

    // ── Guard 1: Terminal state ──
    if (lifecycleService.JOB_TERMINAL_STATES.includes(job.job_status)) {
        throw { statusCode: 400, message: `This job has already been closed and cannot be modified further.` };
    }

    // ── Guard 2: Post-finalization (payment / certified) ──
    if (lifecycleService.JOB_POST_FINALIZATION_STATES.includes(job.job_status)) {
        throw { statusCode: 400, message: `The checklist cannot be updated as the job has already moved to ${job.job_status} status.` };
    }

    // ── Guard 3: Only the assigned surveyor ──
    if (job.assigned_surveyor_id !== userId) {
        throw { statusCode: 403, message: 'You are not the assigned surveyor for this job.' };
    }

    if (job.is_survey_required === false) {
        throw { statusCode: 400, message: "Survey not required for this job." };
    }

    const survey = await Survey.findOne({ where: { job_id: jobId } });
    if (!survey) throw { statusCode: 400, message: 'The survey has not been started yet. Please check-in first.' };

    // ── Guard 4: Survey must be in an active state (not before, not after) ──
    const activeStatuses = ['STARTED', 'CHECKLIST_SUBMITTED', 'PROOF_UPLOADED', 'REWORK_REQUIRED'];
    if (!activeStatuses.includes(survey.survey_status)) {
        throw { statusCode: 400, message: `The checklist cannot be modified as the survey is in ${survey.survey_status} status.` };
    }

    if (signedChecklistFiles !== null && signedChecklistFiles !== undefined && !Array.isArray(signedChecklistFiles)) {
        throw { statusCode: 400, message: 'signed_checklist_files must be an array of S3 keys.' };
    }

    const txn = await db.sequelize.transaction();
    try {
        // Targeted Update: We find existing items by (job_id, question_code) or create new ones.
        // If an item is modified, we reset its status to 'PENDING'.
        const results = [];
        for (const item of items) {
            let record = await ActivityPlanning.findOne({ 
                where: { job_id: jobId, question_code: item.question_code },
                transaction: txn 
            });

            if (record) {
                await record.update({
                    ...item,
                    status: 'PENDING',
                    rejection_reason: null
                }, { transaction: txn });
            } else {
                record = await ActivityPlanning.create({
                    job_id: jobId,
                    ...item,
                    status: 'PENDING',
                    rejection_reason: null
                }, { transaction: txn });
            }
            results.push(record);
        }

        // Persist the signed-checklist scan objects on the same survey row, if provided.
        if (Array.isArray(signedChecklistFiles)) {
            // If the caller sends plain strings (legacy/simple upload), wrap them into objects
            const normalizedFiles = signedChecklistFiles.map(file => {
                if (typeof file === 'string') {
                    return { url: file, status: 'PENDING', rejection_reason: null };
                }
                return { 
                    ...file, 
                    status: 'PENDING', 
                    rejection_reason: null 
                };
            });
            survey.set('signed_checklist_files', normalizedFiles);
            survey.changed('signed_checklist_files', true);
            await survey.save({ transaction: txn });
        }

        // ─────────────────────────────────────────────────────────────
        // 4. Update Survey Status
        // If we were in STARTED or REWORK_REQUIRED, move forward.
        // If proof already exists, we can jump straight to PROOF_UPLOADED.
        // ─────────────────────────────────────────────────────────────
        if (['STARTED', 'REWORK_REQUIRED', 'CHECKLIST_SUBMITTED'].includes(survey.survey_status)) {
            const nextStatus = survey.evidence_proof_url ? 'PROOF_UPLOADED' : 'CHECKLIST_SUBMITTED';
            
            // Avoid redundant status updates (idempotency)
            if (survey.survey_status !== nextStatus) {
                await lifecycleService.updateSurveyStatus(survey.id, nextStatus, userId,
                    'Checklist items submitted/corrected', { transaction: txn });
            }
        }

        await txn.commit();

        const resolvedItems = await fileAccessService.resolveEntity(results, userObj);
        await ensureFullFileUrls(resolvedItems);

        const persistedFiles = Array.isArray(signedChecklistFiles)
            ? (await Survey.findOne({ where: { job_id: jobId }, attributes: ['signed_checklist_files'] })).signed_checklist_files
            : (survey.signed_checklist_files || []);
        const signedFilesResolved = await resolveKeyArray(persistedFiles, userObj);

        return {
            items: resolvedItems,
            signed_checklist_files: signedFilesResolved
        };
    } catch (error) {
        if (!txn.finished) await txn.rollback();
        throw error;
    }
};

/**
 * Update ONLY the signed checklist scan S3 keys on the survey.
 *
 * This supports a clean frontend flow:
 *   1) Save checklist answers (PUT /checklists/jobs/:jobId)
 *   2) Upload signed checklist scans on a dedicated screen (this endpoint)
 *
 * Returns:
 *   { signed_checklist_files: [https, ...] }
 */
export const updateSignedChecklistFiles = async (jobId, signedChecklistFiles, user) => {
    const userObj = (typeof user === 'object' && user !== null) ? user : (user ? { id: user } : null);
    const userId = userObj?.id;

    const job = await JobRequest.findByPk(jobId);
    if (!job) throw { statusCode: 404, message: 'The requested job could not be found.' };

    if (lifecycleService.JOB_TERMINAL_STATES.includes(job.job_status)) {
        throw { statusCode: 400, message: `This job has already been closed and cannot be modified further.` };
    }
    if (lifecycleService.JOB_POST_FINALIZATION_STATES.includes(job.job_status)) {
        throw { statusCode: 400, message: `The checklist cannot be updated as the job has already moved to ${job.job_status} status.` };
    }
    if (job.assigned_surveyor_id !== userId) {
        throw { statusCode: 403, message: 'You are not the assigned surveyor for this job.' };
    }
    if (job.is_survey_required === false) {
        throw { statusCode: 400, message: "Survey not required for this job." };
    }
    if (!Array.isArray(signedChecklistFiles)) {
        throw { statusCode: 400, message: 'signed_checklist_files must be an array of S3 keys.' };
    }

    const survey = await Survey.findOne({ where: { job_id: jobId } });
    if (!survey) throw { statusCode: 400, message: 'The survey has not been started yet. Please check-in first.' };

    const activeStatuses = ['STARTED', 'CHECKLIST_SUBMITTED', 'PROOF_UPLOADED', 'REWORK_REQUIRED'];
    if (!activeStatuses.includes(survey.survey_status)) {
        throw { statusCode: 400, message: `The signed checklist files cannot be modified as the survey is in ${survey.survey_status} status.` };
    }

    // Normalized: Ensure they are objects with PENDING status if they are being updated/added
    const normalizedFiles = signedChecklistFiles.map(file => {
        if (typeof file === 'string') {
            return { url: file, status: 'PENDING', rejection_reason: null };
        }
        // If it's already an object, reset its status to PENDING as it's a re-upload/edit
        return { ...file, status: 'PENDING', rejection_reason: null };
    });

    survey.set('signed_checklist_files', normalizedFiles);
    survey.changed('signed_checklist_files', true);
    await survey.save();

    const signedFilesResolved = await resolveKeyArray(normalizedFiles, userObj);
    return { signed_checklist_files: signedFilesResolved };
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Defence-in-depth: walks an array of checklist rows and guarantees that
 * `file_url` is either a fully-qualified HTTPS URL or null.
 */
const ensureFullFileUrls = async (rows) => {
    if (!rows) return rows;
    const list = Array.isArray(rows) ? rows : [rows];

    await Promise.all(list.map(async (row) => {
        if (!row || typeof row !== 'object') return;
        const value = row.file_url;
        if (!value) {
            row.file_url = null;
            return;
        }
        if (typeof value === 'string' && !value.startsWith('http')) {
            row.file_url = await fileAccessService.resolveUrl(value, null, true);
        }
    }));

    return rows;
};

/**
 * Resolve an array of S3 keys (or objects containing keys) into full HTTPS URLs.
 * Returns [] for null/empty input.
 */
const resolveKeyArray = async (items, user = null) => {
    if (!Array.isArray(items) || items.length === 0) return [];
    
    return Promise.all(
        items.map(async (item) => {
            if (!item) return null;
            
            // Handle both legacy string format and new object format
            const isObject = typeof item === 'object' && item !== null;
            const rawKey = isObject ? item.url : item;
            
            if (typeof rawKey !== 'string' || rawKey.length === 0) return null;
            
            const fullUrl = rawKey.startsWith('http')
                ? rawKey
                : await fileAccessService.resolveUrl(rawKey, user, true);
                
            if (isObject) {
                return { ...item, url: fullUrl };
            }
            return fullUrl;
        })
    ).then(results => results.filter(r => r !== null));
};

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD URL — per checklist-item evidence (one photo per question)
// ─────────────────────────────────────────────────────────────────────────────

export const getSignedUploadUrl = async (jobId, fileName, contentType, userId) => {
    const job = await JobRequest.findByPk(jobId);
    if (!job) throw { statusCode: 404, message: 'The requested job could not be found.' };

    // Guard: Only assigned surveyor can upload proof for checklist
    if (job.assigned_surveyor_id !== userId) {
        throw { statusCode: 403, message: 'You are not the assigned surveyor for this job.' };
    }

    if (lifecycleService.JOB_TERMINAL_STATES.includes(job.job_status)) {
        throw { statusCode: 400, message: `This job has already been closed and cannot be modified further.` };
    }

    const key = `surveys/checklist-evidence/${jobId}/${Date.now()}_${fileName}`;
    const signedUrl = await s3Service.getUploadSignedUrl(key, contentType);

    return {
        uploadUrl: signedUrl,
        fileKey: key,
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD URL — full signed-checklist scan (the whole filled & signed sheet)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a pre-signed S3 URL for the surveyor to upload the full signed
 * checklist scan (PDF/image). The returned `fileKey` should then be sent
 * back as part of `signed_checklist_files` on the next
 * PUT /checklists/jobs/:jobId submission.
 */
export const getSignedChecklistUploadUrl = async (jobId, fileName, contentType, userId) => {
    const job = await JobRequest.findByPk(jobId);
    if (!job) throw { statusCode: 404, message: 'The requested job could not be found.' };

    if (job.assigned_surveyor_id !== userId) {
        throw { statusCode: 403, message: 'You are not the assigned surveyor for this job.' };
    }

    if (lifecycleService.JOB_TERMINAL_STATES.includes(job.job_status)) {
        throw { statusCode: 400, message: `This job has already been closed and cannot be modified further.` };
    }

    if (job.is_survey_required === false) {
        throw { statusCode: 400, message: "Survey not required for this job." };
    }

    const key = `surveys/signed-checklists/${jobId}/${Date.now()}_${fileName}`;
    const signedUrl = await s3Service.getUploadSignedUrl(key, contentType);

    return {
        uploadUrl: signedUrl,
        fileKey: key,
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// TM REVIEW ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TM action to approve/reject a specific checklist item.
 */
export const reviewChecklistItem = async (jobId, itemId, { status, rejection_reason }, user) => {
    if (!['TM', 'ADMIN'].includes(user.role)) {
        throw { statusCode: 403, message: 'Only Technical Managers (TM) or Admins can review checklist items.' };
    }

    const item = await ActivityPlanning.findOne({ where: { id: itemId, job_id: jobId } });
    if (!item) throw { statusCode: 404, message: 'Checklist item not found.' };

    await item.update({ 
        status, 
        rejection_reason: status === 'REJECTED' ? rejection_reason : null 
    });

    return item;
};

/**
 * TM action to approve/reject a specific signed checklist document.
 * Matches by index in the signed_checklist_files array.
 */
export const reviewSignedDocument = async (jobId, fileIndex, { status, rejection_reason }, user) => {
    if (!['TM', 'ADMIN'].includes(user.role)) {
        throw { statusCode: 403, message: 'Only Technical Managers (TM) or Admins can review documents.' };
    }

    const survey = await Survey.findOne({ where: { job_id: jobId } });
    if (!survey) throw { statusCode: 404, message: 'Survey not found.' };

    const files = survey.signed_checklist_files || [];
    if (!files[fileIndex]) throw { statusCode: 400, message: 'Document not found at specified index.' };

    // Update the specific file object at the index
    const updatedFiles = [...files];
    updatedFiles[fileIndex] = {
        ...(typeof updatedFiles[fileIndex] === 'string' ? { url: updatedFiles[fileIndex] } : updatedFiles[fileIndex]),
        status,
        rejection_reason: status === 'REJECTED' ? rejection_reason : null
    };

    // Use survey.changed to ensure Sequelize detects the internal JSON change
    survey.set('signed_checklist_files', updatedFiles);
    survey.changed('signed_checklist_files', true);
    await survey.save();

    return { 
        index: fileIndex, 
        file: await resolveKeyArray([updatedFiles[fileIndex]], user).then(res => res[0]) 
    };
};
