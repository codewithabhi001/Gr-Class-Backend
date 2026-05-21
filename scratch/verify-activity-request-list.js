import db from '../src/models/index.js';
import * as activityRequestService from '../src/modules/activity_requests/activity_request.service.js';

async function run() {
    try {
        console.log('--- Connecting to database ---');
        await db.sequelize.authenticate();
        console.log('Database connected successfully.');

        console.log('--- Testing activityRequestService.getActivityRequests ---');
        const result = await activityRequestService.getActivityRequests({ page: 1, limit: 5 });
        console.log(`Total activity requests: ${result.total}`);
        console.log(`Returned rows count: ${result.rows?.length}`);
        
        if (result.rows?.length > 0) {
            console.log('First flattened row sample:\n', JSON.stringify(result.rows[0], null, 2));
        } else {
            console.log('No activity requests found in database.');
        }

    } catch (error) {
        console.error('Error running activity request diagnostic script:', error);
    } finally {
        await db.sequelize.close();
        process.exit(0);
    }
}

run();
