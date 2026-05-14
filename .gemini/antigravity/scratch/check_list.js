import db from '../../../src/models/index.js';

async function checkList() {
    try {
        const feedbacks = await db.CustomerFeedback.findAll({
            include: [
                {
                    model: db.JobRequest,
                    attributes: ['job_request_number']
                },
                {
                    model: db.User,
                    as: 'Client',
                    attributes: ['id', 'name', 'email'],
                    include: [
                        {
                            model: db.Client,
                            attributes: ['company_name']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        console.log(JSON.stringify(feedbacks, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkList();
