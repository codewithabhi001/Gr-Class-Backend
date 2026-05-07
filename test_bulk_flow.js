
import db from './src/models/index.js';
import * as jobService from './src/modules/jobs/job.service.js';
import * as surveyService from './src/modules/surveys/survey.service.js';
import * as checklistService from './src/modules/checklists/checklist.service.js';
import * as paymentService from './src/modules/payments/payment.service.js';
import * as certificateService from './src/modules/certificates/certificate.service.js';
import * as s3Service from './src/services/s3.service.js';

async function processJob(index, vessel, certType, surveyorProfile, users) {
    const { toUser, gmUser, tmUser, adminUser, surveyorUserId } = users;
    const { Op } = db.Sequelize;

    console.log(`\n--- Processing Job #${index + 1} ---`);
    
    // 2. Create Job
    console.log(`[Job #${index + 1}] Step 1: Creating Job...`);
    const jobData = {
        vessel_id: vessel.id,
        certificate_type_id: certType.id,
        target_port: ['Mumbai', 'Singapore', 'Dubai', 'Rotterdam'][Math.floor(Math.random() * 4)],
        target_date: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reason: `Bulk Flow Test Job ${index + 1}`,
        uploaded_documents: []
    };

    const reqDocs = await db.CertificateRequiredDocument.findAll({ where: { certificate_type_id: certType.id, is_mandatory: true } });
    if (reqDocs.length > 0) {
        jobData.uploaded_documents = reqDocs.map(rd => ({
            required_document_id: rd.id,
            file_url: `https://dummy-bucket.s3.amazonaws.com/test-doc-${index + 1}.pdf`
        }));
    }

    const job = await jobService.createJob(jobData, adminUser.id);
    console.log(`[Job #${index + 1}] Created! ID: ${job.id}, Status: ${job.job_status}`);

    // 3. Verify Documents (TO) - FIXED PARAMETER ORDER
    console.log(`[Job #${index + 1}] Step 2: Verifying Documents (TO)...`);
    await jobService.verifyJobDocuments(job.id, { approved: true }, toUser);
    let updatedJob = await db.JobRequest.findByPk(job.id);
    console.log(`[Job #${index + 1}] Status: ${updatedJob.job_status}`);

    // 4. Approve Job (GM)
    console.log(`[Job #${index + 1}] Step 3: Approving Job (GM)...`);
    await jobService.approveRequest(job.id, 'Bulk approval', gmUser);
    updatedJob = await db.JobRequest.findByPk(job.id);
    console.log(`[Job #${index + 1}] Status: ${updatedJob.job_status}`);

    // 5. Assign Surveyor (GM)
    console.log(`[Job #${index + 1}] Step 4: Assigning Surveyor (GM)...`);
    await jobService.assignSurveyor(job.id, surveyorUserId, gmUser);
    updatedJob = await db.JobRequest.findByPk(job.id);
    console.log(`[Job #${index + 1}] Status: ${updatedJob.job_status}, Surveyor: ${surveyorProfile.User.name}`);

    // 6. Authorize Survey (TM)
    console.log(`[Job #${index + 1}] Step 5: Authorizing Survey (TM)...`);
    await jobService.authorizeSurvey(job.id, 'Bulk authorization', tmUser);
    updatedJob = await db.JobRequest.findByPk(job.id);
    console.log(`[Job #${index + 1}] Status: ${updatedJob.job_status}`);

    // 7. Start Survey (Surveyor)
    console.log(`[Job #${index + 1}] Step 6: Starting Survey...`);
    await surveyService.startSurvey({ job_id: job.id, latitude: 18.92, longitude: 72.83 }, surveyorUserId);
    const survey = await db.Survey.findOne({ where: { job_id: job.id } });
    console.log(`[Job #${index + 1}] Survey Status: ${survey.survey_status}`);

    // 8. Submit Checklist (Surveyor)
    console.log(`[Job #${index + 1}] Step 7: Submitting Checklist...`);
    const checklistItems = [
        { question_code: 'V01', question_text: 'Hull Condition', answer: 'SATISFACTORY', remarks: 'Bulk test' }
    ];
    await checklistService.submitChecklist(job.id, checklistItems, surveyorUserId);
    await survey.reload();
    console.log(`[Job #${index + 1}] Survey Status: ${survey.survey_status}`);

    // 9. Upload Proof & Signed Checklist
    console.log(`[Job #${index + 1}] Step 8: Uploading Evidence & Signed Checklist...`);
    const proofKey = `surveys/proof/${job.id}/evidence.jpg`;
    await surveyService.uploadProof(job.id, null, { fileKey: proofKey }, surveyorUserId);
    
    const signedKey = `surveys/signed/${job.id}/checklist.pdf`;
    await surveyService.updateSignedChecklist(job.id, [signedKey], surveyorUserId);
    await survey.reload();
    console.log(`[Job #${index + 1}] Survey Status: ${survey.survey_status}`);

    // 10. Submit Survey Report (Surveyor)
    console.log(`[Job #${index + 1}] Step 9: Submitting Final Report...`);
    await surveyService.submitSurveyReport({
        job_id: job.id,
        submit_latitude: 18.92,
        submit_longitude: 72.83,
        survey_statement: 'Bulk test survey statement.',
        photoKey: `surveys/photo/${job.id}/attendance.jpg`
    }, {}, surveyorUserId);
    await survey.reload();
    console.log(`[Job #${index + 1}] Survey Status: ${survey.survey_status}`);

    // 11. Review Job (TO)
    console.log(`[Job #${index + 1}] Step 10: Reviewing Job (TO)...`);
    await jobService.reviewJob(job.id, 'Bulk review passed', toUser);
    updatedJob = await db.JobRequest.findByPk(job.id);
    console.log(`[Job #${index + 1}] Status: ${updatedJob.job_status}`);

    // 12. Issue Survey Statement (TM)
    console.log(`[Job #${index + 1}] Step 11: Issuing Statement (TM)...`);
    await surveyService.issueSurveyStatement(job.id, null, {}, tmUser);
    console.log(`[Job #${index + 1}] Statement Issued.`);

    // 13. Finalize Survey & Job (TM)
    console.log(`[Job #${index + 1}] Step 12: Finalizing Job (TM)...`);
    await surveyService.finalizeSurvey(job.id, tmUser);
    updatedJob = await db.JobRequest.findByPk(job.id);
    console.log(`[Job #${index + 1}] Status: ${updatedJob.job_status}`);

    // 14. Payment
    console.log(`[Job #${index + 1}] Step 13: Processing Payment (Admin)...`);
    const payment = await paymentService.createInvoice({ job_id: job.id, amount: 1000 + (index * 100), currency: 'USD' }, adminUser.id);
    await paymentService.markPaid(payment.id, adminUser.id, null, { remarks: 'Bulk payment' });
    console.log(`[Job #${index + 1}] Payment Status: PAID`);

    // 15. Certificate
    console.log(`[Job #${index + 1}] Step 14: Generating Certificate (Admin)...`);
    const authority = await db.CertificateAuthority.findOne({ where: { status: 'ACTIVE' } });
    const certDraft = await certificateService.generateCertificate({
        job_id: job.id,
        validity_years: 1,
        certificate_authority_id: authority.id,
        certificate_term: 'FULL_TERM'
    }, adminUser);
    await certificateService.issueCertificate(certDraft.id, adminUser);
    console.log(`[Job #${index + 1}] Certificate Issued: ${certDraft.certificate_number}`);
    
    return job.id;
}

