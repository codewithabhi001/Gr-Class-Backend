const fs = require('fs');
const file = 'src/modules/checklists/checklist.service.js';
let content = fs.readFileSync(file, 'utf8');

const oldGetChecklist = `export const getChecklist = async (jobId, filters = {}, user = null) => {
    const { answer, question_code, search, job_certificate_id } = filters;
    const { job, jobCert, certId, survey } = await resolveJobAndCert(jobId, job_certificate_id);

    // Build where clause — use job_certificate_id if available, else fall back to job_id
    const where = certId
        ? { job_certificate_id: certId }
        : { job_id: jobId };

    if (answer) where.answer = answer;
    if (question_code) where.question_code = question_code;
    if (search) {
        where[db.Sequelize.Op.or] = [
            { question_text: { [db.Sequelize.Op.like]: \`%\${search}%\` } },
            { remarks: { [db.Sequelize.Op.like]: \`%\${search}%\` } }
        ];
    }

    const items = await ActivityPlanning.findAll({
        where,
        attributes: [
            'id', 'job_id', 'job_certificate_id',
            'question_code', 'question_text',
            'answer', 'remarks', 'file_url', 'status', 'rejection_reason',
            'created_at', 'updated_at'
        ]
    });

    const resolvedItems = await fileAccessService.resolveEntity(items, user);
    await ensureFullFileUrls(resolvedItems);

    // Signed checklist files from the certificate's survey
    const signedFiles = await resolveKeyArray(survey?.signed_checklist_files, user);

    // Checklist template for this certificate type
    let templateMeta = null;
    let templateFiles = [];
    let templateSections = [];
    try {
        const certTypeId = jobCert?.certificate_type_id;
        if (certTypeId) {
            const template = await ChecklistTemplate.findOne({
                where: { certificate_type_id: certTypeId, status: 'ACTIVE' },
                attributes: ['id', 'name', 'code', 'template_files', 'sections'],
            });
            if (template) {
                templateMeta = { id: template.id, name: template.name, code: template.code };
                templateSections = template.sections || [];
                const resolvedTemplate = await fileAccessService.resolveEntity(template, user);
                templateFiles = Array.isArray(resolvedTemplate?.template_files) ? resolvedTemplate.template_files : [];
            }
        }
    } catch (err) {
        templateMeta = null;
        templateFiles = [];
        templateSections = [];
    }

    return {
        job_certificate_id: certId,
        certificate_type_id: jobCert?.certificate_type_id,
        items: resolvedItems,
        signed_checklist_files: signedFiles,
        template_files: templateFiles,
        template: templateMeta,
        sections: templateSections
    };
};`;

const newGetChecklist = `export const getChecklist = async (jobId, filters = {}, user = null) => {
    const { answer, question_code, search, job_certificate_id } = filters;

    if (job_certificate_id) {
        return await getSingleChecklist(jobId, job_certificate_id, filters, user);
    } else {
        const job = await JobRequest.findByPk(jobId, { useMaster: true });
        if (!job) throw { statusCode: 404, message: 'The requested job could not be found.' };

        const certificates = await JobCertificate.findAll({
            where: { job_request_id: jobId },
            useMaster: true
        });

        if (!certificates || certificates.length === 0) return [];

        const checklists = [];
        for (const cert of certificates) {
            const cl = await getSingleChecklist(jobId, cert.id, filters, user);
            checklists.push(cl);
        }
        return checklists;
    }
};

const getSingleChecklist = async (jobId, job_certificate_id, filters, user) => {
    const { answer, question_code, search } = filters;
    const { job, jobCert, certId, survey } = await resolveJobAndCert(jobId, job_certificate_id);

    const where = certId ? { job_certificate_id: certId } : { job_id: jobId };

    if (answer) where.answer = answer;
    if (question_code) where.question_code = question_code;
    if (search) {
        where[db.Sequelize.Op.or] = [
            { question_text: { [db.Sequelize.Op.like]: \`%\${search}%\` } },
            { remarks: { [db.Sequelize.Op.like]: \`%\${search}%\` } }
        ];
    }

    const items = await ActivityPlanning.findAll({
        where,
        attributes: [
            'id', 'job_id', 'job_certificate_id',
            'question_code', 'question_text',
            'answer', 'remarks', 'file_url', 'status', 'rejection_reason',
            'created_at', 'updated_at'
        ]
    });

    const resolvedItems = await fileAccessService.resolveEntity(items, user);
    await ensureFullFileUrls(resolvedItems);

    const signedFiles = await resolveKeyArray(survey?.signed_checklist_files, user);

    let templateMeta = null;
    let templateFiles = [];
    let templateSections = [];
    try {
        const certTypeId = jobCert?.certificate_type_id;
        if (certTypeId) {
            const template = await ChecklistTemplate.findOne({
                where: { certificate_type_id: certTypeId, status: 'ACTIVE' },
                attributes: ['id', 'name', 'code', 'template_files', 'sections'],
            });
            if (template) {
                templateMeta = { id: template.id, name: template.name, code: template.code };
                templateSections = template.sections || [];
                const resolvedTemplate = await fileAccessService.resolveEntity(template, user);
                templateFiles = Array.isArray(resolvedTemplate?.template_files) ? resolvedTemplate.template_files : [];
            }
        }
    } catch (err) {
        templateMeta = null;
        templateFiles = [];
        templateSections = [];
    }

    return {
        job_certificate_id: certId,
        certificate_type_id: jobCert?.certificate_type_id,
        items: resolvedItems,
        signed_checklist_files: signedFiles,
        template_files: templateFiles,
        template: templateMeta,
        sections: templateSections
    };
};`;

if (content.includes(oldGetChecklist)) {
    content = content.replace(oldGetChecklist, newGetChecklist);
    fs.writeFileSync(file, content);
    console.log("Success");
} else {
    console.log("old content not found");
}
