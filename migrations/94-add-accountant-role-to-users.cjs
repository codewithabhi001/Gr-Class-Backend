'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Expand ENUM on users.role to include ACCOUNTANT
        await queryInterface.changeColumn('users', 'role', {
            type: Sequelize.ENUM('ADMIN', 'GM', 'TM', 'TO', 'SURVEYOR', 'CLIENT', 'ACCOUNTANT'),
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        // Revert ENUM on users.role
        await queryInterface.changeColumn('users', 'role', {
            type: Sequelize.ENUM('ADMIN', 'GM', 'TM', 'TO', 'SURVEYOR', 'CLIENT'),
            allowNull: false,
        });
    }
};
