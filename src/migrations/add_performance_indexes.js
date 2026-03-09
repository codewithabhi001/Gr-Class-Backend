/**
 * Migration: Add performance indexes to all major tables
 * 
 * This addresses the ZERO-index problem across the entire database.
 * Every foreign key and frequently filtered column gets a proper index.
 * 
 * Safe to run multiple times — each index is checked before creation.
 * 
 * Usage:
 * node src/migrations/add_performance_indexes.js
 */

import db from '../models/index.js';

const INDEXES = [
    // ── Users ──
    { table: 'users', name: 'idx_users_email', columns: 'email' },
    { table: 'users', name: 'idx_users_role', columns: 'role' },
    { table: 'users', name: 'idx_users_client_id', columns: 'client_id' },
    { table: 'users', name: 'idx_users_status', columns: 'status' },

    // ── Job Requests (heaviest table) ──
    { table: 'job_requests', name: 'idx_jobreq_vessel_id', columns: 'vessel_id' },
    { table: 'job_requests', name: 'idx_jobreq_job_status', columns: 'job_status' },
    { table: 'job_requests', name: 'idx_jobreq_assigned_surveyor', columns: 'assigned_surveyor_id' },
    { table: 'job_requests', name: 'idx_jobreq_cert_type_id', columns: 'certificate_type_id' },
    { table: 'job_requests', name: 'idx_jobreq_requested_by', columns: 'requested_by_user_id' },
    { table: 'job_requests', name: 'idx_jobreq_created_at', columns: 'created_at' },
    { table: 'job_requests', name: 'idx_jobreq_updated_at', columns: 'updated_at' },

    // ── Surveys ──
    { table: 'surveys', name: 'idx_surveys_surveyor_id', columns: 'surveyor_id' },
    { table: 'surveys', name: 'idx_surveys_survey_status', columns: 'survey_status' },

    // ── Job Status Histories ──
    { table: 'job_status_histories', name: 'idx_jobhist_job_id', columns: 'job_id' },
    { table: 'job_status_histories', name: 'idx_jobhist_created_at', columns: 'created_at' },

    // ── Survey Status Histories ──
    { table: 'survey_status_histories', name: 'idx_survhist_survey_id', columns: 'survey_id' },

    // ── Notifications ──
    { table: 'notifications', name: 'idx_notif_user_id', columns: 'user_id' },
    { table: 'notifications', name: 'idx_notif_created_at', columns: 'created_at' },
    { table: 'notifications', name: 'idx_notif_user_read', columns: 'user_id, is_read' },

    // ── GPS Tracking ──
    { table: 'gps_tracking', name: 'idx_gps_job_id', columns: 'job_id' },
    { table: 'gps_tracking', name: 'idx_gps_surveyor_id', columns: 'surveyor_id' },

    // ── Certificates ──
    { table: 'certificates', name: 'idx_cert_vessel_id', columns: 'vessel_id' },
    { table: 'certificates', name: 'idx_cert_cert_type_id', columns: 'certificate_type_id' },
    { table: 'certificates', name: 'idx_cert_status', columns: 'status' },
    { table: 'certificates', name: 'idx_cert_expiry_date', columns: 'expiry_date' },
    { table: 'certificates', name: 'idx_cert_cert_number', columns: 'certificate_number' },

    // ── Payments ──
    { table: 'payments', name: 'idx_pay_job_id', columns: 'job_id' },
    { table: 'payments', name: 'idx_pay_status', columns: 'payment_status' },

    // ── Activity Plannings ──
    { table: 'activity_plannings', name: 'idx_actplan_job_id', columns: 'job_id' },

    // ── Non-Conformities ──
    { table: 'non_conformities', name: 'idx_nc_job_id', columns: 'job_id' },
    { table: 'non_conformities', name: 'idx_nc_status', columns: 'status' },
    { table: 'non_conformities', name: 'idx_nc_job_status', columns: 'job_id, status' },

    // ── Job Documents ──
    { table: 'job_documents', name: 'idx_jobdoc_job_id', columns: 'job_id' },

    // ── Vessels ──
    { table: 'vessels', name: 'idx_vessels_client_id', columns: 'client_id' },

    // ── Surveyor Profiles ──
    { table: 'surveyor_profiles', name: 'idx_survprof_user_id', columns: 'user_id' },
    { table: 'surveyor_profiles', name: 'idx_survprof_status', columns: 'status' },

    // ── Certificate Required Documents ──
    { table: 'certificate_required_documents', name: 'idx_certreqdoc_cert_type', columns: 'certificate_type_id' },

    // ── Notification Preferences ──
    { table: 'notification_preferences', name: 'idx_notifpref_user_id', columns: 'user_id' },

    // ── Audit Logs ──
    { table: 'audit_logs', name: 'idx_auditlog_entity', columns: 'entity_name, entity_id' },
    { table: 'audit_logs', name: 'idx_auditlog_user_id', columns: 'user_id' },

    // ── Vessel Documents ──
    { table: 'vessel_documents', name: 'idx_vesdoc_vessel_id', columns: 'vessel_id' },

    // ── Certificate Histories ──
    { table: 'certificate_histories', name: 'idx_certhist_cert_id', columns: 'certificate_id' },

    // ── Job Reschedules ──
    { table: 'job_reschedules', name: 'idx_jobresch_job_id', columns: 'job_id' },

    // ── Support Tickets ──
    { table: 'support_tickets', name: 'idx_ticket_user_id', columns: 'user_id' },
];

async function migrate() {
    const startTime = Date.now();
    let created = 0;
    let skipped = 0;
    let failed = 0;

    try {
        console.log('🔄 Starting migration: Add performance indexes\n');
        console.log(`   Total indexes to process: ${INDEXES.length}\n`);

        await db.sequelize.authenticate();
        console.log('✅ Database connection established\n');

        for (const idx of INDEXES) {
            try {
                // Check if index already exists
                const [existing] = await db.sequelize.query(`
                    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS 
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = '${idx.table}' 
                    AND INDEX_NAME = '${idx.name}'
                    LIMIT 1
                `);

                if (existing.length > 0) {
                    console.log(`   ⏭️  ${idx.name} — already exists`);
                    skipped++;
                    continue;
                }

                // Check if table exists
                const [tableExists] = await db.sequelize.query(`
                    SELECT 1 FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = '${idx.table}'
                    LIMIT 1
                `);

                if (tableExists.length === 0) {
                    console.log(`   ⚠️  ${idx.name} — table '${idx.table}' does not exist, skipping`);
                    skipped++;
                    continue;
                }

                await db.sequelize.query(
                    `CREATE INDEX ${idx.name} ON ${idx.table} (${idx.columns})`
                );
                console.log(`   ✅ ${idx.name} ON ${idx.table}(${idx.columns})`);
                created++;
            } catch (err) {
                // Duplicate key name or column doesn't exist
                if (err.original?.code === 'ER_DUP_KEYNAME') {
                    console.log(`   ⏭️  ${idx.name} — already exists (dup)`);
                    skipped++;
                } else {
                    console.log(`   ❌ ${idx.name} — ${err.message}`);
                    failed++;
                }
            }
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log('\n' + '='.repeat(50));
        console.log(`📊 Migration Summary:`);
        console.log(`   ✅ Created: ${created}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   ❌ Failed:  ${failed}`);
        console.log(`   ⏱️  Duration: ${duration}s`);
        console.log('='.repeat(50) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

migrate();
