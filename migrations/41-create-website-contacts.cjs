'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('website_contacts', {
            id: { type: Sequelize.CHAR(36).BINARY, primaryKey: true, allowNull: false },
            full_name: { type: Sequelize.STRING(100), allowNull: false },
            company: { type: Sequelize.STRING(150), allowNull: true },
            corporate_email: { type: Sequelize.STRING(255), allowNull: false },
            message: { type: Sequelize.TEXT, allowNull: false },
            phone: { type: Sequelize.STRING(30), allowNull: true },
            subject: { type: Sequelize.STRING(200), allowNull: true },
            status: { type: Sequelize.ENUM('NEW', 'READ', 'REPLIED', 'ARCHIVED'), defaultValue: 'NEW', allowNull: false },
            internal_note: { type: Sequelize.TEXT, allowNull: true },
            replied_by: { type: Sequelize.CHAR(36).BINARY, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
            replied_at: { type: Sequelize.DATE, allowNull: true },
            ip_address: { type: Sequelize.STRING(50), allowNull: true },
            source_page: { type: Sequelize.STRING(50), defaultValue: 'CONTACT', allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        await queryInterface.addIndex('website_contacts', ['status']);
        await queryInterface.addIndex('website_contacts', ['corporate_email']);
        await queryInterface.addIndex('website_contacts', ['created_at']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('website_contacts');
    }
};
