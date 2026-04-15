'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('job_requests', {
            id: {
                type: Sequelize.CHAR(36).BINARY,
                primaryKey: true,
                allowNull: false
            },
            vessel_id: {
                type: Sequelize.CHAR(36).BINARY,
                allowNull: false,
                references: {
                    model: 'vessels',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            requested_by_user_id: {
                type: Sequelize.CHAR(36).BINARY,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            certificate_type_id: {
                type: Sequelize.CHAR(36).BINARY,
                allowNull: false,
                references: {
                    model: 'certificate_types',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            reason: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            target_port: {
                type: Sequelize.STRING,
                allowNull: true
            },
            target_date: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },
            job_status: {
                type: Sequelize.ENUM(
                    'CREATED', 'DOCUMENT_VERIFIED', 'APPROVED', 'ASSIGNED', 'SURVEY_AUTHORIZED', 'IN_PROGRESS', 'SURVEY_DONE',
                    'REVIEWED', 'FINALIZED', 'REWORK_REQUESTED', 'PAYMENT_DONE', 'CERTIFIED', 'REJECTED'
                ),
                defaultValue: 'CREATED',
                allowNull: false
            },
            assigned_surveyor_id: {
                type: Sequelize.CHAR(36).BINARY,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            assigned_by_user_id: {
                type: Sequelize.CHAR(36).BINARY,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            generated_certificate_id: {
                type: Sequelize.CHAR(36).BINARY,
                allowNull: true,
                // references: { model: 'certificates', key: 'id' } // Circular dependency if certificate not created yet. 
                // We'll add FK later or just define it as CHAR(36) here.
            },
            approved_by_user_id: {
                type: Sequelize.CHAR(36).BINARY,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            remarks: {
                type: Sequelize.TEXT,
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
            is_survey_required: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
                allowNull: false
            },
            reschedule_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false
            },
            priority: {
                type: Sequelize.ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT'),
                defaultValue: 'NORMAL',
                allowNull: false
            }
        });

        await queryInterface.addIndex('job_requests', ['vessel_id']);
        await queryInterface.addIndex('job_requests', ['requested_by_user_id']);
        await queryInterface.addIndex('job_requests', ['job_status']);
        await queryInterface.addIndex('job_requests', ['assigned_surveyor_id']);
        await queryInterface.addIndex('job_requests', ['certificate_type_id']);
        await queryInterface.addIndex('job_requests', ['created_at']);
        await queryInterface.addIndex('job_requests', ['updated_at']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('job_requests');
    }
};
