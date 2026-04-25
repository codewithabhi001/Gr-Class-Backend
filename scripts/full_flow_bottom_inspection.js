/**
 * Full flow (DB + HTTP-ish via services) for certificate type: BOTTOM INSPECTION
 *
 * Creates a job request with mandatory documents, assigns + authorizes survey,
 * starts the survey, submits checklist + signed scans, uploads proof (via fileKey),
 * and submits the final survey report.
 *
 * Run:
 *   node scripts/full_flow_bottom_inspection.js
 */
import jwt from 'jsonwebtoken';
import db from '../src/models/index.js';
import env from '../src/config/env.js';

import * as jobService from '../src/modules/jobs/job.service.js';
import * as surveyService from '../src/modules/surveys/survey.service.js';
import * as checklistService from '../src/modules/checklists/checklist.service.js';
import * as lifecycleService from '../src/services/lifecycle.service.js';

async function main() {
  const admin = await db.User.findOne({ where: { role: 'ADMIN', status: 'ACTIVE' } });
  const gm = await db.User.findOne({ where: { role: 'GM', status: 'ACTIVE' } });
  const tm = await db.User.findOne({ where: { role: 'TM', status: 'ACTIVE' } });
  const to = await db.User.findOne({ where: { role: 'TO', status: 'ACTIVE' } });
  const certType = await db.CertificateType.findOne({ where: { name: 'BOTTOM INSPECTION', status: 'ACTIVE' } });
  // Pick an available surveyor and ensure they are authorized for this certificate type.
  const profile = await db.SurveyorProfile.findOne({
    where: { status: 'ACTIVE', is_available: true },
    include: [{ model: db.User, required: true, where: { role: 'SURVEYOR', status: 'ACTIVE' }, attributes: ['id', 'email', 'name', 'role'] }],
  });
  const surveyor = profile?.User || await db.User.findOne({ where: { role: 'SURVEYOR', status: 'ACTIVE' } });
  const vessel = await db.Vessel.findOne({ where: { class_status: 'ACTIVE' } });

  if (!admin || !gm || !tm || !to || !surveyor || !vessel || !certType) {
    throw new Error('Missing seed data: admin/gm/tm/to/surveyor/vessel/certType(BOTTOM INSPECTION)');
  }

  if (profile) {
    let certs = profile.authorized_certificates;
    if (typeof certs === 'string') { try { certs = JSON.parse(certs); } catch { certs = []; } }
    if (!Array.isArray(certs)) certs = [];
    if (!certs.includes(certType.name)) {
      certs.push(certType.name);
      await profile.update({ authorized_certificates: certs });
      console.log('patched surveyor authorization', surveyor.email, '+=', certType.name);
    }
  }

  // Mandatory docs for this cert type (seeded from Excel)
  const requiredDocs = await db.CertificateRequiredDocument.findAll({
    where: { certificate_type_id: certType.id, is_mandatory: true },
    attributes: ['id', 'document_name'],
  });
  if (requiredDocs.length === 0) {
    throw new Error('No mandatory docs found for BOTTOM INSPECTION. Seed required docs first.');
  }

  console.log('--- BOTTOM INSPECTION FLOW ---');
  console.log('certType', certType.id, certType.name, 'docs', requiredDocs.map(d => d.document_name));

  // 1) Create job with uploaded_documents
  const job = await jobService.createJob({
    vessel_id: vessel.id,
    certificate_type_id: certType.id,
    target_port: 'Mumbai',
    target_date: '2026-12-01',
    reason: 'Bottom inspection flow test',
    uploaded_documents: requiredDocs.map(d => ({
      required_document_id: d.id,
      // pre-signed upload flow: FE would upload to S3 then send file key here.
      file_url: `jobs/${Date.now()}/${d.document_name.replace(/\\s+/g, '_')}.pdf`,
    })),
  }, admin.id);
  console.log('job created', job.id, 'status', job.job_status);

  // 2) Verify documents (TO) → Approve (GM) → Assign (GM) → Authorize (TM)
  const verified = await jobService.verifyJobDocuments(job.id, { id: to.id, role: to.role });
  console.log('documents verified', verified.job_status);

  const approved = await jobService.approveRequest(job.id, 'Auto-approve for flow test', { id: gm.id, role: gm.role });
  console.log('approved', approved.job_status);

  const assigned = await jobService.assignSurveyor(job.id, surveyor.id, { id: gm.id, role: gm.role });
  console.log('assigned', assigned.job_status, 'surveyor', surveyor.id);

  const authorized = await jobService.authorizeSurvey(job.id, 'Auto-authorize', { id: tm.id, role: tm.role });
  console.log('authorized', authorized.job_status);

  // 3) Surveyor start survey
  const started = await surveyService.startSurvey({ job_id: job.id, latitude: 19.076, longitude: 72.8777 }, surveyor.id);
  console.log('survey started', started.survey_id);

  // 4) Submit checklist + attach signed checklist scan key(s)
  const signedScanKey = `surveys/signed-checklists/${job.id}/${Date.now()}_bottom_inspection_signed.pdf`;
  const checklistPut = await checklistService.submitChecklist(job.id, [
    { question_code: 'BS-01', question_text: 'Bottom inspection completed?', answer: 'YES', remarks: 'OK', file_url: `checklists/${job.id}/${Date.now()}_photo.jpg` },
  ], { id: surveyor.id, role: surveyor.role, email: surveyor.email }, [signedScanKey]);
  console.log('checklist saved', 'items', checklistPut.items.length, 'signed_scans', checklistPut.signed_checklist_files.length);

  // 5) Upload proof (using fileKey path, no multipart)
  const proof = await surveyService.uploadProof(job.id, null, { fileKey: `surveys/proof/${job.id}/${Date.now()}_proof.pdf` }, surveyor.id);
  console.log('proof uploaded', proof);

  // 6) Submit final survey report (requires signed_checklist_files already present)
  const submitted = await surveyService.submitSurveyReport({
    job_id: job.id,
    submit_latitude: 19.0833,
    submit_longitude: 72.88,
    survey_statement: 'Bottom inspection completed successfully.',
    photoKey: `surveys/photo/${job.id}/${Date.now()}_attendance.jpg`,
    signatureKey: `surveys/sign/${job.id}/${Date.now()}_signature.png`,
  }, null, surveyor.id);
  console.log('survey submitted', submitted.id, 'status', submitted.survey_status);

  // Quick sanity: job should be SURVEY_DONE after submission
  const jobReload = await db.JobRequest.findByPk(job.id);
  console.log('job status now', jobReload.job_status);

  console.log('DONE ✅ jobId=', job.id);
}

main()
  .then(async () => {
    // give fire-and-forget notification queries a moment before closing DB
    await new Promise(r => setTimeout(r, 750));
    await db.sequelize.close();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('FAIL', e);
    await new Promise(r => setTimeout(r, 750));
    await db.sequelize.close();
    process.exit(1);
  });

