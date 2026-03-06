import 'dotenv/config';
import db from '../src/models/index.js';
import * as lifecycleService from '../src/services/lifecycle.service.js';
import { v7 as uuidv7 } from 'uuid';

async function seed() {
    try {
        console.log('--- Starting Mega Seed Process ---');

        // 1. Get or Create Flag Administration
        let flagAdmin = await db.FlagAdministration.findOne({ where: { flag_state_name: 'Panama Shipping Authority' } });
        if (!flagAdmin) {
            console.log('Creating Flag Administration...');
            flagAdmin = await db.FlagAdministration.create({
                flag_state_name: 'Panama Shipping Authority',
                country: 'Panama',
                authority_name: 'PMA',
                contact_email: 'pma@maritime.pa',
                authorization_scope: 'Full authorization',
                status: 'ACTIVE'
            });
        }

        // 2. Create Client Company
        console.log('Creating Client Company...');
        const clientCompany = await db.Client.create({
            company_name: 'Global Ocean Logistics ' + Date.now(),
            company_code: 'GOL-' + Math.floor(Math.random() * 10000),
            address: '123 Ocean Drive, Singapore',
            country: 'Singapore',
            email: `contact_${Date.now()}@globalocean.com`,
            phone: '+65 9123 4567',
            contact_person_name: 'John Doe',
            contact_person_email: `john_${Date.now()}@globalocean.com`,
            status: 'ACTIVE'
        });

        // 3. Create Users
        console.log('Creating Users (Client, Admin, TM, Surveyor)...');
        const clientUser = await db.User.create({
            name: 'Client Manager',
            email: `client_${Date.now()}@gol.com`,
            password_hash: 'hashed_password', // Mocked
            role: 'CLIENT',
            client_id: clientCompany.id,
            phone: '+65 9123 4567',
            status: 'ACTIVE'
        });

        let admin = await db.User.findOne({ where: { role: 'ADMIN' } });
        if (!admin) {
            admin = await db.User.create({
                name: 'System Admin',
                email: `admin_${Date.now()}@girik.com`,
                password_hash: 'hashed_password',
                role: 'ADMIN',
                status: 'ACTIVE'
            });
        }

        let tm = await db.User.findOne({ where: { role: 'TM' } });
        if (!tm) {
            tm = await db.User.create({
                name: 'Technical Manager',
                email: `tm_${Date.now()}@girik.com`,
                password_hash: 'hashed_password',
                role: 'TM',
                status: 'ACTIVE'
            });
        }

        let surveyor = await db.User.findOne({ where: { role: 'SURVEYOR' } });
        if (!surveyor) {
            surveyor = await db.User.create({
                name: 'Expert Surveyor',
                email: `surveyor_${Date.now()}@girik.com`,
                password_hash: 'hashed_password',
                role: 'SURVEYOR',
                status: 'ACTIVE'
            });
            // Surveyor needs a profile usually
            await db.SurveyorProfile.create({
                user_id: surveyor.id,
                specialization: 'Cargo and Tankers',
                qualification: 'Master Mariner',
                total_experience_years: 15,
                status: 'APPROVED'
            });
        }

        // 4. Create Certificate Types, Templates, Checklists
        console.log('Creating Certificate Infrastructure...');
        const certTypes = [];
        const typeNames = ['Safety Equipment Certificate', 'Load Line Certificate'];
        for (const name of typeNames) {
            const certType = await db.CertificateType.create({
                name: name,
                issuing_authority: 'CLASS',
                validity_years: 5,
                status: 'ACTIVE',
                description: `Standard ${name} for commercial vessels.`,
                requires_survey: true
            });
            certTypes.push(certType);

            await db.CertificateTemplate.create({
                certificate_type_id: certType.id,
                template_name: name + ' Default Template',
                template_content: '<h1>{{vessel_name}}</h1><p>Certificate of {{cert_name}}</p>',
                variables: ['vessel_name', 'imo_number', 'expiry_date'],
                is_active: true
            });

            await db.ChecklistTemplate.create({
                name: name + ' Checklist',
                code: 'CHK-' + certType.id.substring(certType.id.length - 8).toUpperCase() + '-' + Math.floor(Math.random() * 1000).toString(),
                description: 'Complete inspection checklist for ' + name,
                certificate_type_id: certType.id,
                sections: [
                    {
                        title: 'Hull Inspection',
                        items: [
                            { code: 'H1', text: 'Condition of outer plating', type: 'YES_NO' },
                            { code: 'H2', text: 'Draft marks visibility', type: 'YES_NO' }
                        ]
                    },
                    {
                        title: 'Equipment Check',
                        items: [
                            { code: 'E1', text: 'Fire extinguishers level', type: 'PASS_FAIL' }
                        ]
                    }
                ],
                status: 'ACTIVE',
                created_by: admin.id
            });

            // Create Required Documents if used by creation flow
            await db.CertificateRequiredDocument.create({
                certificate_type_id: certType.id,
                document_name: 'REGISTRY_CERTIFICATE',
                is_mandatory: true
            });
            await db.CertificateRequiredDocument.create({
                certificate_type_id: certType.id,
                document_name: 'LAST_SURVEY_REPORT',
                is_mandatory: false
            });
        }

        // 5. Create Vessels
        console.log('Creating Vessels...');
        const vessels = [];
        for (let i = 0; i < 15; i++) {
            const v = await db.Vessel.create({
                client_id: clientCompany.id,
                flag_administration_id: flagAdmin.id,
                vessel_name: `Girik Vessel ${i + 1}`,
                imo_number: (1000000 + i).toString(),
                call_sign: `CALL-${i + 1}`,
                mmsi_number: (100000000 + i).toString(),
                port_of_registry: 'Singapore',
                year_built: 2010 + (i % 15),
                ship_type: i % 2 === 0 ? 'Bulk Carrier' : 'Oil Tanker',
                gross_tonnage: 50000 + (i * 100),
                net_tonnage: 25000 + (i * 50),
                deadweight: 80000 + (i * 200),
                class_status: 'ACTIVE',
                current_class_society: 'DNV',
                engine_type: 'Wartsila 6RT-flex50',
                builder_name: 'Hyundai Heavy Industries'
            });
            vessels.push(v);
        }

        // 6. Create Jobs for each status
        const statuses = [
            'CREATED', 'DOCUMENT_VERIFIED', 'APPROVED', 'ASSIGNED', 'SURVEY_AUTHORIZED',
            'IN_PROGRESS', 'SURVEY_DONE', 'REVIEWED', 'FINALIZED', 'REWORK_REQUESTED',
            'PAYMENT_DONE', 'CERTIFIED', 'REJECTED'
        ];

        console.log('Creating 20-25 jobs per status (Fast Track Integration)...');

        for (const status of statuses) {
            console.log(`- Generating jobs for status: ${status}`);
            const count = 20 + Math.floor(Math.random() * 6); // 20-25

            for (let j = 0; j < count; j++) {
                const vessel = vessels[Math.floor(Math.random() * vessels.length)];
                const certType = certTypes[Math.floor(Math.random() * certTypes.length)];

                // Directly create the job but with history to mimic actual flow
                const job = await db.JobRequest.create({
                    vessel_id: vessel.id,
                    requested_by_user_id: clientUser.id,
                    certificate_type_id: certType.id,
                    reason: 'Periodic Renewal',
                    target_port: 'Port of Singapore',
                    target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
                    job_status: status,
                    is_survey_required: true,
                    assigned_surveyor_id: (['ASSIGNED', 'SURVEY_AUTHORIZED', 'IN_PROGRESS', 'SURVEY_DONE', 'REVIEWED', 'FINALIZED', 'REWORK_REQUESTED', 'PAYMENT_DONE', 'CERTIFIED'].includes(status)) ? surveyor.id : null,
                    assigned_by_user_id: (['ASSIGNED', 'SURVEY_AUTHORIZED', 'IN_PROGRESS', 'SURVEY_DONE', 'REVIEWED', 'FINALIZED', 'REWORK_REQUESTED', 'PAYMENT_DONE', 'CERTIFIED'].includes(status)) ? admin.id : null,
                    approved_by_user_id: (['APPROVED', 'ASSIGNED', 'SURVEY_AUTHORIZED', 'IN_PROGRESS', 'SURVEY_DONE', 'REVIEWED', 'FINALIZED', 'REWORK_REQUESTED', 'PAYMENT_DONE', 'CERTIFIED'].includes(status)) ? admin.id : null,
                });

                // Add History
                await db.JobStatusHistory.create({
                    job_id: job.id,
                    previous_status: null,
                    new_status: status,
                    changed_by: admin.id,
                    reason: 'Mass Seed Injection'
                });

                // If status implies a survey exists, create it
                if (['IN_PROGRESS', 'SURVEY_DONE', 'REVIEWED', 'FINALIZED', 'REWORK_REQUESTED', 'PAYMENT_DONE', 'CERTIFIED'].includes(status)) {
                    let surveyStatus = 'NOT_STARTED';
                    if (status === 'IN_PROGRESS') surveyStatus = 'STARTED';
                    if (status === 'SURVEY_DONE' || status === 'REVIEWED' || status === 'PAYMENT_DONE' || status === 'CERTIFIED') surveyStatus = 'SUBMITTED';
                    if (status === 'FINALIZED') surveyStatus = 'FINALIZED';
                    if (status === 'REWORK_REQUESTED') surveyStatus = 'REWORK_REQUIRED';

                    const surveyData = {
                        job_id: job.id,
                        surveyor_id: surveyor.id,
                        survey_status: surveyStatus,
                        port_name: 'Port of Singapore',
                        started_at: (surveyStatus !== 'NOT_STARTED') ? new Date() : null,
                        submitted_at: (['SUBMITTED', 'FINALIZED'].includes(surveyStatus)) ? new Date() : null,
                        finalized_at: (surveyStatus === 'FINALIZED') ? new Date() : null,
                        declared_by: (['SUBMITTED', 'FINALIZED'].includes(surveyStatus)) ? surveyor.id : null,
                        declared_at: (['SUBMITTED', 'FINALIZED'].includes(surveyStatus)) ? new Date() : null,
                        start_latitude: 1.2902,
                        start_longitude: 103.8519,
                        submit_latitude: 1.2902,
                        submit_longitude: 103.8519,
                        attendance_photo_url: 'https://test-bucket.s3.amazonaws.com/attendance.jpg',
                        signature_url: 'https://test-bucket.s3.amazonaws.com/signature.png'
                    };

                    await db.Survey.create(surveyData);
                }
            }
        }

        console.log('\n--- Mega Seed Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('Mega Seed Failed:', error);
        process.exit(1);
    }
}

seed();
