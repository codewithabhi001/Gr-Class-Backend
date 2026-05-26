import db from './src/models/index.js';
(async () => {
  try {
    await db.FinancialLedger.findAll({ 
      where: { invoice_id: '123' },
      logging: console.log 
    });
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
})();
