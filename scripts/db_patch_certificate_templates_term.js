/**
 * DB Patch: add `certificate_term` column to `certificate_templates` if missing.
 *
 * Since this repo doesn't use sequelize migrations, this script safely applies
 * the schema change to existing MySQL databases.
 *
 * Usage:
 *   node scripts/db_patch_certificate_templates_term.js
 */

import db from '../src/models/index.js';

async function main() {
  await db.sequelize.authenticate();

  const qi = db.sequelize.getQueryInterface();
  const tableName = 'certificate_templates';

  const desc = await qi.describeTable(tableName);
  if (desc.certificate_term) {
    console.log('✅ certificate_templates.certificate_term already exists. Nothing to do.');
    process.exit(0);
  }

  console.log('🛠️  Adding certificate_templates.certificate_term ...');
  await qi.addColumn(tableName, 'certificate_term', {
    type: db.Sequelize.DataTypes.ENUM('FULL_TERM', 'SHORT_TERM'),
    allowNull: true,
    defaultValue: null,
  });

  console.log('✅ Added certificate_term column.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ DB patch failed:', err);
  process.exit(1);
});

