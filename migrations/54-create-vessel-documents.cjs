'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('vessel_documents', {
            id: {
                type: Sequelize.CHAR(36).BINARY,
                primaryKey: true,
                allowNull: false
            },
            vessel_id: {
                type: Sequelize.CHAR(36).BINARY,
                allowNull: false,
                references: {
                    model: 'vessels',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            document_type: {
                type: Sequelize.STRING,
                allowNull: false
            },
            file_url: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.STRING,
                allowNull: true
            },
            uploaded_by: {
                type: Sequelize.CHAR(36).BINARY,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('now')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('now')
            }
        });

        // Add indexes for optimizing queries
        await queryInterface.addIndex('vessel_documents', ['vessel_id']);
        await queryInterface.addIndex('vessel_documents', ['uploaded_by']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('vessel_documents');
    }
};
