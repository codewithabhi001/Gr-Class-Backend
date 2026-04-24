import db from '../models/index.js';
import bcrypt from 'bcrypt';
import { v7 as uuidv7 } from 'uuid';

const seedOperationalData = async () => {
    try {
        console.log('Starting operational data seeding...');

        // 0. Ensure a Flag Administration exists (needed for vessels)
        let flag = await db.FlagAdministration.findOne({ where: { flag_state_name: 'Panama' } });
        if (!flag) {
            flag = await db.FlagAdministration.create({
                flag_state_name: 'Panama',
                country: 'Panama',
                authority_name: 'Panama Maritime Authority',
                contact_email: 'pma@panama-maritime.com',
                status: 'ACTIVE'
            });
            console.log('Flag Administration seeded');
        }

        // 1. Client Seeding Logic
        const salt = await bcrypt.genSalt(10);
        const defaultPassword = await bcrypt.hash('Password@123', salt);

        const additionalClients = [
            { name: 'Pacific Shipping Ltd', code: 'PACIFIC', email: 'ops@pacific.com' },
            { name: 'Oceanic Transports', code: 'OCEANIC', email: 'ops@oceanic.com' },
            { name: 'Global Marine Corp', code: 'GLOBAL', email: 'ops@globalmarine.com' },
            { name: 'Evergreen Logistics', code: 'EVERGREEN', email: 'ops@evergreen.com' },
            { name: 'Nordic Sailors Group', code: 'NORDIC', email: 'ops@nordic.com' }
        ];

        for (const c of additionalClients) {
            let client = await db.Client.findOne({ where: { company_code: c.code } });
            if (!client) {
                client = await db.Client.create({
                    company_name: c.name,
                    company_code: c.code,
                    email: c.email,
                    status: 'ACTIVE'
                });
                console.log(`${c.name} client seeded`);
            }

            let user = await db.User.findOne({ where: { email: c.email } });
            if (!user) {
                user = await db.User.create({
                    name: `${c.code} Operations`,
                    email: c.email,
                    password_hash: defaultPassword,
                    role: 'CLIENT',
                    client_id: client.id,
                    status: 'ACTIVE'
                });
                console.log(`${c.email} user seeded`);
            }

            // Seed Multiple Vessels for PACIFIC to show a rich dashboard
            const vesselCount = c.code === 'PACIFIC' ? 3 : 1;
            for (let i = 1; i <= vesselCount; i++) {
                const imo = c.code === 'PACIFIC' ? `920000${i}` : `900${Math.floor(1000 + Math.random() * 9000)}`;
                let vessel = await db.Vessel.findOne({ where: { imo_number: imo } });
                if (!vessel) {
                    vessel = await db.Vessel.create({
                        client_id: client.id,
                        flag_administration_id: flag.id,
                        vessel_name: i === 1 ? `MV ${c.code} Star` : `MV ${c.code} ${i === 2 ? 'Voyager' : 'Titan'}`,
                        imo_number: imo,
                        call_sign: `${c.code}${i}23`,
                        mmsi_number: `1234567${Math.floor(10 + Math.random() * 89)}`,
                        ship_type: i % 2 === 0 ? 'Container Ship' : 'Tanker',
                        gross_tonnage: 30000 + (i * 5000),
                        class_status: 'ACTIVE'
                    });
                    console.log(`${vessel.vessel_name} vessel seeded`);
                }
            }
        }

        // 2. Ensure Maersk Client exists
        let client = await db.Client.findOne({ where: { company_code: 'MAERSK' } });
        if (!client) {
            client = await db.Client.create({
                company_name: 'Maersk Line',
                company_code: 'MAERSK',
                email: 'info@maersk.com',
                status: 'ACTIVE'
            });
            console.log('Client seeded');
        }

        // 3. Ensure a Vessel exists for the Maersk client
        let vessel = await db.Vessel.findOne({ where: { imo_number: '9876543' } });
        if (!vessel) {
            vessel = await db.Vessel.create({
                client_id: client.id,
                flag_administration_id: flag.id,
                vessel_name: 'MV Girik Explorer',
                imo_number: '9876543',
                call_sign: 'WXYZ123',
                mmsi_number: '123456789',
                ship_type: 'Bulk Carrier',
                gross_tonnage: 50000,
                class_status: 'ACTIVE'
            });
            console.log('Vessel seeded');
        }

        // 4. Ensure an Admin user exists for reporting/resolving
        const adminUser = await db.User.findOne({ where: { role: 'ADMIN' } });
        if (!adminUser) {
            console.error('No admin user found. Please run initial_seed.js first.');
            process.exit(1);
        }

        // Fetch Pacific user/vessel for specific seeding below
        const pacificUser = await db.User.findOne({ where: { email: 'ops@pacific.com' } });
        const pacificVessels = await db.Vessel.findAll({ where: { client_id: pacificUser.client_id } });
        const pacificVessel = pacificVessels[0];

        // 5. Seed Incidents for both clients
        const incidentCount = await db.Incident.count();
        if (incidentCount < 5) {
            await db.Incident.bulkCreate([
                {
                    vessel_id: vessel.id,
                    reported_by: adminUser.id,
                    title: 'Engine Cooling Failure',
                    description: 'The main engine cooling system showed high temperature warnings during transit.',
                    status: 'INVESTIGATING',
                    remarks: 'Technical team is looking into the pump efficiency.'
                },
                {
                    vessel_id: vessel.id,
                    reported_by: adminUser.id,
                    title: 'Lifeboat Release Mechanism Issue',
                    description: 'Port side lifeboat release mechanism felt stiff during routine drill.',
                    status: 'OPEN'
                },
                {
                    vessel_id: pacificVessel.id,
                    reported_by: pacificUser.id,
                    title: 'Minor Hull Scratch',
                    description: 'Noticed minor scratch on port side during docking at Singapore.',
                    status: 'OPEN'
                },
                {
                    vessel_id: pacificVessels[1].id,
                    reported_by: pacificUser.id,
                    title: 'Radar Intermittent Failure',
                    description: 'S-band radar losing signal intermittently in heavy rain.',
                    status: 'INVESTIGATING'
                }
            ]);
            console.log('Incidents seeded');
        }

        // 6. Seed Support Tickets
        const supportCount = await db.SupportTicket.count();
        if (supportCount < 5) {
            await db.SupportTicket.bulkCreate([
                {
                    user_id: pacificUser.id,
                    subject: 'Login Issue',
                    description: 'Unable to access vessel dashboard.',
                    status: 'OPEN',
                    priority: 'HIGH',
                    category: 'Technical'
                },
                {
                    user_id: pacificUser.id,
                    subject: 'Update Company Contact',
                    description: 'Need to change the primary billing email for Pacific Shipping.',
                    status: 'IN_PROGRESS',
                    priority: 'MEDIUM',
                    category: 'Account'
                },
                {
                    user_id: adminUser.id,
                    subject: 'Unable to upload certificate scan',
                    description: 'When uploading a 5MB PDF, the system returns a timeout error.',
                    status: 'IN_PROGRESS',
                    priority: 'HIGH',
                    category: 'Technical'
                }
            ]);
            console.log('Support Tickets seeded');
        }

        // 7. Seed Non-Conformities (NCs)
        let certType = await db.CertificateType.findOne({ where: { short_code: 'ASC' } });
        if (!certType) {
            certType = await db.CertificateType.create({
                name: 'Annual Survey Certificate',
                short_code: 'ASC',
                issuing_authority: 'CLASS',
                validity_years: 1
            });
            console.log('Certificate Type seeded');
        }

        const ncCount = await db.NonConformity.count();
        if (ncCount < 3) {
            // Seed a Job for Pacific to have NCs
            let pacificJob = await db.JobRequest.create({
                vessel_id: pacificVessel.id,
                requested_by_user_id: pacificUser.id,
                certificate_type_id: certType.id,
                job_status: 'IN_PROGRESS',
                reason: 'Initial survey',
                target_port: 'Singapore',
                target_date: new Date()
            });

            await db.NonConformity.bulkCreate([
                {
                    job_id: pacificJob.id,
                    description: 'Emergency generator failed to start within 45 seconds.',
                    severity: 'MAJOR',
                    status: 'OPEN'
                },
                {
                    job_id: pacificJob.id,
                    description: 'Navigation charts for the planned voyage not updated to latest notice.',
                    severity: 'MINOR',
                    status: 'OPEN'
                }
            ]);
            console.log('Non-Conformities seeded for Pacific');
        }

        // 8. Seed Certificates
        const certCount = await db.Certificate.count();
        if (certCount < 5) {
            await db.Certificate.bulkCreate([
                {
                    vessel_id: vessel.id,
                    certificate_type_id: certType.id,
                    certificate_number: 'CERT-2024-001',
                    status: 'ISSUED',
                    issue_date: '2024-01-15',
                    expiry_date: '2025-01-14',
                    issued_by_user_id: adminUser.id
                },
                {
                    vessel_id: pacificVessel.id,
                    certificate_type_id: certType.id,
                    certificate_number: 'CERT-PAC-001',
                    status: 'ISSUED',
                    issue_date: '2023-12-01',
                    expiry_date: '2024-11-30',
                    issued_by_user_id: adminUser.id
                },
                {
                    vessel_id: pacificVessels[1].id,
                    certificate_type_id: certType.id,
                    certificate_number: 'CERT-PAC-002',
                    status: 'EXPIRED',
                    issue_date: '2023-01-01',
                    expiry_date: '2024-01-01',
                    issued_by_user_id: adminUser.id
                },
                {
                    vessel_id: pacificVessels[2].id,
                    certificate_type_id: certType.id,
                    certificate_number: 'CERT-PAC-003',
                    status: 'DRAFT',
                    issued_by_user_id: adminUser.id
                }
            ]);
            console.log('Certificates seeded for Pacific');
        }

        // 9. Seed Payments for Pacific
        const paymentCount = await db.Payment.count();
        if (paymentCount < 3) {
            const pacificJob = await db.JobRequest.findOne({ where: { vessel_id: pacificVessel.id } });
            await db.Payment.bulkCreate([
                {
                    job_id: pacificJob.id,
                    invoice_number: 'INV-PAC-001',
                    amount: 3500.00,
                    currency: 'USD',
                    payment_status: 'PAID',
                    payment_date: new Date(),
                    verified_by_user_id: adminUser.id
                },
                {
                    job_id: pacificJob.id,
                    invoice_number: 'INV-PAC-002',
                    amount: 1200.00,
                    currency: 'USD',
                    payment_status: 'UNPAID'
                }
            ]);
            console.log('Payments seeded for Pacific');
        }

        // 10. Seed Activity Requests for Pacific
        const activityCount = await db.ActivityRequest.count();
        if (activityCount < 3) {
            await db.ActivityRequest.bulkCreate([
                {
                    request_number: 'REQ-PAC-001',
                    requested_by: pacificUser.id,
                    vessel_id: pacificVessel.id,
                    activity_type: 'INSPECTION',
                    requested_service: 'Annual Hull Inspection',
                    priority: 'MEDIUM',
                    description: 'Regular hull check requested before dry-docking.',
                    location_port: 'Singapore',
                    proposed_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
                    status: 'PENDING'
                },
                {
                    request_number: 'REQ-PAC-002',
                    requested_by: pacificUser.id,
                    vessel_id: pacificVessels[1].id,
                    activity_type: 'AUDIT',
                    requested_service: 'Safety Management Audit',
                    priority: 'HIGH',
                    description: 'Internal audit requested to prepare for PSC inspection.',
                    location_port: 'Dubai',
                    proposed_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    status: 'APPROVED'
                }
            ]);
            console.log('Activity Requests seeded for Pacific');
        }

        // 13. Seed Audit Logs
        await db.AuditLog.bulkCreate([
            {
                user_id: adminUser.id,
                action: 'RICH_DATA_SEED_PACIFIC',
                entity_name: 'System',
                new_values: { message: 'Deep operational data for Pacific Shipping seeded' }
            }
        ]);
        console.log('Audit Logs seeded');

        console.log('Rich operational data seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedOperationalData();
