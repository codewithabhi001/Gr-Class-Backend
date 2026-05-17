import 'dotenv/config';
import db from '../src/models/index.js';

async function updateFaq() {
    try {
        console.log('--- Updating FAQ to Grouped Structure ---');

        const groupedFaqs = [
            {
                heading: "General & Classification",
                questions: [
                    {
                        question: "What is the role of GR Class as a Recognized Organization (RO)?",
                        answer: "As a Recognized Organization (RO) and Classification Society (CS), GR Class is authorized by various Flag Administrations to perform statutory surveys, verify safety compliance, and issue legal certificates in accordance with major international conventions like SOLAS, MARPOL, and Load Line."
                    },
                    {
                        question: "How do I submit an application for ship classification?",
                        answer: "Ship classification applications can be initiated online via the GR Class Portal. You will need to upload basic vessel dimensions, general plans, and operational history. Our technical experts will then review the data to proceed with the survey schedule."
                    }
                ]
            },
            {
                heading: "Surveys & Audits",
                questions: [
                    {
                        question: "What happens if a surveyor identifies a deficiency during inspection?",
                        answer: "If a deficiency is noted, our surveyor will issue a formal Condition of Class or Non-Conformity report. The vessel operator is provided with a realistic timeframe to perform rectifications, which are subsequently audited for compliance."
                    },
                    {
                        question: "Can I request a remote survey?",
                        answer: "Yes, GR Class supports remote surveys for certain minor vessel checks, checklist reviews, and documentation audits. You can coordinate this through the admin panel under remote survey requests."
                    }
                ]
            },
            {
                heading: "Certification & Compliance",
                questions: [
                    {
                        question: "Are GR Class certificates digitally verifiable?",
                        answer: "Yes, all certificates issued by GR Class are digitally signed and include secure QR codes. Port State Control (PSC), custom officers, and flag authorities can instantly verify certificate validity by scanning the QR code."
                    },
                    {
                        question: "How are certificate expiry dates monitored?",
                        answer: "The GR Class system automatically tracks all certificates and sends automated email notifications to client managers at 90, 60, and 30 days prior to expiration to facilitate timely scheduling of annual or renewal surveys."
                    }
                ]
            }
        ];

        const [record, created] = await db.SiteStaticContent.findOrCreate({
            where: { key: 'faq' },
            defaults: {
                key: 'faq',
                title: 'Frequently Asked Questions (FAQ)',
                faq_items: groupedFaqs,
                news_items: []
            }
        });

        if (!created) {
            record.faq_items = groupedFaqs;
            await record.save();
            console.log('✅ Successfully updated existing FAQ content to grouped structure!');
        } else {
            console.log('✅ Successfully seeded new FAQ content with grouped structure!');
        }

        console.log('--- Update Completed Successfully ---');
    } catch (error) {
        console.error('❌ Error updating FAQ:', error);
    } finally {
        process.exit(0);
    }
}

updateFaq();
