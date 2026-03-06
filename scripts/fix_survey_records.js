import 'dotenv/config';
import db from '../src/models/index.js';

async function fixMissingSurveys() {
    try {
        const surveyorId = '019c79a4-4930-71fd-aa73-887301791935';
        console.log(`--- Creating missing Survey records for Surveyor: ${surveyorId} ---`);

        // Find all jobs assigned to this surveyor that require a survey
        const jobs = await db.JobRequest.findAll({
            where: {
                assigned_surveyor_id: surveyorId,
                is_survey_required: true
            }
        });

        console.log(`Found ${jobs.length} jobs assigned to this surveyor.`);

        let createdCount = 0;
        for (const job of jobs) {
            const [survey, created] = await db.Survey.findOrCreate({
                where: { job_id: job.id },
                defaults: {
                    surveyor_id: surveyorId,
                    survey_status: 'NOT_STARTED',
                    port_name: job.target_port || 'TBD'
                }
            });

            if (created) {
                createdCount++;
                console.log(`Created survey for Job: ${job.id}`);
            }
        }

        console.log(`\n--- Completed. Created ${createdCount} missing survey records. ---`);
        process.exit(0);
    } catch (error) {
        console.error('Fix Failed:', error);
        process.exit(1);
    }
}

fixMissingSurveys();
