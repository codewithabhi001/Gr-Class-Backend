import db from './src/models/index.js';
(async () => {
  try {
    const payment = await db.Payment.findOne();
    if (!payment) { console.log('No payment found'); process.exit(0); }
    console.log('Payment ID:', payment.id);
    const ledgers = await db.FinancialLedger.findAll({ where: { invoice_id: payment.id }, order: [['createdAt', 'ASC']] });
    console.log('Ledgers:', ledgers.length);
  } catch (err) {
    console.error('Error:', err.message);
    if (err.original) console.error('Original SQL Error:', err.original.message);
  } finally {
    process.exit(0);
  }
})();
