'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('activity_requests', 'activity_type', {
            type: Sequelize.ENUM('INSPECTION', 'AUDIT', 'TRAINING', 'VISIT', 'SURVEY', 'OTHER'),
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('activity_requests', 'activity_type', {
            type: Sequelize.ENUM('INSPECTION', 'AUDIT', 'TRAINING', 'VISIT', 'OTHER'),
            allowNull: false,
        });
    },
};
