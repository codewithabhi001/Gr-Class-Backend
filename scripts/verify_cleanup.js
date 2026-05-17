import db from '../src/models/index.js';

async function verify() {
    console.log('--- Verifying Database State ---');

    try {
        const userCount = await db.User.count();
        console.log(`User count: ${userCount}`);
        
        const admin = await db.User.findOne({ where: { email: 'info@grclass.com' } });
        console.log(`Admin user info@grclass.com exists: ${!!admin}`);
        if (admin) {
            console.log(`Admin role: ${admin.role}`);
        }

        const jobCount = await db.JobRequest.count();
        console.log(`Job count: ${jobCount}`);

        const vesselCount = await db.Vessel.count();
        console.log(`Vessel count: ${vesselCount}`);

        if (userCount === 1 && admin && admin.role === 'ADMIN' && jobCount === 0 && vesselCount === 0) {
            console.log('--- Verification SUCCESSFUL ---');
        } else {
            console.log('--- Verification FAILED ---');
            console.log('Check logs for details.');
        }

    } catch (error) {
        console.error('Verification failed with error:', error);
    } finally {
        await db.sequelize.close();
    }
}

verify();
