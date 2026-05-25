'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('messages');
    if (!tableDescription.attachment_url) {
      await queryInterface.addColumn('messages', 'attachment_url', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
    if (!tableDescription.updated_at) {
      await queryInterface.addColumn('messages', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('messages');
    if (tableDescription.attachment_url) {
      await queryInterface.removeColumn('messages', 'attachment_url');
    }
    if (tableDescription.updated_at) {
      await queryInterface.removeColumn('messages', 'updated_at');
    }
  }
};
