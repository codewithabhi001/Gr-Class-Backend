import 'dotenv/config';
import db from '../src/models/index.js';

/**
 * Destructive reset for local/dev:
 * - Deletes/truncates job & certificate transactional data
 * - Deletes imported certificate-type documents + checklist templates
 * - Deletes certificate types + required docs so they can be recreated from folders
 *
 * Keeps: users, clients, vessels, flag_administrations (master data)
 */

const TABLES_TO_TRUNCATE = [
  // Job flow
  'jobs', // exists via migration (may be unused)
  'job_status_histories',
  'job_reschedules',
  'job_notes',
  'job_documents',
  'job_requests',

  // Surveys & related
  'survey_status_histories',
  'surveys',

  // Certificates
  'certificate_history',
  'certificates',
  'certificate_templates',

  // Financial / approvals
  'payments',
  'approvals',
  'financial_ledgers',

  // Operational tables that often reference jobs
  'activity_requests',
  'activity_plannings',
  'gps_tracking',
  'non_conformities',
  'incidents',
  'change_requests',

  // Comms
  'messages',
  'notifications',
];

const TABLES_TO_TRUNCATE_IMPORTS = [
  // Imported checklist templates store S3 keys here
  'checklist_templates',
  // Imported CERTIFICATE_TYPE docs stored here
  'documents',
  // Required-doc catalog linked to certificate_types
  'certificate_required_documents',
  // Finally, the types themselves
  'certificate_types',
];

const truncateTable = async (table) => {
  // TRUNCATE is fastest; with FK checks disabled it will work.
  await db.sequelize.query(`TRUNCATE TABLE \`${table}\``);
};

const main = async () => {
  const dialect = db.sequelize.getDialect();
  if (dialect !== 'mysql') {
    throw new Error(`This reset script currently supports mysql only (found: ${dialect}).`);
  }

  const results = { truncated: [], skipped: [], warnings: [] };

  await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  try {
    for (const table of [...TABLES_TO_TRUNCATE, ...TABLES_TO_TRUNCATE_IMPORTS]) {
      try {
        await truncateTable(table);
        results.truncated.push(table);
      } catch (err) {
        // Ignore missing tables / permissions issues but record them
        results.skipped.push({
          table,
          error: err?.original?.sqlMessage || err?.message || String(err),
        });
      }
    }
  } finally {
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  }

  console.log(JSON.stringify(results, null, 2));
};

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.sequelize.close().catch(() => {});
  });

