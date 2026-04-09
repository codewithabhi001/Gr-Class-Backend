'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Fix surveyor_profiles
    await queryInterface.addColumn('surveyor_profiles', 'license_copy_url', {
      type: Sequelize.STRING,
      allowNull: true
    }).catch(() => {});

    await queryInterface.addColumn('surveyor_profiles', 'created_at', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }).catch(() => {});

    await queryInterface.addColumn('surveyor_profiles', 'updated_at', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }).catch(() => {});

    // 2. Fix surveyor_applications
    await queryInterface.addColumn('surveyor_applications', 'created_at', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }).catch(() => {});

    await queryInterface.addColumn('surveyor_applications', 'updated_at', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }).catch(() => {});
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('surveyor_profiles', 'license_copy_url').catch(() => {});
    await queryInterface.removeColumn('surveyor_profiles', 'created_at').catch(() => {});
    await queryInterface.removeColumn('surveyor_profiles', 'updated_at').catch(() => {});
    await queryInterface.removeColumn('surveyor_applications', 'created_at').catch(() => {});
    await queryInterface.removeColumn('surveyor_applications', 'updated_at').catch(() => {});
  }
};
