'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add PARTIALLY_PAID to payments.payment_status ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE payments 
      MODIFY COLUMN payment_status ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID', 'ON_HOLD') 
      DEFAULT 'UNPAID'
    `);

    // 2. Add ADVANCE and PARTIAL_PAYMENT to financial_ledgers.transaction_type ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE financial_ledgers 
      MODIFY COLUMN transaction_type ENUM('CHARGE', 'PAYMENT', 'ADVANCE', 'PARTIAL_PAYMENT', 'REFUND', 'ADJUSTMENT', 'WRITEOFF') 
      NOT NULL
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revert: Remove PARTIALLY_PAID from payments
    await queryInterface.sequelize.query(`
      UPDATE payments SET payment_status = 'UNPAID' WHERE payment_status = 'PARTIALLY_PAID'
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE payments 
      MODIFY COLUMN payment_status ENUM('UNPAID', 'PAID', 'ON_HOLD') 
      DEFAULT 'UNPAID'
    `);

    // Revert: Remove ADVANCE and PARTIAL_PAYMENT from financial_ledgers
    await queryInterface.sequelize.query(`
      UPDATE financial_ledgers SET transaction_type = 'PAYMENT' WHERE transaction_type IN ('ADVANCE', 'PARTIAL_PAYMENT')
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE financial_ledgers 
      MODIFY COLUMN transaction_type ENUM('CHARGE', 'PAYMENT', 'REFUND', 'ADJUSTMENT', 'WRITEOFF') 
      NOT NULL
    `);
  }
};
