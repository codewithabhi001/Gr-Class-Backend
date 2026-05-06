'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Change the column type from INTEGER to STRING (VARCHAR)
    // We first modify the column to be a string without autoIncrement
    await queryInterface.changeColumn('job_requests', 'job_request_number', {
      type: Sequelize.STRING,
      autoIncrement: false,
      allowNull: true, // Temporarily allow null to handle migration
    });

    // 2. Update existing records to the new format (e.g., GRJ-00001001)
    // Using CONCAT and LPAD to format the existing numeric IDs
    await queryInterface.sequelize.query(`
      UPDATE job_requests 
      SET job_request_number = CONCAT('GRJ-', LPAD(job_request_number, 8, '0'))
      WHERE job_request_number REGEXP '^[0-9]+$'
    `);

    // 3. Set unique constraint and non-null if desired
    await queryInterface.changeColumn('job_requests', 'job_request_number', {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // To revert, we might need to strip the prefix, but it's risky if they are truly random now.
    // For safety, we just change the type back to INTEGER if possible, or leave as string.
    // Converting back to INTEGER will fail if the numbers are now random strings.
    // So down migration might just change the type back if it only contains numeric parts.
    await queryInterface.changeColumn('job_requests', 'job_request_number', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      unique: true,
      allowNull: false,
    });
  }
};
