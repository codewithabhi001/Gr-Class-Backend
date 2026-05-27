'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const columnExists = async (table, column) => {
        const [results] = await queryInterface.sequelize.query(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table AND COLUMN_NAME = :column`,
          { replacements: { table, column }, transaction }
        );
        return results.length > 0;
      };

      if (!(await columnExists('non_conformities', 'job_certificate_id'))) {
        await queryInterface.addColumn('non_conformities', 'job_certificate_id', {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'job_certificates', key: 'id' },
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

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const foreignKeys = await queryInterface.getForeignKeyReferencesForTable('non_conformities');
      const fk = foreignKeys.find(f => f.columnName === 'job_certificate_id');
      if (fk) {
        await queryInterface.removeConstraint('non_conformities', fk.constraintName, { transaction });
      }
      await queryInterface.removeColumn('non_conformities', 'job_certificate_id', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
