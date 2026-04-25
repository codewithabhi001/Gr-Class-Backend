/**
 * E2E script (real download → upload back → draft PDF verify):
 *
 * 1) Create a BOTTOM INSPECTION job (with mandatory documents)
 * 2) Verify docs (TO) → Approve (GM) → Assign (GM) → Authorize (TM)
 * 3) Surveyor starts survey
 * 4) Download the job-specific prefilled checklist DOCX via
 *      checklistTemplateService.downloadChecklistTemplateForJob(jobId)
 *    (this generates + caches a Document and returns a signedUrl)
 * 5) Download that DOCX bytes, upload it back to S3 as the surveyor’s
 *    signed checklist scan (simulate “filled & signed checklist upload”)
 * 6) Submit checklist with:
 *      - items[] (including per-question evidence file_url key)
 *      - signed_checklist_files[] containing the uploaded DOCX key
 * 7) Generate draft survey statement PDF synchronously and verify:
 *      - checklist evidence links exist
 *      - signed checklist scan link exists
 *
 * Run:
 *   node scripts/e2e_download_upload_signed_checklist_and_generate_draft_pdf.js
 */

import db from '../src/models/index.js';
import * as jobService from '../src/modules/jobs/job.service.js';
import * as surveyService from '../src/modules/surveys/survey.service.js';
import * as checklistService from '../src/modules/checklists/checklist.service.js';
import * as checklistTemplateService from '../src/modules/checklists/checklist_template.service.js';
import * as s3Service from '../src/services/s3.service.js';
import * as fileAccessService from '../src/services/fileAccess.service.js';
import * as certificatePdfService from '../src/services/certificate-pdf.service.js';
import { buildSurveyReportHtml } from '../src/modules/surveys/templates/survey-report.template.js';

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed: ${res.status}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function main() {
  const admin = await db.User.findOne({ where: { role: 'ADMIN', status: 'ACTIVE' } });
  const gm = await db.User.findOne({ where: { role: 'GM', status: 'ACTIVE' } });
  const tm = await db.User.findOne({ where: { role: 'TM', status: 'ACTIVE' } });
  const to = await db.User.findOne({ where: { role: 'TO', status: 'ACTIVE' } });

  const certType = await db.CertificateType.findOne({ where: { name: 'BOTTOM INSPECTION', status: 'ACTIVE' } });
  const vessel = await db.Vessel.findOne({ where: { class_status: 'ACTIVE' } });
  const surveyor = await db.User.findOne({ where: { role: 'SURVEYOR', status: 'ACTIVE' } });

  assert(admin && gm && tm && to && certType && vessel && surveyor, 'missing seed users/vessel/certType');

  // Mandatory docs for this cert type
  const requiredDocs = await db.CertificateRequiredDocument.findAll({
    where: { certificate_type_id: certType.id, is_mandatory: true },
    attributes: ['id', 'document_name'],
  });
  assert(requiredDocs.length > 0, 'No mandatory docs found for BOTTOM INSPECTION');

  console.log(dim('--- E2E Bottom Inspection: download→upload→draftPDF ---'));

  // 1) Create job request
  const job = await jobService.createJob({
    vessel_id: vessel.id,
    certificate_type_id: certType.id,
    target_port: 'Mumbai',
    target_date: '2026-12-01',
    reason: 'E2E download/upload signed checklist',
    uploaded_documents: requiredDocs.map((d) => ({
      required_document_id: d.id,
      file_url: `jobs/${Date.now()}/${d.document_name.replace(/\s+/g, '_')}.pdf`,
    })),
  }, admin.id);
  console.log('job', job.id, job.job_status);

  // 2) Verify → Approve → Assign → Authorize
  await jobService.verifyJobDocuments(job.id, { id: to.id, role: to.role });
  await jobService.approveRequest(job.id, 'ok', { id: gm.id, role: gm.role });
  await jobService.assignSurveyor(job.id, surveyor.id, { id: gm.id, role: gm.role });
  await jobService.authorizeSurvey(job.id, 'ok', { id: tm.id, role: tm.role });
  console.log('job authorized');

  // 3) Start survey
  const started = await surveyService.startSurvey({ job_id: job.id, latitude: 19.076, longitude: 72.8777 }, surveyor.id);
  console.log('survey started', started.survey_id);

  // 4) Download prefilled checklist DOCX (generates + caches Document)
  const downloads = await checklistTemplateService.downloadChecklistTemplateForJob(job.id, { id: surveyor.id }, { force: true });
  assert(Array.isArray(downloads) && downloads.length > 0, 'downloadChecklistTemplateForJob returned no documents');
  const firstDoc = downloads[0];
  assert(firstDoc?.signedUrl, 'download result missing signedUrl');
  console.log('downloaded prefilled checklist signedUrl (10min)', firstDoc.fileName);

  // 5) Download bytes and upload back as “signed checklist scan”
  const docxBuf = await fetchBuffer(firstDoc.signedUrl);
  const signedChecklistKey = `surveys/signed-checklists/${job.id}/${Date.now()}_${firstDoc.fileName}`;
  const uploadedSignedKey = await s3Service.uploadFile(
    docxBuf,
    firstDoc.fileName,
    firstDoc.contentType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '',
    signedChecklistKey
  );
  console.log('uploaded signed checklist doc ->', uploadedSignedKey);

  // 6) Submit checklist with per-question evidence + signed checklist file key
  const perQuestionEvidenceKey = `checklists/${job.id}/${Date.now()}_evidence.jpg`;
  await checklistService.submitChecklist(
    job.id,
    [
      {
        question_code: 'BS-01',
        question_text: 'Bottom inspection checklist completed?',
        answer: 'YES',
        remarks: 'E2E ok',
        file_url: perQuestionEvidenceKey,
      },
    ],
    { id: surveyor.id, role: surveyor.role, email: surveyor.email },
    [uploadedSignedKey]
  );
  console.log('checklist submitted (answers + signed_checklist_files)');

  // 7) Generate draft survey statement PDF synchronously (no fire-and-forget)
  const survey = await db.Survey.findOne({ where: { job_id: job.id } });
  assert(survey, 'survey row missing');
  await survey.update({ survey_statement: 'Draft E2E statement', survey_statement_status: 'DRAFTED' });

  const jobFull = await db.JobRequest.findByPk(job.id, {
    include: [
      { model: db.Vessel, include: [{ model: db.FlagAdministration, as: 'FlagAdministration' }] },
      { model: db.User, as: 'requester', attributes: ['name', 'email'] },
    ],
  });
  const surveyorUser = await db.User.findByPk(survey.surveyor_id, { attributes: ['name'] });
  const checklist = await db.ActivityPlanning.findAll({
    where: { job_id: job.id },
    attributes: ['question_text', 'answer', 'remarks', 'file_url'],
  });

  const resolvedSurvey = await fileAccessService.resolveEntity(survey, { id: tm.id });
  const resolvedChecklist = await fileAccessService.resolveEntity(checklist, { id: tm.id });

  const html = buildSurveyReportHtml({
    job: jobFull,
    vessel: jobFull.Vessel,
    surveyor: surveyorUser,
    survey: { ...resolvedSurvey, is_draft: true },
    checklist: resolvedChecklist,
    client: jobFull.requester,
  });

  // Simple asserts on HTML (before converting to PDF)
  assert(html.includes('Signed Checklist Scans'), 'HTML missing Signed Checklist Scans section');
  assert(html.includes('Checklist Evidence'), 'HTML missing Checklist Evidence label');

  const pdfBuffer = await certificatePdfService.htmlToPdfBuffer(certificatePdfService.wrapHtmlForPdf(html));
  const pdfKey = await s3Service.uploadFile(
    pdfBuffer,
    `survey-draft-${survey.id.substring(0, 8)}.pdf`,
    'application/pdf',
    s3Service.UPLOAD_FOLDERS.SURVEYS_PROOF
  );
  await survey.update({ survey_statement_pdf_url: pdfKey });

  console.log(green('PASS'));
  console.log('jobId', job.id);
  console.log('signedChecklistKey', uploadedSignedKey);
  console.log('draftPdfKey', pdfKey);
  console.log(dim('Draft PDF includes: checklist per-question file_url links + signed_checklist_files links (as anchors).'));
}

main()
  .then(async () => { await db.sequelize.close(); process.exit(0); })
  .catch(async (e) => { console.error(red('FAIL'), e); await db.sequelize.close(); process.exit(1); });

