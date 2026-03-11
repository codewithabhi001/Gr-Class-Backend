'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('flag_administrations', {
            id: {
                type: Sequelize.CHAR(36).BINARY,
                primaryKey: true,
                allowNull: false
            },
            flag_state_name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            country: {
                type: Sequelize.STRING,
                allowNull: true
            },
            authority_name: {
                type: Sequelize.STRING,
                allowNull: true
            },
            contact_email: {
                type: Sequelize.STRING,
                allowNull: true
            },
            authorization_scope: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
                defaultValue: 'ACTIVE',
                allowNull: false
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        await queryInterface.addIndex('flag_administrations', ['flag_state_name'], { unique: true });
        await queryInterface.addIndex('flag_administrations', ['status']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('flag_administrations');
    }
};
