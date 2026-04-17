import db from '../src/models/index.js';
async function test() {
    console.log("DB NAME: ", db.sequelize.config.database);
    const [results] = await db.sequelize.query("SHOW COLUMNS FROM surveys");
    console.log("Columns:", results.map(r => r.Field));
    process.exit(0);
}
test();
