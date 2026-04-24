
import 'dotenv/config';
import db from '../src/models/index.js';

const TABLES_TO_TRUNCATE = [
  'certificate_history', 'certificates', 'certificate_templates',
  'checklist_templates', 'documents', 'certificate_required_documents', 'certificate_types',
  'certificate_authorities', 'job_documents', 'job_status_histories', 'jobs', 'surveys', 'survey_status_histories'
];

async function cleanup() {
    console.log('🧹 Starting Refined Certificate Cleanup...');
    try {
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        for (const table of TABLES_TO_TRUNCATE) {
            try {
                await db.sequelize.query(`TRUNCATE TABLE \`${table}\``);
                console.log(`✅ Truncated: ${table}`);
            } catch (err) {
                console.warn(`⚠️  Skipped ${table}: ${err.message}`);
            }
        }
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('\n🗑️  CERTIFICATE DATA WIPED: Database is now empty for all certificate-related tables.');
        
        // Verification counts
        const [results] = await db.sequelize.query('SELECT count(*) as count FROM certificates');
        console.log(`Verification: Certificates count = ${results[0].count}`);
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Cleanup Failed:', err);
        process.exit(1);
    }
}

cleanup();