async function runBulkTest(count = 3) {
    console.log(`--- Starting Bulk Flow Test (Count: ${count}) ---`);
    try {
        const { Op } = db.Sequelize;

        // 1. Get Seed Data
        const vessels = await db.Vessel.findAll({ where: { class_status: 'ACTIVE' }, limit: count });
        const certType = await db.CertificateType.findOne({ where: { status: 'ACTIVE', requires_survey: true } });
        const surveyorProfile = await db.SurveyorProfile.findOne({
            where: { status: 'ACTIVE', is_available: true },
            include: [{
                model: db.User,
                required: true,
                where: { role: 'SURVEYOR', status: 'ACTIVE'}
            }]
        });

        const toUser = await db.User.findOne({ where: { role: 'TO', status: 'ACTIVE' } });
        const gmUser = await db.User.findOne({ where: { role: 'GM', status: 'ACTIVE' } });
        const tmUser = await db.User.findOne({ where: { role: 'TM', status: 'ACTIVE' } });
        const adminUser = await db.User.findOne({ where: { role: 'ADMIN', status: 'ACTIVE' } });

        if (!vessels.length || !certType || !surveyorProfile || !toUser || !gmUser || !tmUser || !adminUser) {
            throw new Error('Missing seed data');
        }

        const users = {
            toUser, gmUser, tmUser, adminUser,
            surveyorUserId: surveyorProfile.user_id
        };

        // Ensure surveyor is authorized for the first vessel type (simplification)
        await surveyorProfile.update({
            authorized_ship_types: JSON.stringify(vessels.map(v => v.ship_type)),
            authorized_certificates: JSON.stringify([certType.name])
        });

        for (let i = 0; i < Math.min(count, vessels.length); i++) {
            await processJob(i, vessels[i], certType, surveyorProfile, users);
        }

        console.log(`\n--- Bulk Flow Test Completed Successfully! (${count} jobs processed) ---`);

    } catch (error) {
        console.error('\n!!! Bulk Test Failed !!!');
        console.error(error);
    } finally {
        process.exit();
    }
}

const jobCount = parseInt(process.argv[2]) || 3;
runBulkTest(jobCount);
