/**
 * Seed ACTIVE ChecklistTemplate for certificate type "BOTTOM INSPECTION"
 * using repo documents from:
 *   CHECKLISTS/BOTTOM INSPECTION/CHECK LIST/
 *
 * It uploads (or returns mock keys if AWS creds missing) and stores them in
 * ChecklistTemplate.template_files so Surveyor can download them from the
 * checklist screen (`GET /api/v1/checklists/jobs/:jobId`).
 *
 * Run:
 *   node scripts/seed_bottom_inspection_checklist_template.js
 */

import fs from 'fs/promises';
import path from 'path';
import mime from 'mime-types';
import db from '../src/models/index.js';
import * as s3Service from '../src/services/s3.service.js';

const SOURCE_DIR = path.resolve('CHECKLISTS/BOTTOM INSPECTION/CHECK LIST');
const FILES = [
  'BS-01.docx',
  'BS-02.docx',
  'BS-03.docx',
  'GR CLASS Form No. UWILD-01.docx',
];

async function main() {
  const certType = await db.CertificateType.findOne({ where: { name: 'BOTTOM INSPECTION', status: 'ACTIVE' } });
  if (!certType) throw new Error('CertificateType "BOTTOM INSPECTION" not found or not ACTIVE');

  const existingActive = await db.ChecklistTemplate.findOne({
    where: { certificate_type_id: certType.id, status: 'ACTIVE' },
    attributes: ['id', 'name', 'code'],
  });
  if (existingActive) {
    console.log('Already has ACTIVE template:', existingActive.toJSON());
    return;
  }

  // Upload files
  const uploadedKeys = [];
  for (const fileName of FILES) {
    const p = path.join(SOURCE_DIR, fileName);
    const buf = await fs.readFile(p);
    const contentType = mime.lookup(fileName) || 'application/octet-stream';

    // Store under a stable folder for checklist template reference docs.
    const key = await s3Service.uploadFile(buf, fileName, contentType, 'checklist-templates/bottom-inspection');
    uploadedKeys.push(key);
    console.log('uploaded', fileName, '->', key);
  }

  // Create ACTIVE template with minimal questions (can be expanded later)
  const admin = await db.User.findOne({ where: { role: 'ADMIN', status: 'ACTIVE' } });
  const createdBy = admin?.id || null;

  const tpl = await db.ChecklistTemplate.create({
    name: 'BOTTOM INSPECTION (BS) — Checklist',
    code: `BS_TEMPLATE_${Date.now()}`,
    description: 'Seeded from repo CHECKLISTS/BOTTOM INSPECTION/CHECK LIST/',
    certificate_type_id: certType.id,
    status: 'ACTIVE',
    template_files: uploadedKeys,
    sections: [
      {
        title: 'Bottom Inspection',
        items: [
          { code: 'BS-01', text: 'Bottom inspection checklist (see attached BS-01/02/03 forms).', type: 'YES_NO_NA' },
        ],
      },
    ],
    metadata: { seeded_from_repo: true, source_dir: 'CHECKLISTS/BOTTOM INSPECTION/CHECK LIST' },
    created_by: createdBy,
    updated_by: createdBy,
  });

  console.log('Created ACTIVE ChecklistTemplate:', tpl.id);
}

main()
  .then(async () => { await db.sequelize.close(); process.exit(0); })
  .catch(async (e) => { console.error('FAIL', e); await db.sequelize.close(); process.exit(1); });

