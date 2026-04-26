/**
 * Surveyor flow consistency matrix (BOTTOM INSPECTION).
 *
 * Creates MULTIPLE jobs and advances each to a target status, then verifies the
 * Surveyor-facing flow APIs behave consistently at each stage.
 *
 * Target statuses covered:
 * - CREATED
 * - DOCUMENT_VERIFIED
 * - APPROVED
 * - ASSIGNED
 * - SURVEY_AUTHORIZED
 * - IN_PROGRESS (after /surveys/start)
 * - SURVEY_DONE (after full survey submission)
 *
 * Run:
 *   node scripts/surveyor_flow_status_matrix_bottom_inspection.js
 */

import jwt from 'jsonwebtoken';
import db from '../src/models/index.js';
import env from '../src/config/env.js';

import * as jobService from '../src/modules/jobs/job.service.js';
import * as surveyService from '../src/modules/surveys/survey.service.js';
import * as checklistService from '../src/modules/checklists/checklist.service.js';

const BASE_URL = `http://localhost:${env.port || 5000}`;

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function api(token, method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

async function ensureSurveyorAuthorizedForCertType(profile, certTypeName) {
  if (!profile) return;
  let certs = profile.authorized_certificates;
  if (typeof certs === 'string') { try { certs = JSON.parse(certs); } catch { certs = []; } }
  if (!Array.isArray(certs)) certs = [];
  if (!certs.includes(certTypeName)) {
    certs.push(certTypeName);
    await profile.update({ authorized_certificates: certs });
  }
}

async function createBaseJob(adminId, vesselId, certTypeId, requiredDocs, reasonSuffix) {
  return jobService.createJob({
    vessel_id: vesselId,
    certificate_type_id: certTypeId,
    target_port: 'Mumbai',
    target_date: '2026-12-01',
    reason: `Matrix flow test - ${reasonSuffix}`,
    uploaded_documents: requiredDocs.map((d) => ({
      required_document_id: d.id,
      file_url: `jobs/${Date.now()}/${String(d.document_name || 'doc').replace(/\s+/g, '_')}.pdf`,
    })),
  }, adminId);
}

async function progressTo(job, target, actors) {
  const { to, gm, tm, surveyor } = actors;

  if (target === 'CREATED') return job;

  job = await jobService.verifyJobDocuments(job.id, { id: to.id, role: to.role });
  if (target === 'DOCUMENT_VERIFIED') return job;

  job = await jobService.approveRequest(job.id, 'Matrix approve', { id: gm.id, role: gm.role });
  if (target === 'APPROVED') return job;

  job = await jobService.assignSurveyor(job.id, surveyor.id, { id: gm.id, role: gm.role });
  if (target === 'ASSIGNED') return job;

  job = await jobService.authorizeSurvey(job.id, 'Matrix authorize', { id: tm.id, role: tm.role });
  if (target === 'SURVEY_AUTHORIZED') return job;

  // Survey start transitions to IN_PROGRESS
  await surveyService.startSurvey({ job_id: job.id, latitude: 19.076, longitude: 72.8777 }, surveyor.id);
  job = await db.JobRequest.findByPk(job.id);
  if (target === 'IN_PROGRESS') return job;

  // Checklist: answers first
  await checklistService.submitChecklist(
    job.id,
    [{ question_code: 'BS-01', question_text: 'Bottom inspection checklist completed?', answer: 'YES', remarks: 'Matrix ok', file_url: '' }],
    { id: surveyor.id, role: surveyor.role, email: surveyor.email },
    null
  );

  // Signed checklist scan keys (separate endpoint in HTTP; here we use service directly)
  const signedKey = `surveys/signed-checklists/${job.id}/${Date.now()}_signed.pdf`;
  await checklistService.updateSignedChecklistFiles(job.id, [signedKey], { id: surveyor.id, role: surveyor.role, email: surveyor.email });

  // Proof
  await surveyService.uploadProof(job.id, null, { fileKey: `surveys/proof/${job.id}/${Date.now()}_proof.pdf` }, surveyor.id);

  // Submit final survey report
  await surveyService.submitSurveyReport({
    job_id: job.id,
    submit_latitude: 19.0833,
    submit_longitude: 72.88,
    survey_statement: 'Matrix final submit',
    photoKey: `surveys/photo/${job.id}/${Date.now()}_attendance.jpg`,
    signatureKey: `surveys/sign/${job.id}/${Date.now()}_signature.png`,
  }, null, surveyor.id);

  job = await db.JobRequest.findByPk(job.id);
  if (target === 'SURVEY_DONE') return job;

  throw new Error(`Unknown target ${target}`);
}

async function verifySurveyorApis(jobId, token, stageLabel) {
  // 1) Checklist GET should always work for surveyor (assigned job) once survey exists; before that may 400/404 based on backend guards.
  const checklistGet = await api(token, 'GET', `/api/v1/checklists/jobs/${jobId}`);
  if (checklistGet.status === 200) {
    const d = checklistGet.body?.data;
    assert(d && Array.isArray(d.items), `${stageLabel}: checklist GET missing data.items`);
    assert(Array.isArray(d.signed_checklist_files), `${stageLabel}: checklist GET missing signed_checklist_files`);
    assert(Array.isArray(d.template_files), `${stageLabel}: checklist GET missing template_files`);
  }

  // 2) Survey details/timeline should be safe once survey exists
  const surveyDetails = await api(token, 'GET', `/api/v1/surveys/jobs/${jobId}`);
  if (surveyDetails.status === 200) {
    assert(surveyDetails.body?.data, `${stageLabel}: survey details missing data`);
  }
  const timeline = await api(token, 'GET', `/api/v1/surveys/jobs/${jobId}/timeline`);
  if (timeline.status === 200) {
    assert(timeline.body?.data, `${stageLabel}: timeline missing data`);
  }

  return { checklistGetStatus: checklistGet.status, surveyDetailsStatus: surveyDetails.status, timelineStatus: timeline.status };
}

async function main() {
  console.log(dim(`base=${BASE_URL}`));

  const admin = await db.User.findOne({ where: { role: 'ADMIN', status: 'ACTIVE' } });
  const gm = await db.User.findOne({ where: { role: 'GM', status: 'ACTIVE' } });
  const tm = await db.User.findOne({ where: { role: 'TM', status: 'ACTIVE' } });
  const to = await db.User.findOne({ where: { role: 'TO', status: 'ACTIVE' } });

  const certType = await db.CertificateType.findOne({ where: { name: 'BOTTOM INSPECTION', status: 'ACTIVE' } });
  const vessel = await db.Vessel.findOne({ where: { class_status: 'ACTIVE' } });

  const profile = await db.SurveyorProfile.findOne({
    where: { status: 'ACTIVE', is_available: true },
    include: [{ model: db.User, required: true, where: { role: 'SURVEYOR', status: 'ACTIVE' }, attributes: ['id', 'email', 'name', 'role'] }],
  });
  const surveyor = profile?.User || await db.User.findOne({ where: { role: 'SURVEYOR', status: 'ACTIVE' } });

  assert(admin && gm && tm && to && certType && vessel && surveyor, 'Missing seed users/vessel/certType/surveyor');

  if (profile) await ensureSurveyorAuthorizedForCertType(profile, certType.name);

  const requiredDocs = await db.CertificateRequiredDocument.findAll({
    where: { certificate_type_id: certType.id, is_mandatory: true },
    attributes: ['id', 'document_name'],
  });
  assert(requiredDocs.length > 0, 'No mandatory docs found for BOTTOM INSPECTION (seed from Excel first)');

  const token = jwt.sign(
    { id: surveyor.id, role: surveyor.role, email: surveyor.email, type: 'access' },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn }
  );

  const actors = { to, gm, tm, surveyor };

  const targets = [
    'CREATED',
    'DOCUMENT_VERIFIED',
    'APPROVED',
    'ASSIGNED',
    'SURVEY_AUTHORIZED',
    'IN_PROGRESS',
    'SURVEY_DONE',
  ];

  const createdJobs = [];

  console.log(dim(`creating ${targets.length} jobs...`));
  for (const t of targets) {
    const job = await createBaseJob(admin.id, vessel.id, certType.id, requiredDocs, t);
    createdJobs.push({ id: job.id, target: t });
  }

  console.log(dim('progressing jobs to targets + verifying surveyor APIs...'));
  for (const j of createdJobs) {
    try {
      const base = await db.JobRequest.findByPk(j.id);
      const progressed = await progressTo(base, j.target, actors);
      const latest = await db.JobRequest.findByPk(j.id);
      console.log(green('OK'), j.target, 'job', j.id, 'status', latest.job_status);

      // Verify surveyor API behavior for stages where surveyor will interact
      if (['SURVEY_AUTHORIZED', 'IN_PROGRESS', 'SURVEY_DONE'].includes(j.target)) {
        const v = await verifySurveyorApis(j.id, token, j.target);
        console.log(dim(`  surveyor checks: checklistGET=${v.checklistGetStatus} survey=${v.surveyDetailsStatus} timeline=${v.timelineStatus}`));
      }
    } catch (e) {
      console.error(red('FAIL'), j.target, j.id, e?.message || e);
      throw e;
    }
  }

  console.log(green('PASS'), 'matrix complete');
  console.log(dim('jobIds:'), createdJobs.map(j => `${j.target}=${j.id}`).join('  '));
}

main()
  .then(async () => {
    await new Promise(r => setTimeout(r, 750));
    await db.sequelize.close();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(red('RUN FAILED'), e);
    await new Promise(r => setTimeout(r, 750));
    await db.sequelize.close();
    process.exit(1);
  });

