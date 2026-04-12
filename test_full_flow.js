
import db from './src/models/index.js';
import * as jobService from './src/modules/jobs/job.service.js';
import * as surveyService from './src/modules/surveys/survey.service.js';
import * as checklistService from './src/modules/checklists/checklist.service.js';
import * as paymentService from './src/modules/payments/payment.service.js';
import * as certificateService from './src/modules/certificates/certificate.service.js';
import * as lifecycleService from './src/services/lifecycle.service.js';

async function runTest() {
    console.log('--- Starting Full Flow Test ---');
    try {
        const { Op } = db.Sequelize;
        // 1. Get Seed Data
        const vessel = await db.Vessel.findOne({ where: { class_status: 'ACTIVE' } });
        const certType = await db.CertificateType.findOne({ where: { status: 'ACTIVE', requires_survey: true } });
        const surveyorProfile = await db.SurveyorProfile.findOne({
            where: { status: 'ACTIVE', is_available: true },
            include: [{
                model: db.User,
                required: true,
                attributes: ['id', 'name'],
                where: { role: 'SURVEYOR', status: 'ACTIVE' ,email: 'abhivishwkarmaa52@gmail.com'}
            }]
        });
        console.log(surveyorProfile);
        const surveyorUserId = surveyorProfile?.user_id;
        const toUser = await db.User.findOne({ where: { role: 'TO', status: 'ACTIVE' } });
        const gmUser = await db.User.findOne({ where: { role: 'GM', status: 'ACTIVE' } });
        const tmUser = await db.User.findOne({ where: { role: 'TM', status: 'ACTIVE' } });
        const adminUser = await db.User.findOne({ where: { role: 'ADMIN', status: 'ACTIVE' } });
        const authorityWithLogo = await db.CertificateAuthority.findOne({
            where: {
                status: 'ACTIVE',
                [Op.and]: [
                    { logo_url: { [Op.ne]: null } },
                    { logo_url: { [Op.ne]: '' } }
                ]
            }
        });
        const flagWithLogo = await db.FlagAdministration.findOne({
            where: {
                status: 'ACTIVE',
                [Op.and]: [
                    { logo_url: { [Op.ne]: null } },
                    { logo_url: { [Op.ne]: '' } }
                ]
            }
        });

        if (!vessel || !certType || !surveyorProfile || !surveyorUserId || !toUser || !gmUser || !tmUser || !adminUser) {
            throw new Error('Missing seed data (Vessel, CertType, available Surveyor, or Users)');
        }
        if (!authorityWithLogo) {
            throw new Error('Missing seed data (CertificateAuthority with logo_url)');
        }

        console.log(`Using Vessel: ${vessel.vessel_name}, CertType: ${certType.name}, Surveyor: ${surveyorProfile.User.name}`);

        // 2. Create Job
        console.log('\n[Step 1] Creating Job...');
        const jobData = {
            vessel_id: vessel.id,
            certificate_type_id: certType.id,
            target_port: 'Mumbai',
            target_date: '2026-12-31',
            reason: 'Annual Survey',
            uploaded_documents: [] // Mock: usually requires docs if certType says so
        };
        // Mock mandatory docs if needed
        const reqDocs = await db.CertificateRequiredDocument.findAll({ where: { certificate_type_id: certType.id, is_mandatory: true } });
        if (reqDocs.length > 0) {
            jobData.uploaded_documents = reqDocs.map(rd => ({
                required_document_id: rd.id,
                file_url: 'https://dummy-bucket.s3.amazonaws.com/test-doc.pdf'
            }));
        }

        const job = await jobService.createJob(jobData, adminUser.id);
        console.log(`Job Created! ID: ${job.id}, Status: ${job.job_status}`);

        // 3. Verify Documents (TO)
        console.log('\n[Step 2] Verifying Documents (TO)...');
        await jobService.verifyJobDocuments(job.id, toUser);
        let updatedJob = await db.JobRequest.findByPk(job.id);
        console.log(`Job Status: ${updatedJob.job_status}`);

        // 4. Approve Job (GM)
        console.log('\n[Step 3] Approving Job (GM)...');
        await jobService.approveRequest(job.id, 'Approved for survey', gmUser);
        updatedJob = await db.JobRequest.findByPk(job.id);
        console.log(`Job Status: ${updatedJob.job_status}`);

        // 5. Assign Surveyor (GM)
        console.log('\n[Step 4] Assigning Surveyor (GM)...');
        // Ensure profile authorizations match this vessel/cert; assignSurveyor expects User.id, not SurveyorProfile.id
        await surveyorProfile.update({
            status: 'ACTIVE',
            is_available: true,
            authorized_ship_types: JSON.stringify([vessel.ship_type]),
            authorized_certificates: JSON.stringify([certType.name])
        });
        await jobService.assignSurveyor(job.id, surveyorUserId, gmUser);
        updatedJob = await db.JobRequest.findByPk(job.id);
        console.log(`Job Status: ${updatedJob.job_status}, Surveyor: ${surveyorProfile.User.name}`);

        // 6. Authorize Survey (TM)
        console.log('\n[Step 5] Authorizing Survey (TM)...');
        await jobService.authorizeSurvey(job.id, 'Go ahead', tmUser);
        updatedJob = await db.JobRequest.findByPk(job.id);
        console.log(`Job Status: ${updatedJob.job_status}`);

        // 7. Start Survey (Surveyor)
        console.log('\n[Step 6] Starting Survey (Surveyor Check-in)...');
        await surveyService.startSurvey({ job_id: job.id, latitude: 18.92, longitude: 72.83 }, surveyorUserId);
        const survey = await db.Survey.findOne({ where: { job_id: job.id } });
        updatedJob = await db.JobRequest.findByPk(job.id);
        console.log(`Job Status: ${updatedJob.job_status}, Survey Status: ${survey.survey_status}`);

        // 8. Submit Checklist (Surveyor)
        console.log('\n[Step 7] Submitting Checklist...');
        const checklistItems = [
            { question_code: 'V01', question_text: 'Hull Condition', answer: 'SATISFACTORY', remarks: 'All good' }
        ];
        await checklistService.submitChecklist(job.id, checklistItems, surveyorUserId);
        await survey.reload();
        console.log(`Survey Status: ${survey.survey_status}`);

        // 9. Upload Proof (Surveyor)
        console.log('\n[Step 8] Uploading Evidence Proof...');
        await surveyService.uploadProof(job.id, null, { fileKey: 'proofs/test-evidence.jpg' }, surveyorUserId);
        await survey.reload();
        console.log(`Survey Status: ${survey.survey_status}`);

        // 10. Submit Survey Report (Surveyor Check-out)
        console.log('\n[Step 9] Submitting Final Survey Report...');
        await surveyService.submitSurveyReport({
            job_id: job.id,
            submit_latitude: 18.92,
            submit_longitude: 72.83,
            survey_statement: 'Vessel is in good condition.',
            photoKey: 'photos/attendance.jpg'
        }, {}, surveyorUserId);
        await survey.reload();
        updatedJob = await db.JobRequest.findByPk(job.id);
        console.log(`Job Status: ${updatedJob.job_status}, Survey Status: ${survey.survey_status}`);

        // 11. Review Job (TO)
        console.log('\n[Step 10] Reviewing Survey Report (TO)...');
        await jobService.reviewJob(job.id, 'Review passed', toUser);
        updatedJob = await db.JobRequest.findByPk(job.id);
        console.log(`Job Status: ${updatedJob.job_status}`);

        // 12. Issue Survey Statement (TM)
        console.log('\n[Step 11] Issuing Survey Statement PDF (TM)...');
        await surveyService.issueSurveyStatement(job.id, null, { fileKey: 'statements/signed-report.pdf' }, tmUser);
        await survey.reload();
        console.log(`Survey Statement Status: ${survey.survey_statement_status}`);

        // 13. Finalize Survey (TM)
        console.log('\n[Step 12] Finalizing Survey & Job (TM)...');
        await surveyService.finalizeSurvey(job.id, tmUser);
        updatedJob = await db.JobRequest.findByPk(job.id);
        await survey.reload();
        console.log(`Job Status: ${updatedJob.job_status}, Survey Status: ${survey.survey_status}`);

        // 14. Create Invoice & Mark Paid (Admin)
        console.log('\n[Step 13] Payment Processing (Parallel Track)...');
        const payment = await paymentService.createInvoice({ job_id: job.id, amount: 1500, currency: 'USD' }, adminUser.id);
        console.log(`Invoice Created: ${payment.invoice_number}, Status: ${payment.payment_status}`);
        
        await paymentService.markPaid(payment.id, adminUser.id, null, { remarks: 'Wire transfer confirmed' });
        const updatedPayment = await db.Payment.findByPk(payment.id);
        console.log(`Payment Status: ${updatedPayment.payment_status}`);
        
        updatedJob = await db.JobRequest.findByPk(job.id);
        console.log(`Job Status (should stay FINALIZED): ${updatedJob.job_status}`);

        // 15. Generate Certificate (Admin)
        console.log('\n[Step 14] Generating Certificate (Admin)...');
        const certDraft = await certificateService.generateCertificate({
            job_id: job.id,
            validity_years: 1,
            certificate_authority_id: authorityWithLogo.id,
            flag_administration_id: flagWithLogo?.id || null,
            certificate_term: 'FULL_TERM'
        }, adminUser);
        updatedJob = await db.JobRequest.findByPk(job.id);
        console.log(`Job Status: ${updatedJob.job_status}, Certificate draft: ${certDraft.certificate_number}`);

        // 16. Attach Certificate Authority + Optional Flag Logo (Admin)
        console.log('\n[Step 15] Attaching Authority + Optional Flag Logos (Admin)...');
        await certificateService.updateDraft(certDraft.id, {
            certificate_authority_id: authorityWithLogo.id,
            flag_administration_id: flagWithLogo?.id || null,
            certificate_term: 'FULL_TERM',
            remarks: 'Auto-issued in full flow test'
        }, adminUser);
        console.log(`Authority set: ${authorityWithLogo.name}, Flag logo: ${flagWithLogo ? flagWithLogo.flag_state_name : 'None'}`);

        // 17. Issue Certificate (Admin)
        console.log('\n[Step 16] Issuing Certificate (Admin)...');
        const certIssued = await certificateService.issueCertificate(certDraft.id, adminUser);
        console.log(`Certificate Issued: ${certIssued.certificate_number}, Status: ${certIssued.status}`);

        console.log('\n--- Full Flow Test Completed Successfully! ---');

    } catch (error) {
        console.error('\n!!! Test Failed !!!');
        console.error(error);
        if (error.statusCode) console.error(`Status: ${error.statusCode}, Message: ${error.message}`);
    } finally {
        process.exit();
    }
}

runTest();
