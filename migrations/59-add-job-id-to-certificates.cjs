'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('certificates', 'job_id', {
      type: Sequelize.CHAR(36).BINARY,
      allowNull: true,
      after: 'vessel_id',
      references: {
        model: 'job_requests',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('certificates', 'job_id');
  }
};
