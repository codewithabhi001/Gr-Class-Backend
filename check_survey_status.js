
import db from './src/models/index.js';

async function checkSurvey() {
    const jobId = '019dfc4d-e620-7129-829c-ae0132d154c5'; // Vessel Beta
    const survey = await db.Survey.findOne({ where: { job_id: jobId } });
    console.log(`Survey Status: ${survey?.survey_status}`);
    process.exit();
}

checkSurvey();
