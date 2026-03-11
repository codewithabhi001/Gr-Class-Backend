'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('survey_status_histories', {
            id: {
                type: Sequelize.CHAR(36).BINARY,
                primaryKey: true,
                allowNull: false
            },
            survey_id: {
                type: Sequelize.CHAR(36).BINARY,
                allowNull: false,
                references: {
                    model: 'surveys',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            previous_status: {
                type: Sequelize.STRING,
                allowNull: true
            },
            new_status: {
                type: Sequelize.STRING,
                allowNull: false
            },
            submission_iteration: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false
            },
            changed_by: {
                type: Sequelize.CHAR(36).BINARY,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION'
            },
            reason: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        await queryInterface.addIndex('survey_status_histories', ['survey_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('survey_status_histories');
    }
};
