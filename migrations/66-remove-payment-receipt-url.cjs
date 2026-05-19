'use strict';

/** Receipts belong on financial_ledgers (per collection). Drop duplicate column on payments. */
module.exports = {
    async up(queryInterface) {
        await queryInterface.removeColumn('payments', 'receipt_url');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('payments', 'receipt_url', {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },
};
