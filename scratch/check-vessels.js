import db from '../src/models/index.js';
import * as vesselService from '../src/modules/vessels/vessel.service.js';

async function run() {
    try {
        console.log('--- Connecting to database ---');
        await db.sequelize.authenticate();
        console.log('Database connected successfully.');

        console.log('--- Counting Vessels directly ---');
        const countDirect = await db.Vessel.count();
        console.log(`Total vessels in DB: ${countDirect}`);

        console.log('--- Testing vesselService.getVessels with empty query ---');
        const resultEmpty = await vesselService.getVessels({}, {}, 'ADMIN');
        console.log(`Result with empty query - total: ${resultEmpty.total}, rows length: ${resultEmpty.rows?.length}`);
        if (resultEmpty.rows?.length > 0) {
            console.log('First row:', JSON.stringify(resultEmpty.rows[0], null, 2));
        }

        console.log('--- Testing vesselService.getVessels with { page: 1, limit: 20 } ---');
        const resultPage = await vesselService.getVessels({ page: 1, limit: 20 }, {}, 'ADMIN');
        console.log(`Result with page/limit - total: ${resultPage.total}, rows length: ${resultPage.rows?.length}`);
        if (resultPage.rows?.length > 0) {
            console.log('First row:', JSON.stringify(resultPage.rows[0], null, 2));
        }

    } catch (error) {
        console.error('Error running diagnostic script:', error);
    } finally {
        await db.sequelize.close();
        process.exit(0);
    }
}

run();
