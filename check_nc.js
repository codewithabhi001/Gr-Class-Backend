
import db from './src/models/index.js';

async function checkNC() {
    const jobId = '019dfc4d-e620-7129-829c-ae0132d154c5'; // Vessel Beta
    if (db.NonConformity) {
        const ncs = await db.NonConformity.findAll({ where: { job_id: jobId } });
        console.log(`NC Count: ${ncs.length}`);
        ncs.forEach(nc => console.log(`NC Status: ${nc.status}`));
    } else {
        console.log('NonConformity model not found');
    }
    process.exit();
}

checkNC();
