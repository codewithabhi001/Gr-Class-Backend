'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('job_documents', 'verification_status', {
      type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING',
      comment: 'TO sets this during document verification'
    });
    
    await queryInterface.addColumn('job_documents', 'rejection_reason', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Reason why TO rejected this document'
    });
    
    await queryInterface.addColumn('job_documents', 'verified_by', {
      type: Sequelize.UUID,
      allowNull: true,
      comment: 'User ID of the TO who verified/rejected this document'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('job_documents', 'verification_status');
    await queryInterface.removeColumn('job_documents', 'rejection_reason');
    await queryInterface.removeColumn('job_documents', 'verified_by');
  }
};
