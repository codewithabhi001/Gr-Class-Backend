'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Drop table if exists to recreate it with the brand new clean schema matching site_static_content.model.js
        await queryInterface.dropTable('site_static_contents');
        
        await queryInterface.createTable('site_static_contents', {
            id: {
                type: Sequelize.CHAR(36).BINARY,
                primaryKey: true,
                allowNull: false
            },
            key: {
                type: Sequelize.STRING(64),
                allowNull: false,
                unique: true
            },
            title: {
                type: Sequelize.STRING(200),
                allowNull: false
            },
            body_html: {
                type: Sequelize.TEXT('long'),
                allowNull: true
            },
            faq_items: {
                type: Sequelize.JSON,
                allowNull: true,
                comment: 'Array of { question, answer, sort_order }'
            },
            news_items: {
                type: Sequelize.JSON,
                allowNull: true,
                comment: 'Array of { id, title, body_html, thumbnail_url, published_at }'
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

        await queryInterface.addIndex('site_static_contents', ['key']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('site_static_contents');
        
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
                allowNull: false
            },
            body_html: {
                type: Sequelize.TEXT('long'),
                allowNull: true
            },
            thumbnail_url: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            faq_items: {
                type: Sequelize.JSON,
                allowNull: true
            },
            is_published: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            published_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            updated_by: {
                type: Sequelize.CHAR(36).BINARY,
                allowNull: true
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
    }
};
