'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // MySQL doesn't natively support easy ENUM modification without re-defining the column
        // We redefine the status column with the expanded enum
        await queryInterface.changeColumn('certificate_history', 'status', {
            type: Sequelize.ENUM('DRAFT', 'ISSUED', 'VALID', 'EXPIRED', 'SUSPENDED', 'REVOKED', 'RENEWED', 'TRANSFERRED', 'DOWNGRADED'),
            allowNull: false
        });
    },

    async down(queryInterface, Sequelize) {
        // Revert to original enum
        await queryInterface.changeColumn('certificate_history', 'status', {
            type: Sequelize.ENUM('VALID', 'EXPIRED', 'SUSPENDED', 'REVOKED'),
            allowNull: false
        });
    }
};
