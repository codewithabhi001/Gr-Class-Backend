
import db from './src/models/index.js';

async function checkStatus() {
    const jobs = await db.JobRequest.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [
            { model: db.Vessel, attributes: ['vessel_name'] },
            { model: db.Payment, attributes: ['payment_status'] }
        ]
    });

    console.log('--- Recent Jobs Status ---');
    jobs.forEach(job => {
        console.log(`Job ID: ${job.id}`);
        console.log(`Vessel: ${job.Vessel?.vessel_name}`);
        console.log(`Status: ${job.job_status}`);
        console.log(`Payment Status: ${job.Payments?.[0]?.payment_status || 'N/A'}`);
        console.log('---------------------------');
    });

    process.exit();
}

checkStatus();
