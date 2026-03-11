'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('surveys', {
            id: {
                type: Sequelize.CHAR(36).BINARY,
                primaryKey: true,
                allowNull: false
            },
            job_id: {
                type: Sequelize.CHAR(36).BINARY,
                allowNull: false,
                unique: true,
                references: {
                    model: 'job_requests',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            surveyor_id: {
                type: Sequelize.CHAR(36).BINARY,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            survey_status: {
                type: Sequelize.ENUM(
                    'NOT_STARTED', 'STARTED', 'CHECKLIST_SUBMITTED', 'PROOF_UPLOADED', 'SUBMITTED', 'REWORK_REQUIRED', 'FINALIZED'
                ),
                defaultValue: 'NOT_STARTED',
                allowNull: false
            },
            started_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            submitted_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            finalized_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            survey_statement_status: {
                type: Sequelize.ENUM('NOT_PREPARED', 'DRAFTED', 'ISSUED'),
                defaultValue: 'NOT_PREPARED',
                allowNull: false
            },
            survey_statement_pdf_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            declared_by: {
                type: Sequelize.CHAR(36).BINARY,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            declared_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            start_latitude: {
                type: Sequelize.DECIMAL(10, 8),
                allowNull: true
            },
            start_longitude: {
                type: Sequelize.DECIMAL(11, 8),
                allowNull: true
            },
            submit_latitude: {
                type: Sequelize.DECIMAL(10, 8),
                allowNull: true
            },
            submit_longitude: {
                type: Sequelize.DECIMAL(11, 8),
                allowNull: true
            },
            signature_url: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            declaration_hash: {
                type: Sequelize.STRING(64),
                allowNull: true
            },
            submission_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false
            },
            attendance_photo_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            survey_statement: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            evidence_proof_url: {
                type: Sequelize.STRING,
                allowNull: true
            }
        });

        await queryInterface.addIndex('surveys', ['surveyor_id']);
        await queryInterface.addIndex('surveys', ['survey_status']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('surveys');
    }
};
