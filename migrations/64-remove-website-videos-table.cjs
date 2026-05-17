'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.dropTable('website_videos');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.createTable('website_videos', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false
            },
            section: {
                type: Sequelize.STRING,
                allowNull: false
            },
            title: {
                type: Sequelize.STRING,
                allowNull: true
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            video_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            thumbnail_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            uploaded_by: {
                type: Sequelize.UUID,
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
