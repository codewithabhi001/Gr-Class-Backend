'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('certificate_templates', 'certificate_term', {
            type: Sequelize.ENUM('FULL_TERM', 'SHORT_TERM'),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('certificate_templates', 'certificate_term');
    }
};

