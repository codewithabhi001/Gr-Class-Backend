'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('portfolio_feedbacks', {
            id: {
                type: Sequelize.CHAR(36).BINARY,
                primaryKey: true,
                allowNull: false
            },
            client_id: {
                type: Sequelize.CHAR(36).BINARY,
                allowNull: false,
                unique: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            comment: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            profile_url: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            designation: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            company: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            is_visible: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
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

        await queryInterface.addIndex('portfolio_feedbacks', ['client_id']);
        await queryInterface.addIndex('portfolio_feedbacks', ['is_visible']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('portfolio_feedbacks');
    }
};
