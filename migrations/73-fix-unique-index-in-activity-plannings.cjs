'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
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

      // 1. Add job_certificate_id column to activity_plannings if it doesn't exist
      if (!(await columnExists('activity_plannings', 'job_certificate_id'))) {
        await queryInterface.addColumn('activity_plannings', 'job_certificate_id', {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'job_certificates', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        }, { transaction });
      }

      // 2. Drop the old unique index if it exists
      try {
        await queryInterface.removeIndex('activity_plannings', 'idx_activity_planning_job_question', { transaction });
      } catch (err) {
        console.log('Index idx_activity_planning_job_question did not exist or could not be removed:', err.message);
      }

      // 3. Add the new unique index on ['job_certificate_id', 'question_code']
      try {
        await queryInterface.addIndex('activity_plannings', ['job_certificate_id', 'question_code'], {
          unique: true,
          name: 'idx_activity_planning_cert_question',
          transaction
        });
      } catch (err) {
        console.log('Index idx_activity_planning_cert_question already exists or could not be added:', err.message);
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
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

      // 1. Drop the new unique index
      try {
        await queryInterface.removeIndex('activity_plannings', 'idx_activity_planning_cert_question', { transaction });
      } catch (err) {
        console.log('Index idx_activity_planning_cert_question did not exist or could not be removed:', err.message);
      }

      // 2. Add back the old unique index on ['job_id', 'question_code']
      try {
        await queryInterface.addIndex('activity_plannings', ['job_id', 'question_code'], {
          unique: true,
          name: 'idx_activity_planning_job_question',
          transaction
        });
      } catch (err) {
        console.log('Index idx_activity_planning_job_question already exists or could not be added:', err.message);
      }

      // 3. Remove column job_certificate_id if it exists
      if (await columnExists('activity_plannings', 'job_certificate_id')) {
        // Drop foreign key constraint first
        const foreignKeys = await queryInterface.getForeignKeyReferencesForTable('activity_plannings');
        const certIdFk = foreignKeys.find(fk => fk.columnName === 'job_certificate_id');
        if (certIdFk) {
          await queryInterface.removeConstraint('activity_plannings', certIdFk.constraintName, { transaction });
        }
        await queryInterface.removeColumn('activity_plannings', 'job_certificate_id', { transaction });
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
