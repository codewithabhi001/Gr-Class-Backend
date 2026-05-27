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

      if (!(await columnExists('job_certificates', 'assigned_surveyor_id'))) {
        await queryInterface.addColumn('job_certificates', 'assigned_surveyor_id', {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        }, { transaction });
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
      const foreignKeys = await queryInterface.getForeignKeyReferencesForTable('job_certificates');
      const fk = foreignKeys.find(f => f.columnName === 'assigned_surveyor_id');
      if (fk) {
        await queryInterface.removeConstraint('job_certificates', fk.constraintName, { transaction });
      }
      await queryInterface.removeColumn('job_certificates', 'assigned_surveyor_id', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
