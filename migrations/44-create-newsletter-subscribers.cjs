'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('newsletter_subscribers', {
      id: {
        type: Sequelize.CHAR(36).BINARY,
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      subscribed_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      unsubscribed_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      source: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'e.g. footer, popup, blog'
      }
    });

    await queryInterface.addIndex('newsletter_subscribers', ['email']);
    await queryInterface.addIndex('newsletter_subscribers', ['is_active']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('newsletter_subscribers');
  }
};
