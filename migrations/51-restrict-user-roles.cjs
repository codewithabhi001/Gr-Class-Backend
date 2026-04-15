'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const [legacyRoles] = await queryInterface.sequelize.query(`
            SELECT role, COUNT(*) AS count
            FROM users
            WHERE role IN ('TA', 'FLAG_ADMIN')
            GROUP BY role
        `);

        if (legacyRoles.length > 0) {
            const detail = legacyRoles.map(({ role, count }) => `${role}:${count}`).join(', ');
            throw new Error(`Cannot restrict user roles while legacy users still exist (${detail}). Reassign or clean them first.`);
        }

        await queryInterface.changeColumn('users', 'role', {
            type: Sequelize.ENUM('ADMIN', 'GM', 'TM', 'TO', 'SURVEYOR', 'CLIENT'),
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('users', 'role', {
            type: Sequelize.ENUM('ADMIN', 'GM', 'TM', 'TO', 'TA', 'SURVEYOR', 'CLIENT', 'FLAG_ADMIN'),
            allowNull: false,
        });
    }
};
