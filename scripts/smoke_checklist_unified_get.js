/**
 * Smoke test: GET /api/v1/checklists/jobs/:jobId returns a unified payload:
 *   - items (answers + per-question URLs)
 *   - signed_checklist_files (resolved URLs)
 *   - template_files (resolved URLs from active checklist template)
 *   - template metadata {id,name,code}
 *
 * This script sets up a minimal DB state (template + job + survey + checklist rows),
 * then hits the HTTP endpoint with a minted SURVEYOR JWT.
 *
 * Run:
 *   node scripts/smoke_checklist_unified_get.js
 */

import jwt from 'jsonwebtoken';
import db from '../src/models/index.js';
import env from '../src/config/env.js';

const BASE_URL = `http://localhost:${env.port || 5000}`;

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

function assert(cond, msg) {
    if (!cond) throw new Error(msg);
}

async function api(token, path) {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json().catch(() => null);
    return { status: res.status, body };
}

(async () => {
    const stamp = Date.now();
    console.log(dim(`base=${BASE_URL}`));

    // ── Find an active surveyor and certificate type ────────────────────────
    const surveyor = await db.User.findOne({ where: { role: 'SURVEYOR', status: 'ACTIVE' } });
    assert(surveyor, 'No ACTIVE SURVEYOR user found');

    const certType = await db.CertificateType.findOne({ where: { status: 'ACTIVE' } });
    assert(certType, 'No ACTIVE CertificateType found');

    const vessel = await db.Vessel.findOne({ where: { class_status: 'ACTIVE' } });
    assert(vessel, 'No ACTIVE Vessel found');

    const token = jwt.sign(
        { id: surveyor.id, role: surveyor.role, email: surveyor.email, type: 'access' },
        env.jwt.accessSecret,
        { expiresIn: env.jwt.accessExpiresIn }
    );

    // ── Create minimal rows ────────────────────────────────────────────────
    const created = { jobId: null, surveyId: null, tplId: null };
    try {
        // Active checklist template with 1 reference doc key
        const tpl = await db.ChecklistTemplate.create({
            name: `Smoke Template ${stamp}`,
            code: `SMOKE_${stamp}`,
            description: 'smoke test',
            certificate_type_id: certType.id,
            sections: [{ title: 'A', items: [{ code: 'Q1', text: 'Q1?', type: 'YES_NO_NA' }] }],
            template_files: [`checklist-templates/smoke-${stamp}.docx`],
            status: 'ACTIVE',
            created_by: surveyor.id,
            updated_by: surveyor.id,
        });
        created.tplId = tpl.id;

        // Job required for GET /checklists/jobs/:jobId
        const job = await db.JobRequest.create({
            vessel_id: vessel.id,
            requested_by_user_id: surveyor.id,
            certificate_type_id: certType.id,
            job_status: 'IN_PROGRESS',
            assigned_surveyor_id: surveyor.id,
            is_survey_required: true,
            target_port: 'Mumbai',
            target_date: '2026-12-01',
            reason: 'Smoke test',
        });
        created.jobId = job.id;

        // Survey row (with signed checklist scan key)
        const survey = await db.Survey.create({
            job_id: job.id,
            surveyor_id: surveyor.id,
            survey_status: 'CHECKLIST_SUBMITTED',
            signed_checklist_files: [`surveys/signed-checklists/${job.id}/${stamp}_signed.pdf`],
        });
        created.surveyId = survey.id;

        // One checklist answer row
        await db.ActivityPlanning.create({
            job_id: job.id,
            question_code: 'Q1',
            question_text: 'Q1?',
            answer: 'YES',
            remarks: 'ok',
            file_url: `checklists/${job.id}/${stamp}_photo.jpg`,
        });

        // ── Call endpoint ──────────────────────────────────────────────────
        const r = await api(token, `/api/v1/checklists/jobs/${job.id}`);
        assert(r.status === 200, `expected 200, got ${r.status} body=${JSON.stringify(r.body)}`);

        const data = r.body?.data;
        assert(data, 'missing body.data');

        assert(Array.isArray(data.items), 'data.items must be array');
        assert(Array.isArray(data.signed_checklist_files), 'data.signed_checklist_files must be array');
        assert(Array.isArray(data.template_files), 'data.template_files must be array');

        // Template meta should exist (ACTIVE template for certType)
        assert(data.template && data.template.id && data.template.code, 'data.template metadata missing');

        // URLs are resolved (should be https links, not raw keys)
        if (data.template_files.length > 0) {
            assert(/^https?:\/\//.test(data.template_files[0]), 'template_files entries should be resolved URLs');
        }
        if (data.signed_checklist_files.length > 0) {
            assert(/^https?:\/\//.test(data.signed_checklist_files[0]), 'signed_checklist_files entries should be resolved URLs');
        }
        if (data.items.length > 0 && data.items[0]?.file_url) {
            assert(/^https?:\/\//.test(data.items[0].file_url), 'items[].file_url should be resolved URL');
        }

        console.log(green('PASS'), dim(`jobId=${job.id} templateId=${data.template.id}`));
        process.exit(0);
    } catch (e) {
        console.error(red('FAIL'), e);
        process.exitCode = 1;
    } finally {
        // best-effort cleanup
        try {
            if (created.jobId) await db.ActivityPlanning.destroy({ where: { job_id: created.jobId } });
        } catch { }
        try {
            if (created.surveyId) await db.Survey.destroy({ where: { id: created.surveyId } });
        } catch { }
        try {
            if (created.jobId) await db.JobRequest.destroy({ where: { id: created.jobId } });
        } catch { }
        try {
            if (created.tplId) await db.ChecklistTemplate.destroy({ where: { id: created.tplId } });
        } catch { }
        try { await db.sequelize.close(); } catch { }
    }
})();

