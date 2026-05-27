'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add job_certificate_id to gps_tracking
    const tableInfo = await queryInterface.describeTable('gps_tracking');
    if (!tableInfo.job_certificate_id) {
        await queryInterface.addColumn('gps_tracking', 'job_certificate_id', {
            type: Sequelize.UUID,
            allowNull: true,
            comment: 'Added for certificate-centric tracking'
        });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('gps_tracking');
    if (tableInfo.job_certificate_id) {
        await queryInterface.removeColumn('gps_tracking', 'job_certificate_id');
    }
  }
};
