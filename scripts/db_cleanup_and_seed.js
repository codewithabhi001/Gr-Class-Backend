// scripts/db_cleanup_and_seed.js

import 'dotenv/config';
import bcrypt from 'bcrypt';
import db from '../src/models/index.js';
import logger from '../src/utils/logger.js';
import { updateJobStatus } from '../src/services/lifecycle.service.js';
import { updateSurveyStatus } from '../src/services/lifecycle.service.js';

/**
 * This script performs a **hard reset** of the database while preserving
 * essential master data (templates, website CMS) and a minimal set of users.
 * After cleanup it seeds the system with a fresh client, vessels, users, jobs and surveys
 * covering the full lifecycle.
 */

// ---------------------------------------------------------------------------
// Configuration – adjust as needed
// ---------------------------------------------------------------------------
const PRESERVE_ROLES = ['ADMIN', 'GM', 'TM', 'TO']; // keep one user per role
const SURVEYOR_ROLE = 'SURVEYOR';
const ACTIVE_SURVEYOR_STATUS = 'ACTIVE';
const DEFAULT_PASSWORD = 'Password@123';

// Tables that should be fully truncated (transactional data)
const TABLES_TO_TRUNCATE = [
  // Jobs & related
  'jobs', 'job_requests', 'job_status_histories', 'job_documents', 'job_reschedules', 'job_notes',
  // Surveys & related
  'surveys', 'survey_status_histories',
  // Certificates & related
  'certificates', 'certificate_history',
  // Payments, approvals, financial ledger
  'payments', 'approvals', 'financial_ledgers',
  // Operational tables that often reference jobs
  'activity_requests', 'activity_plannings', 'gps_tracking', 'non_conformities', 'incidents', 'change_requests',
  // Communications
  'messages', 'notifications',
  // Clients & vessels (will be recreated)
  'clients', 'vessels',
  // Users (will be recreated except the preserved ones)
  'users', 'surveyor_profiles'
];

// Tables we intentionally **preserve** – they contain templates and CMS data.
const TABLES_TO_PRESERVE = [
  'certificate_templates', 'checklist_templates', 'certificate_types',
  'documents', // imported checklist/template docs
  'site_static_content', 'website_contact', 'website_video'
];

// ---------------------------------------------------------------------------
// Helper: truncate tables safely (FK checks disabled)
// ---------------------------------------------------------------------------
async function truncateTables() {
  logger.info('🔧 Starting database truncation');
  await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of TABLES_TO_TRUNCATE) {
    try {
      await db.sequelize.query(`TRUNCATE TABLE \`${table}\``);
      logger.info(`✅ Truncated ${table}`);
    } catch (err) {
      logger.warn(`⚠️ Skipped ${table}: ${err.message}`);
    }
  }
  await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  logger.info('✅ Truncation complete');
}

// ---------------------------------------------------------------------------
// Preserve minimal user set and recreate others
// ---------------------------------------------------------------------------
async function preserveAndCreateUsers() {
  const { User, SurveyorProfile } = db;

  // Generate hash for default password
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // Preserve one user per core role (ADMIN, GM, TM, TO)
  for (const role of PRESERVE_ROLES) {
    const existing = await User.findOne({ where: { role } });
    if (!existing) {
      const emailMap = {
        ADMIN: 'admin@grclass.com',
        GM: 'gm@grclass.com',
        TM: 'tm@grclass.com',
        TO: 'to@grclass.com'
      };
      await User.create({
        name: `${role} User`,
        email: emailMap[role] || `${role.toLowerCase()}@example.com`,
        password_hash: passwordHash,
        role,
        status: 'ACTIVE'
      });
      logger.info(`🧑‍💼 Created placeholder ${role}`);
    }
  }
  // Re‑create a few active SURVEYOR users
  const activeSurveyors = [
    { name: 'Surveyor One', email: 'surveyor1@example.com' },
    { name: 'Surveyor Two', email: 'surveyor2@example.com' },
    { name: 'Surveyor Three', email: 'surveyor3@example.com' }
  ];
  for (const s of activeSurveyors) {
    const user = await User.create({
      name: s.name,
      email: s.email,
      password_hash: passwordHash,
      role: SURVEYOR_ROLE,
      status: ACTIVE_SURVEYOR_STATUS
    });
    await SurveyorProfile.create({
      user_id: user.id,
      status: ACTIVE_SURVEYOR_STATUS,
      is_available: true,
      authorized_ship_types: JSON.stringify(['TANKER', 'CARGO', 'PASSENGER']),
      authorized_certificates: JSON.stringify(['CERT_TYPE_A', 'CERT_TYPE_B'])
    });
    logger.info(`🔎 Created active surveyor ${s.name}`);
  }
}

// ---------------------------------------------------------------------------
// Seed master data: client, vessels
// ---------------------------------------------------------------------------
async function seedClientAndVessels() {
  const { Client, Vessel, FlagAdministration } = db;
  const client = await Client.create({
    company_name: 'Demo Client Ltd.',
    company_code: 'DEMO',
    email: 'contact@democlient.com',
    status: 'ACTIVE'
  });
  logger.info(`🏢 Created client ${client.company_name}`);

  // Ensure a flag administration exists
  let flag = await FlagAdministration.findOne({ where: { flag_state_name: 'Default Flag' } });
  if (!flag) {
    flag = await FlagAdministration.create({
      flag_state_name: 'Default Flag',
      description: 'Placeholder flag administration for seed data'
    });
    logger.info('🚩 Created placeholder FlagAdministration');
  }

  const vesselNames = ['Vessel Alpha', 'Vessel Beta', 'Vessel Gamma'];
  const vessels = [];
  for (const name of vesselNames) {
    const vessel = await Vessel.create({
      vessel_name: name,
      imo_number: Math.floor(Math.random() * 9000000) + 1000000,
      ship_type: 'CARGO',
      class_status: 'ACTIVE',
      client_id: client.id,
      flag_administration_id: flag.id
    });
    vessels.push(vessel);
    logger.info(`🚢 Created vessel ${name}`);
  }
  return { client, vessels };
}

