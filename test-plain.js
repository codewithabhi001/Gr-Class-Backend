import db from './src/models/index.js';
(async () => {
  try {
    const payment = await db.Payment.findOne();
    if (!payment) { console.log('No payment found'); process.exit(0); }
    const plain = payment.get({ plain: true });
    console.log('Payment ID:', payment.id);
    console.log('Plain ID:', plain.id);
    console.log('Type of Plain ID:', typeof plain.id);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
})();
