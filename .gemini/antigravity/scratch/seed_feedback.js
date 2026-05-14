import db from '../../../src/models/index.js';
import { v7 as uuidv7 } from 'uuid';

async function seedDummyFeedback() {
    try {
        console.log('Starting seeder...');
        console.log('Connected to DB:', db.sequelize.config.database);

        const client = await db.Client.create({
            company_name: 'Antigravity Shipping Ltd ' + Date.now(),
            company_code: 'ASL-' + Math.floor(Math.random() * 10000),
            address: '123 Ocean Drive, Port City',
            country: 'Panama',
            email: 'contact@antigravity-shipping.com',
            status: 'ACTIVE'
        });

        const user = await db.User.create({
            name: 'Abhinav Client',
            email: `abhinav.client.${Date.now()}@example.com`,
            password_hash: 'dummy',
            role: 'CLIENT',
            client_id: client.id,
            status: 'ACTIVE'
        });

        const flag = await db.FlagAdministration.create({
            flag_state_name: 'Panama Maritime Authority ' + Date.now(),
            country: 'Panama',
            authority_name: 'PMA',
            status: 'ACTIVE'
        });

        const certType = await db.CertificateType.create({
            name: 'Safety Construction Certificate ' + Date.now(),
            short_code: 'SCC' + Math.floor(Math.random() * 100),
            issuing_authority: 'CLASS',
            validity_years: 5,
            status: 'ACTIVE'
        });

        const vessel = await db.Vessel.create({
            vessel_name: 'Girik Star ' + Date.now(),
            imo_number: String(Math.floor(1000000 + Math.random() * 8999999)),
            client_id: client.id,
            flag_administration_id: flag.id,
            class_status: 'ACTIVE'
        });

        for (let i = 1; i <= 4; i++) {
            const job = await db.JobRequest.create({
                vessel_id: vessel.id,
                requested_by_user_id: user.id,
                certificate_type_id: certType.id,
                job_status: 'CERTIFIED',
                reason: `Periodic Survey ${i}`,
                target_date: new Date()
            });

            const feedback = await db.CustomerFeedback.create({
                job_id: job.id,
                client_id: user.id,
                rating: 5,
                timeliness: 5,
                professionalism: 5,
                documentation: 5,
                remarks: `Feedback ${i}`,
                submitted_at: new Date()
            });
            console.log(`Created Feedback ${i} with ID: ${feedback.id}`);
        }

        console.log('Seeder completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeder failed:', error);
        process.exit(1);
    }
}

seedDummyFeedback();
