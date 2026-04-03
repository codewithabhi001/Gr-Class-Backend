import db from '../models/index.js';

const seedStaticContent = async () => {
    try {
        console.log('--- Starting Static Content Seeding ---');

        // 1. "About Us" Page Content
        await db.SiteStaticContent.upsert({
            slug: 'about-us',
            title: 'About Girik Class',
            content_type: 'PAGE',
            body_html: `
                <article>
                    <h2>Who We Are</h2>
                    <p>Girik Class is a globally recognized maritime classification society, dedicated to ensuring marine safety, environmental protection, and operational excellence.</p>
                    <h3>Our Vision</h3>
                    <p>Building a safer and more sustainable maritime future through digital innovation and world-class inspection standards.</p>
                </article>
            `,
            is_published: true
        });
        console.log('Seeded: "About Us" page');

        // 2. FAQ Page Content
        await db.SiteStaticContent.upsert({
            slug: 'general-faq',
            title: 'General Frequently Asked Questions',
            content_type: 'FAQ',
            faq_items: [
                {
                    question: 'What is the purpose of maritime classification?',
                    answer: 'Classification societies establish and maintain technical standards for the construction and operation of ships and offshore structures.',
                    sort_order: 0
                },
                {
                    question: 'How do I request a survey?',
                    answer: 'You can request a survey through our client portal or by contacting our operations team directly at ops@girik.com.',
                    sort_order: 1
                },
                {
                    question: 'Is your certification recognized by major flag states?',
                    answer: 'Yes, Girik Class is authorized by leading flag administrations to perform statutory inspections and issue international certificates.',
                    sort_order: 2
                }
            ],
            is_published: true
        });
        console.log('Seeded: "General FAQ" content');

        // 3. Terms and Conditions (Draft)
        await db.SiteStaticContent.upsert({
            slug: 'terms-and-conditions',
            title: 'Terms of Service',
            content_type: 'PAGE',
            body_html: `
                <section>
                    <h2>Terms of Service</h2>
                    <p>By using our maritime services, you agree to comply with international maritime regulations and our internal standards...</p>
                    <p>Note: This content is currently under legal review.</p>
                </section>
            `,
            is_published: false // Seed as a draft
        });
        console.log('Seeded: "Terms and Conditions" (Draft)');

        // 4. Privacy Policy Page
        await db.SiteStaticContent.upsert({
            slug: 'privacy-policy',
            title: 'Privacy and Data Protection Policy',
            content_type: 'PAGE',
            body_html: `
                <section>
                    <h2>Data Protection</h2>
                    <p>We take your data privacy seriously. All vessel and client data is handled according to GDPR and maritime confidentiality agreements.</p>
                </section>
            `,
            is_published: true
        });
        console.log('Seeded: "Privacy Policy" page');

        console.log('--- Static Content Seeding Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding static content:', error);
        process.exit(1);
    }
};

seedStaticContent();
