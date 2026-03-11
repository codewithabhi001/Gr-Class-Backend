'use strict';

const INDEXES = [
    { table: 'users', name: 'idx_users_email', columns: ['email'] },
    { table: 'users', name: 'idx_users_role', columns: ['role'] },
    { table: 'users', name: 'idx_users_client_id', columns: ['client_id'] },
    { table: 'users', name: 'idx_users_status', columns: ['status'] },

    { table: 'job_requests', name: 'idx_jobreq_vessel_id', columns: ['vessel_id'] },
    { table: 'job_requests', name: 'idx_jobreq_job_status', columns: ['job_status'] },
    { table: 'job_requests', name: 'idx_jobreq_assigned_surveyor', columns: ['assigned_surveyor_id'] },
    { table: 'job_requests', name: 'idx_jobreq_cert_type_id', columns: ['certificate_type_id'] },
    { table: 'job_requests', name: 'idx_jobreq_requested_by', columns: ['requested_by_user_id'] },
    { table: 'job_requests', name: 'idx_jobreq_created_at', columns: ['created_at'] },
    { table: 'job_requests', name: 'idx_jobreq_updated_at', columns: ['updated_at'] },

    { table: 'surveys', name: 'idx_surveys_surveyor_id', columns: ['surveyor_id'] },
    { table: 'surveys', name: 'idx_surveys_survey_status', columns: ['survey_status'] },

    { table: 'job_status_histories', name: 'idx_jobhist_job_id', columns: ['job_id'] },
    { table: 'job_status_histories', name: 'idx_jobhist_created_at', columns: ['created_at'] },

    { table: 'survey_status_histories', name: 'idx_survhist_survey_id', columns: ['survey_id'] },

    { table: 'notifications', name: 'idx_notif_user_id', columns: ['user_id'] },
    { table: 'notifications', name: 'idx_notif_created_at', columns: ['created_at'] },
    { table: 'notifications', name: 'idx_notif_user_read', columns: ['user_id', 'is_read'] },

    { table: 'gps_tracking', name: 'idx_gps_job_id', columns: ['job_id'] },
    { table: 'gps_tracking', name: 'idx_gps_surveyor_id', columns: ['surveyor_id'] },

    { table: 'certificates', name: 'idx_cert_vessel_id', columns: ['vessel_id'] },
    { table: 'certificates', name: 'idx_cert_cert_type_id', columns: ['certificate_type_id'] },
    { table: 'certificates', name: 'idx_cert_status', columns: ['status'] },
    { table: 'certificates', name: 'idx_cert_expiry_date', columns: ['expiry_date'] },
    { table: 'certificates', name: 'idx_cert_cert_number', columns: ['certificate_number'] },

    { table: 'payments', name: 'idx_pay_job_id', columns: ['job_id'] },
    { table: 'payments', name: 'idx_pay_status', columns: ['payment_status'] },

    { table: 'activity_plannings', name: 'idx_actplan_job_id', columns: ['job_id'] },

    { table: 'non_conformities', name: 'idx_nc_job_id', columns: ['job_id'] },
    { table: 'non_conformities', name: 'idx_nc_status', columns: ['status'] },
    { table: 'non_conformities', name: 'idx_nc_job_status', columns: ['job_id', 'status'] },

    { table: 'job_documents', name: 'idx_jobdoc_job_id', columns: ['job_id'] },

    { table: 'vessels', name: 'idx_vessels_client_id', columns: ['client_id'] },

    { table: 'surveyor_profiles', name: 'idx_survprof_user_id', columns: ['user_id'] },
    { table: 'surveyor_profiles', name: 'idx_survprof_status', columns: ['status'] },

    { table: 'certificate_required_documents', name: 'idx_certreqdoc_cert_type', columns: ['certificate_type_id'] },

    { table: 'notification_preferences', name: 'idx_notifpref_user_id', columns: ['user_id'] },

    { table: 'audit_logs', name: 'idx_auditlog_entity', columns: ['entity_name', 'entity_id'] },
    { table: 'audit_logs', name: 'idx_auditlog_user_id', columns: ['user_id'] },

    { table: 'vessel_documents', name: 'idx_vesdoc_vessel_id', columns: ['vessel_id'] },

    { table: 'certificate_histories', name: 'idx_certhist_cert_id', columns: ['certificate_id'] },

    { table: 'job_reschedules', name: 'idx_jobresch_job_id', columns: ['job_id'] },

    { table: 'support_tickets', name: 'idx_ticket_user_id', columns: ['user_id'] }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        for (const idx of INDEXES) {
            try {
                // Drop if exists
                await queryInterface.removeIndex(idx.table, idx.name);
            } catch (err) {
                // Ignore if it doesn't exist
            }
            try {
                await queryInterface.addIndex(idx.table, idx.columns, { name: idx.name });
            } catch (err) {
                console.warn(`Could not add index ${idx.name} to ${idx.table}:`, err.message);
            }
        }
    },

    async down(queryInterface, Sequelize) {
        for (const idx of INDEXES) {
            try {
                await queryInterface.removeIndex(idx.table, idx.name);
            } catch (err) {
                // Ignore
            }
        }
    }
};
