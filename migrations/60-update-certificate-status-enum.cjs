'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('certificates', 'status', {
      type: Sequelize.ENUM('DRAFT', 'ISSUED', 'VALID', 'EXPIRED', 'SUSPENDED', 'REVOKED', 'TRANSFERRED', 'DOWNGRADED'),
      defaultValue: 'DRAFT',
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('certificates', 'status', {
      type: Sequelize.ENUM('DRAFT', 'ISSUED', 'VALID', 'EXPIRED', 'SUSPENDED', 'REVOKED'),
      defaultValue: 'DRAFT',
      allowNull: false
    });
  }
};
