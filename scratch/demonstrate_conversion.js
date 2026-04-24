import db from '../src/models/index.js';

const demonstrateConversion = async () => {
    try {
        console.log('--- Starting Activity to Job Conversion Demo ---');

        // 1. Fetch Pacific User and Vessel
        const user = await db.User.findOne({ where: { email: 'ops@pacific.com' } });
        const vessel = await db.Vessel.findOne({ where: { client_id: user.client_id } });

        // 2. Create an Activity Request
        const activityReq = await db.ActivityRequest.create({
            request_number: `DEMO-REQ-${Date.now()}`,
            requested_by: user.id,
            vessel_id: vessel.id,
            activity_type: 'INSPECTION',
            requested_service: 'Special Hull Survey',
            description: 'Demo request for conversion flow.',
            status: 'PENDING'
        });
        console.log(`Step 1: Activity Request created: ${activityReq.request_number} (ID: ${activityReq.id})`);

        // 3. Create a Job Request (simulating "Conversion")
        // We'll fetch a certificate type first
        const certType = await db.CertificateType.findOne();
        
        const newJob = await db.JobRequest.create({
            vessel_id: vessel.id,
            requested_by_user_id: user.id,
            certificate_type_id: certType.id,
            job_status: 'OPEN',
            reason: `Generated from ${activityReq.request_number}`,
            target_port: 'Singapore',
            target_date: new Date()
        });
        console.log(`Step 2: Job Request created: (ID: ${newJob.id})`);

        // 4. Link Activity Request to the Job
        await activityReq.update({
            status: 'CONVERTED_TO_JOB',
            linked_job_id: newJob.id
        });
        console.log(`Step 3: Activity Request updated to CONVERTED_TO_JOB and linked to Job ID: ${newJob.id}`);

        console.log('\n--- Final Verification ---');
        const finalState = await db.ActivityRequest.findByPk(activityReq.id);
        console.log(`Final Status: ${finalState.status}`);
        console.log(`Linked Job ID: ${finalState.linked_job_id}`);
        console.log('--- Demo Successful ---');

        process.exit(0);
    } catch (error) {
        console.error('Demo error:', error);
        process.exit(1);
    }
};

demonstrateConversion();
