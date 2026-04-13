/**
 * Sync Certificate Types from Excel (non-destructive).
 *
 * This script will UPSERT rows into `certificate_types` from `CERTIFICATE/LIST.xlsx`
 * (NAME + SHORT FORM) without deleting existing records (safe for FK references).
 *
 * Optional:
 *  - Pass `--deactivate-missing` to mark DB types not present in Excel as INACTIVE.
 *
 * Usage:
 *   node scripts/sync_certificate_types_from_xlsx.js
 *   node scripts/sync_certificate_types_from_xlsx.js --file CERTIFICATE/LIST.xlsx
 *   node scripts/sync_certificate_types_from_xlsx.js --deactivate-missing
 */

import path from 'path';
import XLSX from 'xlsx';
import db from '../src/models/index.js';

function getArgValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function normalizeName(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

function normalizeShortCode(value) {
  return String(value ?? '').trim();
}

function loadTypesFromXlsx(filePath) {
  const wb = XLSX.readFile(filePath, { cellDates: true });
  if (!wb.SheetNames?.length) return [];

  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  return rows
    .map((r) => ({
      name: normalizeName(r['NAME']),
      short_code: normalizeShortCode(r['SHORT FORM']),
    }))
    .filter((t) => t.name && t.short_code);
}

async function main() {
  const fileArg = getArgValue('--file');
  const deactivateMissing = process.argv.includes('--deactivate-missing');
  const filePath = path.resolve(fileArg || 'CERTIFICATE/LIST.xlsx');

  console.log(`📄 Loading certificate types from: ${filePath}`);
  const types = loadTypesFromXlsx(filePath);
  console.log(`✅ Found ${types.length} certificate types in Excel`);

  const shortCodeMap = new Map();
  const duplicates = [];
  for (const t of types) {
    const key = t.short_code.toUpperCase();
    if (shortCodeMap.has(key)) duplicates.push([key, shortCodeMap.get(key), t]);
    else shortCodeMap.set(key, t);
  }
  if (duplicates.length) {
    console.log('\n⚠️  Duplicate SHORT FORM values detected (not blocking):');
    for (const [key, a, b] of duplicates) {
      console.log(`- ${key}: "${a.name}" and "${b.name}"`);
    }
    console.log('');
  }

  await db.sequelize.authenticate();
  console.log('✅ Database connection established');

  const transaction = await db.sequelize.transaction();
  try {
    let createdCount = 0;
    let updatedCount = 0;

    for (const t of types) {
      const existing = await db.CertificateType.findOne({
        where: { name: t.name },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!existing) {
        await db.CertificateType.create(
          {
            name: t.name,
            short_code: t.short_code,
            issuing_authority: 'CLASS',
            validity_years: 5,
            status: 'ACTIVE',
            description: null,
            requires_survey: true,
          },
          { transaction }
        );
        createdCount += 1;
        continue;
      }

      const shouldUpdate =
        (existing.short_code ?? '') !== t.short_code ||
        (existing.status ?? 'ACTIVE') !== 'ACTIVE';

      if (shouldUpdate) {
        await existing.update(
          {
            short_code: t.short_code,
            status: 'ACTIVE',
          },
          { transaction }
        );
        updatedCount += 1;
      }
    }

    let deactivatedCount = 0;
    if (deactivateMissing) {
      const excelNames = new Set(types.map((t) => t.name));
      const allDbTypes = await db.CertificateType.findAll({
        attributes: ['id', 'name', 'status'],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      for (const row of allDbTypes) {
        if (!excelNames.has(row.name) && row.status !== 'INACTIVE') {
          await row.update({ status: 'INACTIVE' }, { transaction });
          deactivatedCount += 1;
        }
      }
    }

    await transaction.commit();

    const total = await db.CertificateType.count();
    console.log('\n📊 Sync Summary:');
    console.log(`   Created: ${createdCount}`);
    console.log(`   Updated: ${updatedCount}`);
    if (deactivateMissing) console.log(`   Deactivated: ${deactivatedCount}`);
    console.log(`\n✨ Done. certificate_types now contains: ${total} rows\n`);
    process.exit(0);
  } catch (err) {
    await transaction.rollback();
    console.error('❌ Sync failed:', err);
    process.exit(1);
  }
}

main();

