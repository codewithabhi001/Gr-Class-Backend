import db from '../../../src/models/index.js';

async function countFeedback() {
    try {
        const count = await db.CustomerFeedback.count();
        console.log('Total Feedback Count:', count);

        const feedbacks = await db.CustomerFeedback.findAll({
            attributes: ['id', 'job_id', 'client_id'],
            limit: 10
        });
        console.log('Feedbacks in DB:', JSON.stringify(feedbacks, null, 2))
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

countFeedback();
