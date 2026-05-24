import db from '../src/models/index.js';

const run = async () => {
    try {
        const sequelize = db.sequelize;
        const dbName = sequelize.config.database;
        console.log(`Cleaning database: ${dbName}`);

        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        // Fetch all tables in the schema
        const [tables] = await sequelize.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);

        console.log(`Found ${tableNames.length} tables to drop:`, tableNames);

        for (const tableName of tableNames) {
            await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\``);
            console.log(`  Dropped table: ${tableName}`);
        }

        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ All tables successfully dropped!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to drop all tables:', err);
        process.exit(1);
    }
};

run();
