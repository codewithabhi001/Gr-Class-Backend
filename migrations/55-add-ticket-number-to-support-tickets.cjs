'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('support_tickets', 'ticket_number', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      unique: true,
      after: 'user_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('support_tickets', 'ticket_number');
  }
};
