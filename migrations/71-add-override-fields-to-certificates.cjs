'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('certificates', 'is_manually_overridden', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Flag indicating if the system generated certificate was manually replaced'
    });
    
    await queryInterface.addColumn('certificates', 'manually_overridden_file_url', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'S3 key for the manually uploaded overridden certificate'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('certificates', 'manually_overridden_file_url');
    await queryInterface.removeColumn('certificates', 'is_manually_overridden');
  }
};
