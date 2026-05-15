'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('activity_plannings', ['job_id', 'question_code'], {
      unique: true,
      name: 'idx_activity_planning_job_question'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('activity_plannings', 'idx_activity_planning_job_question');
  }
};
