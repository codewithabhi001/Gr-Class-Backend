import db from '../src/models/index.js';

async function syncDb() {
    try {
        console.log('Truncating tables to prevent FK errors during alter...');
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        
        // Truncate all potentially affected tables
        // Truncate all potentially affected tables
        const tablesToTruncate = [
  'jobs', 'job_status_histories', 'job_reschedules', 'job_notes', 'job_documents', 'job_requests',
  'survey_status_histories', 'surveys', 'survey_reports', 'certificate_history', 'certificates', 'certificate_templates',
  'payments', 'approvals', 'financial_ledgers', 'activity_requests', 'activity_plannings',
  'gps_tracking', 'non_conformities', 'incidents', 'change_requests', 'messages', 'notifications',
  'job_certificates'
        ];
        
        for (const table of tablesToTruncate) {
            try { await db.sequelize.query(`TRUNCATE TABLE \`${table}\``); } catch(e){}
        }

        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Force syncing missing tables (Payment, JobRequest, JobCertificate, Survey, JobDocument)...');
        await db.JobRequest.sync({ force: true });
        await db.Payment.sync({ force: true });
        await db.JobCertificate.sync({ force: true });
        await db.Survey.sync({ force: true });
        await db.JobDocument.sync({ force: true });

        console.log('Syncing database schema (alter: true)...');
        await db.sequelize.sync({ alter: true });
        console.log('✅ Database schema synced successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to sync database schema:', error);
        process.exit(1);
    }
}

syncDb();
