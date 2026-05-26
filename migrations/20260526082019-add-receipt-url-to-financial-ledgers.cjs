'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if column already exists to prevent crashes
    const tableDesc = await queryInterface.describeTable('financial_ledgers');
    if (!tableDesc.receipt_url) {
      await queryInterface.addColumn('financial_ledgers', 'receipt_url', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('financial_ledgers');
    if (tableDesc.receipt_url) {
      await queryInterface.removeColumn('financial_ledgers', 'receipt_url');
    }
  }
};
