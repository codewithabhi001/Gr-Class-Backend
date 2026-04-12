import 'dotenv/config';
import db from '../src/models/index.js';
import bcrypt from 'bcrypt';

async function seed() {
    try {
        console.log('--- Starting Initial Data Seed ---');

        // 1. Roles & Users (Admin)
        const saltRounds = 10;
        const adminPassword = await bcrypt.hash('Admin@123', saltRounds);
        const surveyorPassword = await bcrypt.hash('Surveyor@123', saltRounds);

        const [admin, adminCreated] = await db.User.findOrCreate({
            where: { email: 'admin@grclass.com' },
            defaults: {
                name: 'GR-Class Admin',
                password_hash: adminPassword,
                role: 'ADMIN',
                status: 'ACTIVE'
            }
        });
        if (adminCreated) console.log('✅ Created Admin user');

        // 2. Client Company (Pacific Shipping)
        const [clientCompany, clientCreated] = await db.Client.findOrCreate({
            where: { company_name: 'Pacific Shipping Ltd' },
            defaults: {
                company_code: 'PACIFIC',
                address: '123 Maritime St, Singapore',
                country: 'Singapore',
                email: 'ops@pacific.com',
                status: 'ACTIVE'
            }
        });
        if (clientCreated) console.log('✅ Created Client Company: Pacific Shipping Ltd');

        // 3. Surveyor (Specified Email)
        const [surveyor, surveyorCreated] = await db.User.findOrCreate({
            where: { email: 'abhivishwkarmaa52@gmail.com' },
            defaults: {
                name: 'Abhinav Vishwakarma',
                password_hash: surveyorPassword,
                role: 'SURVEYOR',
                status: 'ACTIVE'
            }
        });
        if (surveyorCreated) {
            console.log('✅ Created Surveyor user');
            // Create surveyor profile
            await db.SurveyorProfile.findOrCreate({
                where: { user_id: surveyor.id },
                defaults: {
                    qualification: 'General Hull & Machinery',
                    status: 'ACTIVE',
                    years_of_experience: 10
                }
            });
            console.log('✅ Created Surveyor Profile');
        }

        // 4. Certificate Types & Required Documents & Checklist Templates
        const certTypes = [
            {
                name: 'Load Line',
                short_code: 'LL',
                issuing_authority: 'CLASS',
                validity_years: 5,
                description: 'International Load Line Certificate',
                requires_survey: true,
                docs: ['Draft Calculation', 'Load Line Inspection Record'],
                checklist: {
                    name: 'Load Line Annual Survey Checklist',
                    code: 'LL-AS-01',
                    sections: [
                        {
                            title: 'General Condition',
                            items: [
                                { code: 'LL-01', text: 'Condition of hatches', type: 'YES_NO' },
                                { code: 'LL-02', text: 'Freeboard marks visibility', type: 'YES_NO' }
                            ]
                        }
                    ]
                }
            },
            {
                name: 'Safety Equipment',
                short_code: 'SE',
                issuing_authority: 'CLASS',
                validity_years: 2,
                description: 'Cargo Ship Safety Equipment Certificate',
                requires_survey: true,
                docs: ['Lifeboat Maintenance Record', 'Fire Extinguisher Test Report'],
                checklist: {
                    name: 'Safety Equipment Periodical Survey',
                    code: 'SE-PS-01',
                    sections: [
                        {
                            title: 'Life Saving Appliances',
                            items: [
                                { code: 'SE-01', text: 'Lifeboats condition', type: 'YES_NO' },
                                { code: 'SE-02', text: 'Lifejackets accessibility', type: 'YES_NO' }
                            ]
                        }
                    ]
                }
            }
        ];

        for (const ct of certTypes) {
            const [certType, ctCreated] = await db.CertificateType.findOrCreate({
                where: { short_code: ct.short_code },
                defaults: {
                    name: ct.name,
                    issuing_authority: ct.issuing_authority,
                    validity_years: ct.validity_years,
                    description: ct.description,
                    requires_survey: ct.requires_survey
                }
            });
            if (ctCreated) console.log(`✅ Created Certificate Type: ${ct.name}`);

            // Docs
            for (const docName of ct.docs) {
                await db.CertificateRequiredDocument.findOrCreate({
                    where: { certificate_type_id: certType.id, document_name: docName },
                    defaults: { is_mandatory: true }
                });
            }
            if (ctCreated) console.log(`   - Added ${ct.docs.length} required documents`);

            // Checklist Template
            await db.ChecklistTemplate.findOrCreate({
                where: { code: ct.checklist.code },
                defaults: {
                    name: ct.checklist.name,
                    certificate_type_id: certType.id,
                    sections: ct.checklist.sections,
                    status: 'ACTIVE',
                    created_by: admin.id
                }
            });
            if (ctCreated) console.log(`   - Added Checklist Template: ${ct.checklist.name}`);
        }

        // 5. Site Static Content
        const staticContents = [
            {
                slug: 'faq',
                title: 'Frequently Asked Questions',
                content_type: 'FAQ',
                faq_items: [
                    { question: 'What is GR-Class?', answer: 'GR-Class is a classification society.' },
                    { question: 'How to request a survey?', answer: 'You can request a survey through the client portal.' }
                ]
            },
            {
                slug: 'terms-and-conditions',
                title: 'Terms and Conditions',
                content_type: 'PAGE',
                body_html: '<h1>Terms and Conditions</h1><p>Our terms of service are as follows...</p>'
            },
            {
                slug: 'new-regulations-2026',
                title: 'New Maritime Regulations 2026',
                content_type: 'NEWS',
                body_html: '<p>IMO has announced new regulations regarding CO2 emissions...</p>',
                published_at: new Date()
            }
        ];

        for (const sc of staticContents) {
            await db.SiteStaticContent.findOrCreate({
                where: { slug: sc.slug },
                defaults: {
                    ...sc,
                    is_published: true,
                    updated_by: admin.id
                }
            });
            console.log(`✅ Created Content: ${sc.title} (${sc.content_type})`);
        }

        console.log('\n--- Seed Completed Successfully ---');

    } catch (error) {
        console.error('❌ Error seeding data:', error);
    } finally {
        process.exit(0);
    }
}

seed();
