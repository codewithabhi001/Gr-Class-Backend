import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import db from '../src/models/index.js';

const PROJECT_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CERTIFICATE_ROOT = path.join(PROJECT_ROOT, 'CERTIFICATE');
const CHECKLIST_ROOT = path.join(PROJECT_ROOT, 'CHECKLISTS');

const IGNORE_NAMES = new Set(['.DS_Store', 'Thumbs.db', 'LIST.xlsx', '~$CHECK LIST.xlsx']);

// Folder-name -> preferred short code
const CERTIFICATE_TYPE_ALIASES = {
  AFS: 'AFS',
  'ANTI-FOULING SYSTEM CERTIFICATE': 'AFS',
  ANTIFOULINGSYSTEMCERTIFICATE: 'AFS',
  'BALLAST WATER MANAGEMENT CERTIFICATE': 'BWM',
  BALLASTWATERMANAGEMENTCERTIFICATE: 'BWM',
  'BOTTOM INSPECTION': 'BOTTOM INSPECTION',
  BOTTOMINSPECTION: 'BOTTOM INSPECTION',
  'CARGO SHIP SAFETY CERTIFICATE': 'CSSC',
  'CARGO SHIP SAFETY CONSTRUCTION CERTIFICATE': 'CSSCC',
  'CARGO SHIP SAFETY EQUIPMENT CERTIFICATE': 'CSSEC',
  'CARGO SHIP SAFETY RADIO CERTIFICATE': 'CSSRC',
  'CARGO SHIP SAFETY RADIOTELEPHONY CERTIFICATE': 'CSSRTC',
  'CARIBBEAN CARGO SHIP SAFETY CERTIFICATE': 'CCSSC',
  CICA: 'CICA',
  DOC: 'DOC',
  'DOCKING SURVEY': 'DOCKING SURVEY',
  DOCKINGSURVEY: 'DOCKING SURVEY',
  EIAPP: 'EIAPP',
  'FISHING VESSEL SAFETY CERTIFICATE': 'FVSC',
  HSC: 'HSC',
  'HIGH SPEED CRAFT SAFETY CERTIFICATE': 'HSC',
  IAPP: 'IAPP',
  'INTERNATIONAL OIL POLLUTION PREVENTION CERTIFICATE': 'IOPPC',
  'INTERNATIONAL SEWAGE POLLUTION PREVENTION CERTIFICATE': 'ISPP',
  ISSC: 'ISSC',
  ITC: 'ITC',
  LL: 'LL',
  MLC: 'MLC',
  MODU: 'MODU',
  SMC: 'SMC',
  SPS: 'SPS',
  'SEA WORTHINESS CERTIFICATE': 'SEA WORTHINESS CERTIFICATE',
  SEAWORTHINESSCERTIFICATE: 'SEA WORTHINESS CERTIFICATE',
};

const normalize = (value) =>
  String(value || '')
    .normalize('NFKD')
    .replace(/[^\w\s]/g, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

const listFolders = (rootDir) => {
  if (!fs.existsSync(rootDir)) return [];
  return fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => !IGNORE_NAMES.has(name));
};

const deriveShortCode = (folderName) => {
  const raw = String(folderName || '').trim();
  const normalized = normalize(raw);

  // Alias map (both original + normalized keys)
  if (CERTIFICATE_TYPE_ALIASES[raw]) return CERTIFICATE_TYPE_ALIASES[raw];
  if (CERTIFICATE_TYPE_ALIASES[normalized]) return CERTIFICATE_TYPE_ALIASES[normalized];

  // If folder already looks like a code (CG, HM, IBWMC, IGPP, etc.)
  if (/^[A-Z0-9]{2,10}$/.test(normalized)) return normalized.slice(0, 10);

  // Initials from words, max 10 chars
  const words = normalized.split(' ').filter(Boolean);
  const initials = words.map((w) => w[0]).join('');
  if (initials.length >= 2) return initials.slice(0, 10);

  // Fallback
  return normalized.slice(0, 10) || 'CERT';
};

const main = async () => {
  const folderNames = new Set([...listFolders(CERTIFICATE_ROOT), ...listFolders(CHECKLIST_ROOT)]);

  const created = [];
  const skipped = [];

  for (const folderName of [...folderNames].sort((a, b) => a.localeCompare(b))) {
    const name = String(folderName).trim();
    if (!name) continue;

    const short_code = deriveShortCode(name);

    // Prefer short_code uniqueness; if collision, fall back to name uniqueness
    const existingByShort = await db.CertificateType.findOne({ where: { short_code } });
    if (existingByShort) {
      skipped.push({ folderName: name, short_code, reason: 'short_code_exists', existing: existingByShort.name });
      continue;
    }

    const existingByName = await db.CertificateType.findOne({ where: { name } });
    if (existingByName) {
      skipped.push({ folderName: name, short_code, reason: 'name_exists', existing: existingByName.short_code });
      continue;
    }

    const certType = await db.CertificateType.create({
      name,
      short_code,
      issuing_authority: 'CLASS',
      validity_years: null,
      status: 'ACTIVE',
      description: `Auto-created from folder: ${name}`,
      requires_survey: true,
    });

    created.push({ id: certType.id, name: certType.name, short_code: certType.short_code });
  }

  console.log(
    JSON.stringify(
      {
        roots: { CERTIFICATE_ROOT, CHECKLIST_ROOT },
        totals: { folders: folderNames.size, created: created.length, skipped: skipped.length },
        created,
        skipped,
      },
      null,
      2,
    ),
  );
};

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.sequelize.close().catch(() => {});
  });

