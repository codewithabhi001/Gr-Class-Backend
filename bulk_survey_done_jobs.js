
import db from './src/models/index.js';
import * as jobService from './src/modules/jobs/job.service.js';
import * as surveyService from './src/modules/surveys/survey.service.js';
import * as checklistService from './src/modules/checklists/checklist.service.js';
import * as s3Service from './src/services/s3.service.js';

async function processJobToSurveyDone(index, vessel, certType, surveyorProfile, users) {
    const { toUser, gmUser, tmUser, adminUser, surveyorUserId } = users;

    console.log(`\n--- Processing Job #${index + 1} to SURVEY_DONE ---`);
    
    // 1. Create Job
    console.log(`[Job #${index + 1}] Step 1: Creating Job...`);
    const jobData = {
        vessel_id: vessel.id,
        certificate_type_id: certType.id,
        target_port: ['Mumbai', 'Singapore', 'Dubai', 'Rotterdam', 'Busan'][index % 5],
        target_date: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reason: `Survey Done Bulk Job ${index + 1}`,
        uploaded_documents: []
    };

    const reqDocs = await db.CertificateRequiredDocument.findAll({ where: { certificate_type_id: certType.id, is_mandatory: true } });
    if (reqDocs.length > 0) {
        jobData.uploaded_documents = reqDocs.map(rd => ({
            required_document_id: rd.id,
            file_url: `https://dummy-bucket.s3.amazonaws.com/bulk-survey-done/doc-${index + 1}.pdf`
        }));
    }

    const job = await jobService.createJob(jobData, adminUser.id);
    console.log(`[Job #${index + 1}] Created! ID: ${job.id}`);

    // 2. Verify Documents (TO)
    console.log(`[Job #${index + 1}] Step 2: Verifying Documents (TO)...`);
    await jobService.verifyJobDocuments(job.id, { approved: true }, toUser);

    // 3. Approve Job (GM)
    console.log(`[Job #${index + 1}] Step 3: Approving Job (GM)...`);
    await jobService.approveRequest(job.id, 'Proper flow approval', gmUser);

    // 4. Assign Surveyor (GM)
    console.log(`[Job #${index + 1}] Step 4: Assigning Surveyor (GM)...`);
    await jobService.assignSurveyor(job.id, surveyorUserId, gmUser);

    // 5. Authorize Survey (TM)
    console.log(`[Job #${index + 1}] Step 5: Authorizing Survey (TM)...`);
    await jobService.authorizeSurvey(job.id, 'Proper flow authorization', tmUser);

    // 6. Start Survey (Surveyor)
    console.log(`[Job #${index + 1}] Step 6: Starting Survey...`);
    await surveyService.startSurvey({ job_id: job.id, latitude: 18.92 + (index * 0.01), longitude: 72.83 + (index * 0.01) }, surveyorUserId);

    // 7. Submit Checklist (Surveyor)
    console.log(`[Job #${index + 1}] Step 7: Submitting Checklist...`);
    const checklistItems = [
        { question_code: 'V01', question_text: 'Hull Condition', answer: 'SATISFACTORY', remarks: 'Proper flow' }
    ];
    await checklistService.submitChecklist(job.id, checklistItems, surveyorUserId);

    // 8. Upload Proof & Signed Checklist
    console.log(`[Job #${index + 1}] Step 8: Uploading Evidence & Signed Checklist...`);
    const proofKey = `surveys/bulk-done/proof/${job.id}/evidence.jpg`;
    await surveyService.uploadProof(job.id, null, { fileKey: proofKey }, surveyorUserId);
    
    const signedKey = `surveys/bulk-done/signed/${job.id}/checklist.pdf`;
    await surveyService.updateSignedChecklist(job.id, [signedKey], surveyorUserId);

    // 9. Submit Survey Report (Surveyor) -> Reaches SURVEY_DONE
    console.log(`[Job #${index + 1}] Step 9: Submitting Final Report (to reach SURVEY_DONE)...`);
    await surveyService.submitSurveyReport({
        job_id: job.id,
        submit_latitude: 18.92 + (index * 0.01),
        submit_longitude: 72.83 + (index * 0.01),
        survey_statement: 'Vessel inspected and found satisfactory.',
        photoKey: `surveys/bulk-done/photo/${job.id}/attendance.jpg`
    }, {}, surveyorUserId);
    
    const updatedJob = await db.JobRequest.findByPk(job.id);
    console.log(`[Job #${index + 1}] Completed Step 9. Final Status: ${updatedJob.job_status}`);
    
    return job.id;
}

async function runBulkSurveyDone(count = 5) {
    console.log(`--- Starting Bulk Jobs to SURVEY_DONE (Count: ${count}) ---`);
    try {
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
            throw new Error('Missing seed data for bulk flow');
        }

        const users = {
            toUser, gmUser, tmUser, adminUser,
            surveyorUserId: surveyorProfile.user_id
        };

        // Ensure surveyor is authorized for the vessels
        await surveyorProfile.update({
            authorized_ship_types: JSON.stringify([...new Set(vessels.map(v => v.ship_type))]),
            authorized_certificates: JSON.stringify([certType.name])
        });

        for (let i = 0; i < Math.min(count, vessels.length); i++) {
            await processJobToSurveyDone(i, vessels[i], certType, surveyorProfile, users);
        }

        console.log(`\n--- Bulk Survey Done Jobs Created Successfully! ---`);

    } catch (error) {
        console.error('\n!!! Bulk Survey Done Failed !!!');
        console.error(error);
    } finally {
        process.exit();
    }
}

runBulkSurveyDone(5);
