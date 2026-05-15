'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add fields to activity_plannings
    await queryInterface.addColumn('activity_plannings', 'status', {
      type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING',
      after: 'file_url'
    });

    await queryInterface.addColumn('activity_plannings', 'rejection_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'status'
    });

    // 2. Data Migration for signed_checklist_files in surveys table
    const [surveys] = await queryInterface.sequelize.query(
      'SELECT id, signed_checklist_files FROM surveys WHERE signed_checklist_files IS NOT NULL'
    );

    for (const survey of surveys) {
      let files = survey.signed_checklist_files;
      if (typeof files === 'string') {
        try {
          files = JSON.parse(files);
        } catch (e) {
          continue;
        }
      }

      if (Array.isArray(files) && files.length > 0) {
        let needsMigration = false;
        const updatedFiles = files.map(file => {
          if (typeof file === 'string') {
            needsMigration = true;
            return { url: file, status: 'APPROVED', rejection_reason: null };
          }
          return file;
        });

        if (needsMigration) {
          await queryInterface.sequelize.query(
            'UPDATE surveys SET signed_checklist_files = :files WHERE id = :id',
            {
              replacements: { 
                files: JSON.stringify(updatedFiles), 
                id: survey.id 
              }
            }
          );
        }
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('activity_plannings', 'rejection_reason');
    await queryInterface.removeColumn('activity_plannings', 'status');
    
    // Note: Reverting JSON structure in surveys is complex and potentially destructive,
    // so we typically leave it as is in down() or just revert to simple array if possible.
  }
};
