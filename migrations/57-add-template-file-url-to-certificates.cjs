'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add template_file_url to certificate_templates
    await queryInterface.addColumn('certificate_templates', 'template_file_url', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'S3 key for .docx template'
    });

    // 2. Remove template_content from certificate_templates
    await queryInterface.removeColumn('certificate_templates', 'template_content');
  },

  async down(queryInterface, Sequelize) {
    // 1. Add template_content back
    await queryInterface.addColumn('certificate_templates', 'template_content', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // 2. Remove template_file_url
    await queryInterface.removeColumn('certificate_templates', 'template_file_url');
  }
};
