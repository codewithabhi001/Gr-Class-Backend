'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('job_requests', 'survey_status_report_html', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      comment: 'Saved visual-editor HTML for the Class & Statutory Survey Status Report',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('job_requests', 'survey_status_report_html');
  },
};
