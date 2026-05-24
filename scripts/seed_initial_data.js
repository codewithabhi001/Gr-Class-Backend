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
            where: { email: 'info@grclass.com' },
            defaults: {
                name: 'GR-Class Admin',
                password_hash: adminPassword,
                role: 'ADMIN',
                status: 'ACTIVE'
            }
        });
        if (adminCreated) console.log('✅ Created Admin user');

        // Note: Client and Surveyor creation removed as only the admin user should be seeded.

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

        // 5. Website Static Content Seeding
        console.log('\n--- Seeding Website Static Content ---');
        const staticContents = [
            {
                key: 'about-us',
                title: 'About GR-Class – Excellence in Maritime Classification',
                body_html: `
<section style="line-height: 1.6; color: #333; font-family: sans-serif;">
    <h2 style="color: #0d233a; border-bottom: 2px solid #0d233a; padding-bottom: 8px;">GR Class Services</h2>
    
    <h3 style="color: #1b4f72; margin-top: 20px;">About Us – GR Class: Classified for Standards</h3>
    <p>
        GR Class welcomes you for your asset’s safety and compliances. GR Class is a Recognized Organization (RO), 
        Recognized Security Organization (RSO), and Classification Society (CS) authorised to offer statutory/class certification and services.
    </p>
    <p>
        We are committed to ensuring the highest standards of safety, reliability, and environmental sustainability in the maritime industry. 
        Our team possesses strong technical expertise and professionalism, guaranteeing dedicated service to our clients.
    </p>
    <p>
        Our range of services includes the classification of newly built ships, as well as the classification and certification of 
        existing vessels for continued safe operation. We also provide statutory certification services.
    </p>
    <p>
        We strive to be the trusted partner for ship owners and operators, offering reliable and cost-effective solutions tailored to their specific requirements.
    </p>

    <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />

    <h3 style="color: #1b4f72;">Mission</h3>
    <p>
        Ensuring marine safety and safeguarding lives and property at sea through a comprehensive approach that combines international regulations 
        (e.g., SOLAS, ISPS Code), advanced surveillance, rigorous training, and risk management to protect lives, vessels, and the marine environment.
    </p>

    <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />

    <h3 style="color: #1b4f72;">Capabilities</h3>
    <p>
        Being a classification society, our geographical presence along with certified surveyors makes GR Class technically strong and capable, 
        enhancing survey capabilities and ensuring standardised regulatory and compliance services.
    </p>
    <p>
        GR Class maintains strong technical infrastructure and secure, reliable information systems to manage vessel data, survey statuses, and certificates effectively.
    </p>

    <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />

    <h3 style="color: #1b4f72;">Expertise</h3>
    <p>
        We work with values, ethics, and standards. The trust we gain from our valued customers helps GR Class achieve higher standards of excellence.
    </p>
    <p>
        Our surveyors, auditors, and technical experts possess decades of experience in assessing and verifying ship safety standards and handling complex 
        maritime issues through clear procedures and cost-effective support for ship operators.
    </p>

    <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />

    <h3 style="color: #1b4f72;">Our Services</h3>
    
    <h4 style="color: #2c3e50;">Classification Services</h4>
    <ul style="padding-left: 20px;">
        <li>Fleet in Services</li>
        <li>New Construction</li>
        <li>Transfer of Class</li>
        <li>Yacht Service</li>
        <li>Offshore Service</li>
        <li>Conversion Projects</li>
        <li>Approval of Plans and Manuals</li>
    </ul>

    <h4 style="color: #2c3e50; margin-top: 15px;">Statutory Services</h4>
    <ul style="padding-left: 20px;">
        <li>Flag Statutory Services</li>
        <li>Survey & Certification</li>
        <li>SOLAS</li>
        <li>MARPOL</li>
        <li>Load Line</li>
        <li>Tonnage</li>
        <li>MODU</li>
    </ul>

    <h4 style="color: #2c3e50; margin-top: 15px;">Environmental Services</h4>
    <ul style="padding-left: 20px;">
        <li>Ballast Water Management (BWM)</li>
        <li>IHM</li>
        <li>Energy Efficiency (EEDI-EEXI-CII)</li>
        <li>EU MRV Compliance</li>
        <li>Vessel Emergency Response Services</li>
    </ul>

    <h4 style="color: #2c3e50; margin-top: 15px;">Other Services</h4>
    <ul style="padding-left: 20px;">
        <li>Compliance Support</li>
        <li>Remote Surveys</li>
        <li>Port State Control</li>
        <li>Technical Advisory Services</li>
    </ul>

    <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />

    <h3 style="color: #1b4f72;">Address</h3>
    <address style="font-style: normal; background-color: #f9f9f9; padding: 15px; border-left: 4px solid #1b4f72; border-radius: 4px;">
        <strong>GR Class</strong><br />
        B.C. 1304883<br />
        Building Name – Ajman Free Zone C1 Building<br />
        Ajman District Business<br />
        Makani No – 4442612247
    </address>
</section>
`
            },
            {
                key: 'faq',
                title: 'Frequently Asked Questions (FAQ)',
                faq_items: [
                    {
                        question: 'What is the role of GR Class as a Recognized Organization (RO)?',
                        answer: 'As a Recognized Organization (RO) and Classification Society (CS), GR Class is authorized by various Flag Administrations to perform statutory surveys, verify safety compliance, and issue legal certificates in accordance with major international conventions like SOLAS, MARPOL, and Load Line.',
                        sort_order: 0
                    },
                    {
                        question: 'How do I submit an application for ship classification?',
                        answer: 'Ship classification applications can be initiated online via the GR Class Portal. You will need to upload basic vessel dimensions, general plans, and operational history. Our technical experts will then review the data to proceed with the survey schedule.',
                        sort_order: 1
                    },
                    {
                        question: 'Are GR Class certificates digitally verifiable?',
                        answer: 'Yes, all certificates issued by GR Class are digitally signed and include secure QR codes. Port State Control (PSC), custom officers, and flag authorities can instantly verify certificate validity by scanning the QR code.',
                        sort_order: 2
                    },
                    {
                        question: 'What happens if a surveyor identifies a deficiency during inspection?',
                        answer: 'If a deficiency is noted, our surveyor will issue a formal Condition of Class or Non-Conformity report. The vessel operator is provided with a realistic timeframe to perform rectifications, which are subsequently audited for compliance.',
                        sort_order: 3
                    }
                ]
            },
            {
                key: 'privacy',
                title: 'Privacy Policy',
                body_html: `
<section style="line-height: 1.6; color: #333; font-family: sans-serif;">
    <h2 style="color: #0d233a; border-bottom: 2px solid #0d233a; padding-bottom: 8px;">Privacy Policy</h2>
    <p><strong>Last Updated: May 17, 2026</strong></p>
    <p>
        At GR Class, we are committed to safeguarding the privacy and security of our clients' data, including vessel blueprints, crew information, 
        and administrative credentials. This Privacy Policy details how we collect, process, and protect your information.
    </p>

    <h3 style="color: #1b4f72; margin-top: 20px;">1. Information We Collect</h3>
    <p>We collect structural vessel data, compliance documents, email addresses of operations personnel, and payment details during registration and service requests.</p>

    <h3 style="color: #1b4f72; margin-top: 20px;">2. Use of Information</h3>
    <p>The collected information is used solely to assess technical standards, issue digital certificates, coordinate surveyor schedules, and fulfill statutory duties on behalf of Flag Administrations.</p>

    <h3 style="color: #1b4f72; margin-top: 20px;">3. Data Sharing & Compliance</h3>
    <p>Data is never sold to third parties. We share information only with authorized Flag Administrations, Port State Control, or as required by international maritime conventions.</p>

    <h3 style="color: #1b4f72; margin-top: 20px;">4. Security Protocols</h3>
    <p>GR Class implements advanced encryption, access-controlled databases, and regular security audits to protect sensitive operational files from unauthorized access.</p>
</section>
`
            },
            {
                key: 'terms-compliance',
                title: 'Terms of Use & Compliance Standards',
                body_html: `
<section style="line-height: 1.6; color: #333; font-family: sans-serif;">
    <h2 style="color: #0d233a; border-bottom: 2px solid #0d233a; padding-bottom: 8px;">Terms of Use & Compliance</h2>
    <p><strong>Effective Date: May 17, 2026</strong></p>
    <p>
        These Terms govern all classification, statutory, and environmental survey services provided by GR Class to shipowners, charterers, and managers. 
        By scheduling a survey or utilizing our certificates, you agree to these conditions.
    </p>

    <h3 style="color: #1b4f72; margin-top: 20px;">1. Standards of Performance</h3>
    <p>
        All surveys are conducted by certified GR Class surveyors with professional integrity. However, classification and certification do not relieve 
        the owner of their primary responsibility to maintain the vessel in a seaworthy condition.
    </p>

    <h3 style="color: #1b4f72; margin-top: 20px;">2. Access to Vessels</h3>
    <p>Shipowners must provide GR Class surveyors with safe, unobstructed access to the vessel, including dry-dock spaces, tanks, and structural compartments, along with complete technical documentation.</p>

    <h3 style="color: #1b4f72; margin-top: 20px;">3. Fees and Payments</h3>
    <p>Fees for surveys, plan approvals, and certificate issuances are billed according to our official tariff structure. Payment must be cleared prior to releasing formal certificate documents unless prior accounts have been established.</p>

    <h3 style="color: #1b4f72; margin-top: 20px;">4. Governing Law</h3>
    <p>These terms and all maritime services provided by GR Class are governed by the laws and regulations authorized by the representing Flag Administrations.</p>
</section>
`
            },
            {
                key: 'news',
                title: 'Newsroom & Maritime Advisories',
                news_items: [
                    {
                        id: 'news-01',
                        title: 'GR Class Expands Middle East Operations',
                        body_html: '<p>GR Class is proud to announce the setup of its primary administrative operational hub in the Ajman District Business Hub. This geographic expansion increases survey responsiveness and capacity for Gulf and international clients.</p>',
                        thumbnail_url: 'https://images.unsplash.com/photo-1541462608141-2f58c70402b1?w=500',
                        published_at: '2026-05-15T09:00:00Z'
                    },
                    {
                        id: 'news-02',
                        title: 'Adoption of IMO 2026 Environmental Standards',
                        body_html: '<p>In alignment with upcoming IMO targets, GR Class has rolled out a suite of technical environmental advisory services focusing on EEDI, EEXI, and CII compliance mapping for bulk carriers and tank fleets.</p>',
                        thumbnail_url: 'https://images.unsplash.com/photo-1505705694340-019e1e335916?w=500',
                        published_at: '2026-05-10T14:30:00Z'
                    }
                ]
            }
        ];

        for (const content of staticContents) {
            await db.SiteStaticContent.create({
                key: content.key,
                title: content.title,
                body_html: content.body_html || null,
                faq_items: content.faq_items || null,
                news_items: content.news_items || null
            });
            console.log(`✅ Seeded static content row: ${content.key}`);
        }

        console.log('\n--- Seed Completed Successfully ---');

    } catch (error) {
        console.error('❌ Error seeding data:', error);
    } finally {
        process.exit(0);
    }
}

seed();
