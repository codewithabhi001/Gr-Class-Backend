'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Helper: check if a column already exists in a table
      const columnExists = async (table, column) => {
        const [results] = await queryInterface.sequelize.query(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table AND COLUMN_NAME = :column`,
          { replacements: { table, column }, transaction }
        );
        return results.length > 0;
      };

      // Helper: check if a table already exists
      const tableExists = async (table) => {
        const [results] = await queryInterface.sequelize.query(
          `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table`,
          { replacements: { table }, transaction }
        );
        return results.length > 0;
      };

      // 1. Create job_certificates table (idempotent)
      if (!(await tableExists('job_certificates'))) {
        await queryInterface.createTable('job_certificates', {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('(UUID())'),
            primaryKey: true,
          },
          job_request_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: 'job_requests', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          certificate_type_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: 'certificate_types', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          generated_certificate_id: {
            type: Sequelize.UUID,
            allowNull: true,
            references: { model: 'certificates', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          status: {
            type: Sequelize.ENUM(
              'PENDING',
              'DOCUMENT_VERIFIED',
              'REWORK_REQUESTED',
              'SURVEY_AUTHORIZED',
              'SURVEY_DONE',
              'ISSUED',
              'REJECTED'
            ),
            defaultValue: 'PENDING',
          },
          rework_remarks: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          created_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updated_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
        }, { transaction });
      }

      // 2. Add job_certificate_id to job_documents (skip if already exists)
      if (!(await columnExists('job_documents', 'job_certificate_id'))) {
        await queryInterface.addColumn('job_documents', 'job_certificate_id', {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'job_certificates', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        }, { transaction });
      }

      // 3. Add job_certificate_id to surveys (skip if already exists)
      if (!(await columnExists('surveys', 'job_certificate_id'))) {
        await queryInterface.addColumn('surveys', 'job_certificate_id', {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'job_certificates', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        }, { transaction });
      }

      // Remove surveys.job_id if it still exists
      if (await columnExists('surveys', 'job_id')) {
        const foreignKeys = await queryInterface.getForeignKeyReferencesForTable('surveys');
        const jobIdFk = foreignKeys.find(fk => fk.columnName === 'job_id');
        if (jobIdFk) {
          await queryInterface.removeConstraint('surveys', jobIdFk.constraintName, { transaction });
        }
        await queryInterface.removeColumn('surveys', 'job_id', { transaction });
      }

      // 4. Remove certificate_type_id from job_requests (idempotent)
      if (await columnExists('job_requests', 'certificate_type_id')) {
        const jrForeignKeys = await queryInterface.getForeignKeyReferencesForTable('job_requests');
        const certTypeIdFk = jrForeignKeys.find(fk => fk.columnName === 'certificate_type_id');
        if (certTypeIdFk) {
          await queryInterface.removeConstraint('job_requests', certTypeIdFk.constraintName, { transaction });
        }
        await queryInterface.removeColumn('job_requests', 'certificate_type_id', { transaction });
      }

      // 5. Remove generated_certificate_id from job_requests (idempotent)
      if (await columnExists('job_requests', 'generated_certificate_id')) {
        const jrForeignKeys2 = await queryInterface.getForeignKeyReferencesForTable('job_requests');
        const genCertIdFk = jrForeignKeys2.find(fk => fk.columnName === 'generated_certificate_id');
        if (genCertIdFk) {
          await queryInterface.removeConstraint('job_requests', genCertIdFk.constraintName, { transaction });
        }
        await queryInterface.removeColumn('job_requests', 'generated_certificate_id', { transaction });
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Restore job_requests columns
      await queryInterface.addColumn('job_requests', 'certificate_type_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'certificate_types', key: 'id' },
      }, { transaction });

      await queryInterface.addColumn('job_requests', 'generated_certificate_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'certificates', key: 'id' },
      }, { transaction });

      // Restore surveys.job_id
      await queryInterface.addColumn('surveys', 'job_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'job_requests', key: 'id' },
      }, { transaction });

      const surveyForeignKeys = await queryInterface.getForeignKeyReferencesForTable('surveys');
      const jobCertIdFk = surveyForeignKeys.find(fk => fk.columnName === 'job_certificate_id');
      if (jobCertIdFk) {
        await queryInterface.removeConstraint('surveys', jobCertIdFk.constraintName, { transaction });
      }
      await queryInterface.removeColumn('surveys', 'job_certificate_id', { transaction });

      // Restore job_documents
      const jdForeignKeys = await queryInterface.getForeignKeyReferencesForTable('job_documents');
      const jdCertIdFk = jdForeignKeys.find(fk => fk.columnName === 'job_certificate_id');
      if (jdCertIdFk) {
        await queryInterface.removeConstraint('job_documents', jdCertIdFk.constraintName, { transaction });
      }
      await queryInterface.removeColumn('job_documents', 'job_certificate_id', { transaction });

      // Drop job_certificates
      await queryInterface.dropTable('job_certificates', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
