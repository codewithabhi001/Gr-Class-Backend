'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('job_documents', 'required_document_id', {
      type: Sequelize.UUID,
      allowNull: true
    });
    
    await queryInterface.addColumn('job_documents', 'custom_document_name', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Name for additional documents that are not part of required_documents'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('job_documents', 'custom_document_name');
    
    // Note: Reverting required_document_id to allowNull: false might fail if there are existing rows with nulls.
    // In a real production rollback, we'd need to delete the additional docs first or assign them a dummy required doc.
    await queryInterface.changeColumn('job_documents', 'required_document_id', {
      type: Sequelize.UUID,
      allowNull: false
    });
  }
};
