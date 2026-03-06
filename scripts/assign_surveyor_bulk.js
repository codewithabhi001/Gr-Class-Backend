import 'dotenv/config';
import db from '../src/models/index.js';
import * as lifecycleService from '../src/services/lifecycle.service.js';

async function assignAndAuthorize() {
    try {
        const surveyorId = '019c79a4-4930-71fd-aa73-887301791935';
        console.log(`--- Assigning and Authorizing Jobs for Surveyor: ${surveyorId} ---`);

        // 1. Find the surveyor to ensure they exist
        const surveyor = await db.User.findByPk(surveyorId);
        if (!surveyor) {
            throw new Error(`Surveyor with ID ${surveyorId} not found.`);
        }

        // 2. Find an Admin to act as the assigner
        const admin = await db.User.findOne({ where: { role: 'ADMIN' } });
        if (!admin) {
            throw new Error('Admin user not found. Needed for auditing.');
        }

        // 3. Get all jobs that are currently in 'APPROVED' status
        // We will move them to 'ASSIGNED' and then to 'SURVEY_AUTHORIZED'
        const jobs = await db.JobRequest.findAll({
            where: {
                job_status: 'APPROVED'
            }
        });

        console.log(`Found ${jobs.length} jobs in APPROVED status.`);

        for (const job of jobs) {
            console.log(`Processing Job ID: ${job.id}`);

            // A. Move to ASSIGNED
            // We manually update fields because updateJobStatus doesn't handle assignment logic internally for fields
            await job.update({
                assigned_surveyor_id: surveyor.id,
                assigned_by_user_id: admin.id
            });

            await lifecycleService.updateJobStatus(job.id, 'ASSIGNED', admin.id, 'Bulk assignment to surveyor via seed script.');

            // B. Move to SURVEY_AUTHORIZED
            await lifecycleService.updateJobStatus(job.id, 'SURVEY_AUTHORIZED', admin.id, 'Bulk authorization via seed script.');

            console.log(`   - Status: SURVEY_AUTHORIZED`);
        }

        console.log(`\n--- Completed. ${jobs.length} jobs assigned and authorized. ---`);
        process.exit(0);
    } catch (error) {
        console.error('Operation Failed:', error);
        process.exit(1);
    }
}

assignAndAuthorize();
