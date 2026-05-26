import db from './src/models/index.js';
(async () => {
  try {
    const ledgers = await db.FinancialLedger.findAll({ where: { invoice_id: '123' } });
    console.log('Success, found:', ledgers.length);
  } catch (err) {
    console.error('Error:', err.message);
    if (err.original) console.error('Original SQL Error:', err.original.message);
  } finally {
    process.exit(0);
  }
})();
