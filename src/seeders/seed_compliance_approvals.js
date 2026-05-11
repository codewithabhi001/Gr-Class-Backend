import db from '../models/index.js';
import { v7 as uuidv7 } from 'uuid';

const seedComplianceApprovals = async () => {
    try {
        console.log('Starting Compliance and Approval data seeding...');

        const adminUser = await db.User.findOne({ where: { role: 'ADMIN' } });
        const gmUser = await db.User.findOne({ where: { role: 'GM' } });
        
        if (!adminUser) {
            console.error('Admin user not found. Please run initial_seed.js first.');
            process.exit(1);
        }

        // 1. Seed Approvals
        const approvalsCount = await db.Approval.count();
        if (approvalsCount === 0) {
            // Fetch some entities to link approvals to
            const job = await db.JobRequest.findOne();
            const vessel = await db.Vessel.findOne();

            await db.Approval.bulkCreate([
                {
                    entity_type: 'JOB',
                    entity_id: job ? job.id : uuidv7(),
                    role: 'GM',
                    status: 'PENDING',
                    remarks: 'Pending GM review for technical specifications.'
                },
                {
                    entity_type: 'VESSEL',
                    entity_id: vessel ? vessel.id : uuidv7(),
                    role: 'ADMIN',
                    status: 'APPROVED',
                    approved_by: adminUser.id,
                    approved_at: new Date(),
                    remarks: 'Vessel documentation verified and approved.'
                },
                {
                    entity_type: 'CERTIFICATE',
                    entity_id: uuidv7(),
                    role: 'TM',
                    status: 'REJECTED',
                    approved_by: adminUser.id,
                    approved_at: new Date(),
                    remarks: 'Incomplete survey findings. Please re-submit.'
                }
            ]);
            console.log('Approvals seeded');
        }

        // 2. Seed a dedicated user for Compliance Testing
        const testUserEmail = 'compliance.test@grclass.com';
        let testUser = await db.User.findOne({ where: { email: testUserEmail } });
        if (!testUser) {
            testUser = await db.User.create({
                name: 'Compliance Test User',
                email: testUserEmail,
                password_hash: 'dummy_hash',
                role: 'CLIENT',
                status: 'ACTIVE'
            });
            console.log('Compliance Test User seeded');
        }

        console.log('Compliance and Approval data seeding completed.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedComplianceApprovals();