// ---------------------------------------------------------------------------
// Helper to fetch a user by role (first available)
// ---------------------------------------------------------------------------
async function getUserByRole(role) {
  const { User } = db;
  const user = await User.findOne({ where: { role, status: 'ACTIVE' } });
  if (!user) throw new Error(`Required user with role ${role} not found`);
  return user;
}

// ---------------------------------------------------------------------------
// Create jobs for each status (3 per status) and associated surveys where needed
// ---------------------------------------------------------------------------
async function seedJobsAndSurveys({ client, vessels }) {
  const { JobRequest, Survey, CertificateType } = db;
  const admin = await getUserByRole('ADMIN');
  const surveyors = await db.User.findAll({ where: { role: SURVEYOR_ROLE, status: ACTIVE_SURVEYOR_STATUS } });

  // Ensure at least one certificate type exists
  let certType = await CertificateType.findOne();
  if (!certType) {
    certType = await CertificateType.create({
      name: 'Demo Certificate Type',
      description: 'Placeholder for demo',
      requires_survey: true
    });
    logger.info('🗂️ Created placeholder certificate type');
  }

  const jobStatuses = [
    'CREATED', 'DOCUMENT_VERIFIED', 'APPROVED', 'ASSIGNED', 'SURVEY_AUTHORIZED',
    'IN_PROGRESS', 'SURVEY_DONE', 'REVIEWED', 'REWORK_REQUESTED',
    'FINALIZED', 'CERTIFIED'
  ];
  const surveyStatuses = [
    'NOT_STARTED', 'STARTED', 'CHECKLIST_SUBMITTED', 'PROOF_UPLOADED',
    'SUBMITTED', 'REWORK_REQUIRED', 'FINALIZED'
  ];

  for (const targetJobStatus of jobStatuses) {
    for (let i = 0; i < 3; i++) {
      const vessel = vessels[Math.floor(Math.random() * vessels.length)];
      const job = await JobRequest.create({
        vessel_id: vessel.id,
        client_id: client.id,
        certificate_type_id: certType.id,
        requested_by_user_id: admin.id,
        job_status: 'CREATED',
        is_survey_required: certType.requires_survey,
        priority: 'NORMAL',
        reason: `Demo job for status ${targetJobStatus} #${i + 1}`
      });

      // Walk the job through its lifecycle until it reaches the target status
      const jobPath = computeJobTransitionPath(targetJobStatus);
      for (const nextStatus of jobPath) {
        const internal = nextStatus === 'FINALIZED' && certType.requires_survey;
        await updateJobStatus(job.id, nextStatus, admin.id, `Seeding to ${targetJobStatus}`, { _internal: internal });
      }

      // If a survey is required, ensure a survey exists and walk it through a random status path
      if (certType.requires_survey) {
        const survey = await Survey.findOne({ where: { job_id: job.id } });
        const targetSurveyStatus = surveyStatuses[Math.floor(Math.random() * surveyStatuses.length)];
        const surveyPath = computeSurveyTransitionPath(targetSurveyStatus);
        for (const nextSurveyStatus of surveyPath) {
          await updateSurveyStatus(survey.id, nextSurveyStatus, admin.id, `Seeding survey to ${targetSurveyStatus}`);
        }
      }
    }
  }
  logger.info('🚀 Seeded jobs and surveys for all statuses');
}

// ---------------------------------------------------------------------------
// Compute minimal transition sequence from CREATED to a target job status
// ---------------------------------------------------------------------------
function computeJobTransitionPath(target) {
  const linearOrder = [
    'DOCUMENT_VERIFIED', 'APPROVED', 'ASSIGNED', 'SURVEY_AUTHORIZED',
    'IN_PROGRESS', 'SURVEY_DONE', 'REVIEWED', 'FINALIZED', 'PAYMENT_DONE', 'CERTIFIED'
  ];
  
  const path = [];
  for (const step of linearOrder) {
    if (step === 'FINALIZED' && target === 'REWORK_REQUESTED') {
      path.push('REWORK_REQUESTED');
      break;
    }
    path.push(step);
    if (step === target) break;
  }
  return path;
}

// ---------------------------------------------------------------------------
// Compute minimal transition sequence for surveys
// ---------------------------------------------------------------------------
function computeSurveyTransitionPath(target) {
  const order = [
    'STARTED', 'CHECKLIST_SUBMITTED', 'PROOF_UPLOADED', 'SUBMITTED',
    'REWORK_REQUIRED', 'FINALIZED'
  ];
  const path = [];
  for (const step of order) {
    path.push(step);
    if (step === target) break;
  }
  return path;
}

// ---------------------------------------------------------------------------
// Main execution flow
// ---------------------------------------------------------------------------
async function main() {
  try {
    await truncateTables();
    await preserveAndCreateUsers();
    const { client, vessels } = await seedClientAndVessels();
    await seedJobsAndSurveys({ client, vessels });
    logger.info('✅ Database cleanup & seeding completed successfully');
    process.exit(0);
  } catch (err) {
    logger.error('❌ Script failed', err);
    process.exit(1);
  }
}

main();
