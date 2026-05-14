import db from '../../../src/models/index.js';
import env from '../../../src/config/env.js';

async function checkDb() {
    console.log('Environment DB Config:', JSON.stringify(env.database, null, 2));
    console.log('Sequelize Options DB:', db.sequelize.config.database);
    
    try {
        const count = await db.CustomerFeedback.count();
        console.log('Current Feedback Count:', count);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDb();
