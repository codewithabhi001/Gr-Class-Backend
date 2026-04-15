'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Update ChecklistTemplates
    await queryInterface.addColumn('checklist_templates', 'template_files', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of S3 keys for blank master templates'
    });

    // Make sections nullable to support file-only checklists
    await queryInterface.changeColumn('checklist_templates', 'sections', {
      type: Sequelize.JSON,
      allowNull: true
    });

    // 2. Update Surveys
    await queryInterface.addColumn('surveys', 'signed_checklist_files', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of S3 keys for the final signed scans uploaded by surveyor'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('checklist_templates', 'template_files');
    await queryInterface.removeColumn('surveys', 'signed_checklist_files');
    
    // Revert sections to non-nullable (Careful: this might fail if nulls exist)
    await queryInterface.changeColumn('checklist_templates', 'sections', {
      type: Sequelize.JSON,
      allowNull: false
    });
  }
};
