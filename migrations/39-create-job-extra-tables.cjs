'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('certificate_required_documents', {
            id: { type: Sequelize.CHAR(36).BINARY, primaryKey: true, allowNull: false },
            certificate_type_id: { type: Sequelize.CHAR(36).BINARY, allowNull: false, references: { model: 'certificate_types', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
            document_name: { type: Sequelize.STRING, allowNull: false },
            is_mandatory: { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false },
            created_at: { type: Sequelize.DATE, allowNull: false },
            updated_at: { type: Sequelize.DATE, allowNull: false }
        });

        await queryInterface.createTable('job_documents', {
            id: { type: Sequelize.CHAR(36).BINARY, primaryKey: true, allowNull: false },
            job_id: { type: Sequelize.CHAR(36).BINARY, allowNull: false, references: { model: 'job_requests', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
            required_document_id: { type: Sequelize.CHAR(36).BINARY, allowNull: false, references: { model: 'certificate_required_documents', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
            file_url: { type: Sequelize.STRING, allowNull: false },
            uploaded_by: { type: Sequelize.CHAR(36).BINARY, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'NO ACTION' },
            created_at: { type: Sequelize.DATE, allowNull: false },
            updated_at: { type: Sequelize.DATE, allowNull: false }
        });

        await queryInterface.createTable('job_reschedules', {
            id: { type: Sequelize.CHAR(36).BINARY, primaryKey: true, allowNull: false },
            job_id: { type: Sequelize.CHAR(36).BINARY, allowNull: false, references: { model: 'job_requests', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
            old_target_date: { type: Sequelize.DATEONLY, allowNull: true },
            new_target_date: { type: Sequelize.DATEONLY, allowNull: false },
            old_target_port: { type: Sequelize.STRING, allowNull: true },
            new_target_port: { type: Sequelize.STRING, allowNull: false },
            reason: { type: Sequelize.TEXT, allowNull: false },
            requested_by: { type: Sequelize.CHAR(36).BINARY, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'NO ACTION' },
            created_at: { type: Sequelize.DATE, allowNull: false },
            updated_at: { type: Sequelize.DATE, allowNull: false }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('job_reschedules');
        await queryInterface.dropTable('job_documents');
        await queryInterface.dropTable('certificate_required_documents');
    }
};
