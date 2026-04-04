import db from '../models/index.js';

const seedStaticContent = async () => {
    try {
        console.log('--- Deleting Existing Static Content ---');
        await db.SiteStaticContent.destroy({ where: {}, truncate: false }); // Clear all existing content before re-seeding

        console.log('--- Starting Professional Maritime Content Seeding ---');

        // 1. "About Us" Detailed Page
        await db.SiteStaticContent.create({
            slug: 'about-us',
            title: 'About Girik Class – Excellence in Maritime Classification',
            content_type: 'PAGE',
            body_html: `
                <section>
                    <h1>Girik Class: Redefining Maritime Safety</h1>
                    <p>
                        Established as a leading <strong>Recognized Organization (RO)</strong>, 
                        Girik Class provides comprehensive classification and statutory services to the global maritime industry. 
                        Our mission is to safeguard life at sea and protect the marine environment through rigorous technical standards and digital innovation.
                    </p>
                    
                    <h3>Our Technical Expertise</h3>
                    <p>
                        We operate a dedicated network of highly qualified marine surveyors and technical experts across all major ports. 
                        By adhering to standards equivalent to the International Association of Classification Societies (IACS), 
                        we ensure that every vessel under our register meets the highest level of structural and operational integrity.
                    </p>

                    <h3>Why Choose Girik Class?</h3>
                    <ul style="line-height: 1.6;">
                        <li><strong>Digital-First Approach:</strong> Real-time certificate verification and seamless online survey scheduling.</li>
                        <li><strong>Global Network:</strong> Expert surveyors available 24/7 in strategic maritime hubs.</li>
                        <li><strong>Regulatory Authorization:</strong> Authorized by multiple flag administrations to perform statutory inspections.</li>
                        <li><strong>Transparent Lifecycle:</strong> Intelligent tracking from job assignment to finalized certification.</li>
                    </ul>

                    <p>
                        At Girik Class, we don't just inspect; we partner with shipowners and management companies to ensure 
                        compliance is a smooth, efficient, and auditable process.
                    </p>
                </section>
            `,
            is_published: true
        });
        console.log('Seeded: Detailed "About Us" page');

        // 2. Comprehensive Survey & Certification FAQ
        await db.SiteStaticContent.create({
            slug: 'certification-faq',
            title: 'Certification and Survey – Frequently Asked Questions',
            content_type: 'FAQ',
            faq_items: [
                {
                    question: 'What is the difference between Classification and Statutory surveys?',
                    answer: 'Classification surveys ensure a vessel meets the technical rules of the RO regarding structural integrity and machinery. Statutory surveys are performed on behalf of Flag States to ensure compliance with international conventions like SOLAS, MARPOL, and Load Line.',
                    sort_order: 0
                },
                {
                    question: 'How do I book an Annual or Renewal survey?',
                    answer: 'Surveys can be scheduled via the Girik Ops portal. Once a request is submitted, our operations team assigns a surveyor based on location and expertise. Clients can track the status from "Assigned" to "Certified" in real-time.',
                    sort_order: 1
                },
                {
                    question: 'Are digital certificates issued by Girik Class legally valid?',
                    answer: 'Yes. All certificates issued by Girik Class are digitally signed and include a secure QR code for instant verification by Port State Control (PSC) and other authorities, ensuring full compliance with IMO guidelines.',
                    sort_order: 2
                },
                {
                    question: 'What happens if a deficiency is found during a survey?',
                    answer: 'If a deficiency is noted, a "Non-Conformity" or "Condition of Class" is issued. The shipowner is provided with a timeline for rectification. Once the rectifications are verified, the surveyor will update the status for final certificate issuance.',
                    sort_order: 3
                },
                {
                    question: 'Which flag administrations recognize Girik Class?',
                    answer: 'Girik Class is authorized by several prominent flag states to act as their Recognized Organization. Contact our compliance department at compliance@grclass.com for the full list of authorizations.',
                    sort_order: 4
                }
            ],
            is_published: true
        });
        console.log('Seeded: Comprehensive "Certification FAQ"');

        // 3. Privacy, Data Resident & Compliance Policy
        await db.SiteStaticContent.create({
            slug: 'privacy-and-compliance',
            title: 'Privacy and Regulatory Compliance Policy',
            content_type: 'PAGE',
            body_html: `
                <section>
                    <h1>Security and Data Integrity</h1>
                    <p>
                        In the maritime industry, data integrity is paramount. Girik Class maintains a secure environment for all 
                        vessel documentation, technical drawings, and surveyor reports.
                    </p>

                    <h3>Confidentiality and Data Residency</h3>
                    <p>
                        We respect the commercial sensitivity of fleet data. All information submitted to Girik Class is 
                        protected by strict end-to-end encryption. We do not share survey results or owner information 
                        with third parties unless required by Flag Administrations or Port State Control as part of mandatory reporting.
                    </p>

                    <h3>Audit Trail and Traceability</h3>
                    <p>
                        Our platform maintains an immutable audit trail for every status change in the job lifecycle. 
                        Every certificate issued can be traced back to the specific surveyor, inspection report, and approval officer.
                    </p>
                    
                    <h3>Compliance with IMO Requirements</h3>
                    <p>
                        Our internal management systems are audited regularly to ensure alignment with IMO Resolution A.739(18) 
                        and A.789(19) regarding the authorization of recognized organizations.
                    </p>
                </section>
            `,
            is_published: true
        });
        // 4. News Articles (Newsroom)
        await db.SiteStaticContent.create({
            slug: 'girik-class-expands-network-middle-east',
            title: 'Expansion: Girik Class Opens New Survey Hub in Dubai',
            content_type: 'NEWS',
            body_html: `
                <article>
                    <h2>Boosting Services in the GCC Region</h2>
                    <p>To better serve our growing fleet in the Middle East, Girik Class is excited to announce the opening of its latest technical hub in Dubai, UAE.</p>
                    <p>This new facility will house five senior surveyors and a dedicated technical team for rapid response to vessel inspection requests in Port Rashid, Jebel Ali, and surrounding regions.</p>
                </article>
            `,
            thumbnail_url: 'https://cdn.grclass.com/news/dubai-expansion.jpg',
            is_published: true,
            published_at: new Date('2026-03-20')
        });

        await db.SiteStaticContent.create({
            slug: 'blockchain-certificate-verification-launch',
            title: 'Technology: Immutable Blockchain Verification Now Live',
            content_type: 'NEWS',
            body_html: `
                <article>
                    <h2>Ending Maritime Fraud</h2>
                    <p>Girik Class has successfully integrated blockchain technology into its digital certification pipeline.</p>
                    <p>Every certificate issued from today onwards will be permanently anchored to a secure ledger, allowing Port State Control and shipowners to verify authenticity in seconds without contacting our head office.</p>
                </article>
            `,
            thumbnail_url: 'https://cdn.grclass.com/news/blockchain-verify.jpg',
            is_published: true,
            published_at: new Date('2026-04-01')
        });

        await db.SiteStaticContent.create({
            slug: 'marine-sustainability-report-2026',
            title: 'Sustainability: 2026 Environmental Compliance Report Released',
            content_type: 'NEWS',
            body_html: `
                <article>
                    <h2>Exceeding MARPOL Standards</h2>
                    <p>Our annual report on global vessel compliance reveals a 15% improvement in emission reduction among the Girik-classed fleet.</p>
                    <p>We continue to advise our clients on technical upgrades to meet upcoming IMO greenhouse gas reduction targets.</p>
                </article>
            `,
            thumbnail_url: 'https://cdn.grclass.com/news/sustainability-2026.jpg',
            is_published: true,
            published_at: new Date('2026-04-04')
        });
        console.log('Seeded: 3 Professional NewsRoom articles');

        console.log('--- Relevant Maritime Content Seeding Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding maritime content:', error);
        process.exit(1);
    }
};

seedStaticContent();
