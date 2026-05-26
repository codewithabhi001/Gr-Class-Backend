import db from './src/models/index.js';
(async () => {
  try {
    const pCols = await db.sequelize.query('DESCRIBE payments;');
    console.log('Payments columns:', pCols[0].map(c => c.Field));
    const flCols = await db.sequelize.query('DESCRIBE financial_ledgers;');
    console.log('FL columns:', flCols[0].map(c => c.Field));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
})();
