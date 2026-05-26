import db from './src/models/index.js';
(async () => {
  try {
    const res = await db.sequelize.query("SHOW CREATE TABLE financial_ledgers");
    console.log(res[0][0]['Create Table']);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
})();
