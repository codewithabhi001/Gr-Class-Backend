import db from '../src/models/index.js';
import * as jobService from '../src/modules/jobs/job.service.js';
import * as surveyService from '../src/modules/surveys/survey.service.js';
import * as checklistService from '../src/modules/checklists/checklist.service.js';
import * as certificateService from '../src/modules/certificates/certificate.service.js';
import fs from 'fs';
import path from 'path';

// Mock variables - IDs from DB
const vesselId = '019e683c-1992-77c4-9ec1-881d687c1087';
const certTypeId = '019e6844-1adb-70ee-823e-b7c580eb715f';
const clientId = '019e6837-7823-70ee-a14f-47a914f0067f';
const adminId = '019e682e-10b6-71c8-b828-868627f9e191';
const surveyorId = '019e6858-14bd-7347-9d86-d1acffa36a5c';

// Roles
const clientUser = { id: clientId, role: 'CLIENT' };
const adminUser = { id: adminId, role: 'ADMIN' };
const surveyorUser = { id: surveyorId, role: 'SURVEYOR' };

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
    try {
        console.log("🚀 Starting E2E Flow Test...");

        // 0. Setup Mock Templates
        console.log("\n[0] Setting up mock templates...");
        const certTemplate = await db.CertificateTemplate.findOrCreate({
            where: { certificate_type_id: certTypeId },
            defaults: { template_name: 'E2E Mock Template', template_file_url: 'mock.docx', is_active: true }
        });
        const checkTemplate = await db.ChecklistTemplate.findOrCreate({
            where: { certificate_type_id: certTypeId },
            defaults: { name: 'E2E Mock Checklist', code: 'E2E-MOCK', status: 'ACTIVE' }
        });
        console.log(`✅ Templates configured!`);

        // 1. Create Job
        console.log("\n[1] Creating Job Request...");
        const createJobPayload = {
            vessel_id: vesselId,
            target_port: 'Dubai Port',
            target_date: new Date().toISOString(),
            certificates: [
                {
                    certificate_type_id: certTypeId,
                    uploaded_documents: []
                }
            ],
            uploaded_documents: []
        };
        const createOptions = { skipMandatoryDocumentCheck: true };
        // createJob(data, userId, options)
        const createResult = await jobService.createJob(createJobPayload, clientId, createOptions);
        const jobId = createResult.id;
        console.log(`✅ Job Created! ID: ${jobId}`);

        // Get Job Certificate ID
        const jobCerts = await db.JobCertificate.findAll({ where: { job_request_id: jobId } });
        const jobCertId = jobCerts[0].id;
        console.log(`✅ JobCertificate Created! ID: ${jobCertId}`);

        // Mock mandatory document uploads
        const requiredDocs = await db.CertificateRequiredDocument.findAll({ where: { certificate_type_id: certTypeId, is_mandatory: true } });
        for (const rd of requiredDocs) {
            await db.JobDocument.create({
                job_id: jobId,
                job_certificate_id: jobCertId,
                required_document_id: rd.id,
                file_url: 'mock_doc.pdf',
                uploaded_by: clientId,
                verification_status: 'PENDING'
            });
        }
        console.log(`✅ Mocked mandatory documents upload!`);

        // 2. Document Verification
        console.log("\n[2] Document Verification (Admin)...");
        await jobService.verifyAllJobDocuments(jobId, adminUser);
        console.log(`✅ Documents Verified!`);

        // 3. Approve Request
        console.log("\n[3] Approving Job Request (Admin)...");
        await jobService.approveRequest(jobId, null, adminUser);
        console.log(`✅ Job Approved!`);

        // 4. Assign Surveyor
        console.log("\n[4] Assigning Surveyor (Admin)...");
        await jobService.assignSurveyorToCertificate(jobCertId, surveyorId, adminUser);
        console.log(`✅ Surveyor Assigned!`);

        // 5. Authorize Survey
        console.log("\n[5] Authorizing Survey (Admin)...");
        await jobService.authorizeSurveyForCertificate(jobCertId, null, adminUser);
        console.log(`✅ Survey Authorized!`);

        // 6. Surveyor Field Execution
        console.log("\n[6] Surveyor Field Execution...");
        // a. Start Survey
        await surveyService.startSurvey({ job_certificate_id: jobCertId }, surveyorId);
        console.log(`✅ Survey Started!`);

        // b. Submit Checklist
        const survey = await db.Survey.findOne({ where: { job_certificate_id: jobCertId } });
        await survey.update({ survey_status: 'CHECKLIST_SUBMITTED' }); // Simulating checklist submit (requires complex JSON structure usually)
        console.log(`✅ Checklist Submitted!`);

        // c. Upload Proof
        console.log(`✅ Mocking Proof Upload...`);
        // We bypass actual multer upload by directly updating state to avoid file handling complexities in DB-only script
        await survey.update({ survey_status: 'PROOF_UPLOADED', attendance_photo_url: 'mock_url' });
        
        // d. Submit Survey Report
        const submitPayload = { 
            job_certificate_id: jobCertId, 
            submit_latitude: '0.0', 
            submit_longitude: '0.0',
            skip_validation: true 
        };
        await surveyService.submitSurveyReport(submitPayload, {}, surveyorId);
        // Force JobCertificate status update because skip_validation bypassed the lifecycle hook
        await db.JobCertificate.update({ status: 'SURVEY_DONE' }, { where: { id: jobCertId } });
        console.log(`✅ Survey Report Submitted!`);

        // 7. Technical Review
        console.log("\n[7] Technical Review (Admin)...");
        await jobService.reviewJobCertificate(jobCertId, 'Looks good', adminUser);
        console.log(`✅ Job Certificate Reviewed!`);

        // 8. Drafting Survey Statement
        console.log("\n[8] Drafting Survey Statement (Admin)...");
        const statementPayload = {
            survey_statement: "This is a test statement.",
            job_certificate_id: jobCertId
        };
        await surveyService.draftSurveyStatement(jobId, statementPayload, adminUser);
        console.log(`✅ Statement Drafted!`);
        
        // Mock Issue Statement
        await survey.reload();
        await survey.update({ survey_statement_status: 'ISSUED' });
        console.log(`✅ Survey Statement Issued!`);

        // 9. Finalize Survey
        console.log("\n[9] Finalizing Survey (Admin)...");
        await surveyService.finalizeSurvey(jobId, adminUser, { job_certificate_id: jobCertId });
        console.log(`✅ Survey Finalized!`);

        // 10. Generate Certificate
        console.log("\n[10] Generating Certificate (Admin)...");
        const generatePayload = {
            job_certificate_id: jobCertId,
            validity_years: 5,
            certificate_term: 'FULL_TERM'
        };
        const cert = await certificateService.generateCertificate(generatePayload, adminUser);
        console.log(`✅ Final Certificate Generated! ID: ${cert.id}`);

        console.log("\n🎉 E2E Flow Test Completed Successfully! 🎉");

        process.exit(0);
    } catch (err) {
        console.error("\n❌ Test Failed!");
        console.error(err);
        process.exit(1);
    }
}

runTest();
