'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('site_static_contents', {
            id: {
                type: Sequelize.CHAR(36).BINARY,
                primaryKey: true,
                allowNull: false
            },
            slug: {
                type: Sequelize.STRING(64),
                allowNull: false,
                unique: true
            },
            title: {
                type: Sequelize.STRING(200),
                allowNull: false
            },
            content_type: {
                type: Sequelize.STRING(20),
                allowNull: false,
                comment: 'PAGE (terms, about, etc.) or FAQ'
            },
            body_html: {
                type: Sequelize.TEXT('long'),
                allowNull: true
            },
            faq_items: {
                type: Sequelize.JSON,
                allowNull: true,
                comment: 'Array of { question, answer, sort_order? } when content_type is FAQ'
            },
            is_published: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            updated_by: {
                type: Sequelize.CHAR(36).BINARY,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
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

        await queryInterface.addIndex('site_static_contents', ['slug']);
        await queryInterface.addIndex('site_static_contents', ['is_published']);
        await queryInterface.addIndex('site_static_contents', ['content_type']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('site_static_contents');
    }
};
