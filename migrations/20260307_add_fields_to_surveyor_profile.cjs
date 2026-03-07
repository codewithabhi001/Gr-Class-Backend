
'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add columns to surveyor_profiles
        const table = 'surveyor_profiles';
        const columns = await queryInterface.describeTable(table);

        if (!columns.nationality) {
            await queryInterface.addColumn(table, 'nationality', {
                type: Sequelize.STRING,
                allowNull: true
            });
        }

        if (!columns.qualification) {
            await queryInterface.addColumn(table, 'qualification', {
                type: Sequelize.STRING,
                allowNull: true
            });
        }

        if (!columns.years_of_experience) {
            await queryInterface.addColumn(table, 'years_of_experience', {
                type: Sequelize.INTEGER,
                allowNull: true
            });
        }

        if (!columns.cv_url) {
            await queryInterface.addColumn(table, 'cv_url', {
                type: Sequelize.STRING,
                allowNull: true
            });
        }

        if (!columns.id_proof_url) {
            await queryInterface.addColumn(table, 'id_proof_url', {
                type: Sequelize.STRING,
                allowNull: true
            });
        }
    },

    down: async (queryInterface, Sequelize) => {
        const table = 'surveyor_profiles';
        await queryInterface.removeColumn(table, 'nationality');
        await queryInterface.removeColumn(table, 'qualification');
        await queryInterface.removeColumn(table, 'years_of_experience');
        await queryInterface.removeColumn(table, 'cv_url');
        await queryInterface.removeColumn(table, 'id_proof_url');
    }
};
