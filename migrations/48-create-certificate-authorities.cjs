'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('certificate_authorities', {
            id: {
                type: Sequelize.CHAR(36).BINARY,
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            code: {
                type: Sequelize.STRING,
                allowNull: true
            },
            country: {
                type: Sequelize.STRING,
                allowNull: true
            },
            logo_url: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'Stores the S3 key of the logo image'
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

        await queryInterface.addIndex('certificate_authorities', ['name']);
        await queryInterface.addIndex('certificate_authorities', ['status']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('certificate_authorities');
    }
};
