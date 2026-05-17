import 'dotenv/config';
import db from './src/models/index.js';

async function run() {
    try {
        console.log('Authenticating db...');
        await db.sequelize.authenticate();
        console.log('Syncing VesselDocument and Survey...');
        // Sync models that might have missing columns
        try { await db.VesselDocument.sync({ alter: true }); } catch (e) { console.warn('Skipping VesselDocument sync'); }
        try { await db.Survey.sync({ alter: true }); } catch (e) { console.warn('Skipping Survey sync'); }
        try { await db.SupportTicket.sync({ alter: true }); } catch (e) { console.warn('Skipping SupportTicket sync'); }
        await db.FinancialLedger.sync({ alter: true });
        console.log('Done!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
