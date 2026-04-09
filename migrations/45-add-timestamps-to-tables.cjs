'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = ['certificates', 'payments', 'non_conformities'];
    
    for (const table of tables) {
      // Check and add created_at
      await queryInterface.addColumn(table, 'created_at', {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }).catch(() => console.log(`created_at already exists in ${table}`));

      // Check and add updated_at
      await queryInterface.addColumn(table, 'updated_at', {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }).catch(() => console.log(`updated_at already exists in ${table}`));
    }
  },

  async down(queryInterface) {
    const tables = ['certificates', 'payments', 'non_conformities'];
    for (const table of tables) {
      await queryInterface.removeColumn(table, 'created_at').catch(() => {});
      await queryInterface.removeColumn(table, 'updated_at').catch(() => {});
    }
  }
};
