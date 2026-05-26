import db from './src/models/index.js';
(async () => {
  try {
    await db.FinancialLedger.findAll({ where: { invoice_id: undefined }, order: [['createdAt', 'ASC']] });
  } catch (err) {
    console.log('Error Name:', err.name);
  } finally {
    process.exit(0);
  }
})();
