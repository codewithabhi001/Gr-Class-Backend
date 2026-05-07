import bcrypt from 'bcrypt';
import db from '../src/models/index.js';
import env from '../src/config/env.js';

const PRESERVE_TABLES = [
    'site_static_contents',
    'website_videos',
    'SequelizeMeta'
];

async function cleanupAndInit() {
    console.log('--- Database Cleanup and Admin Initialization ---');

    try {
        const { sequelize } = db;

        // 1. Disable foreign key checks
        console.log('Disabling foreign key checks...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        // 2. Fetch all tables
        console.log('Fetching all tables...');
        const [tables] = await sequelize.query('SHOW TABLES');
        const dbName = sequelize.config.database;
        const tableNames = tables.map(t => t[`Tables_in_${dbName}`]);

        // 3. Truncate tables
        for (const tableName of tableNames) {
            if (PRESERVE_TABLES.includes(tableName)) {
                console.log(`Skipping preserved table: ${tableName}`);
                continue;
            }

            console.log(`Truncating table: ${tableName}...`);
            await sequelize.query(`TRUNCATE TABLE \`${tableName}\``);
        }

        // 4. Create Admin User
        console.log('Creating admin user...');
        const email = 'info@grclass.com';
        const password = 'Password@123';
        const salt = await bcrypt.genSalt(env.bcrypt.saltRounds || 10);
        const passwordHash = await bcrypt.hash(password, salt);

        await db.User.create({
            name: 'System Admin',
            email: email,
            password_hash: passwordHash,
            role: 'ADMIN',
            status: 'ACTIVE'
        });

        console.log(`Admin user created: ${email}`);

        // 5. Re-enable foreign key checks
        console.log('Re-enabling foreign key checks...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('--- Cleanup and Initialization Complete ---');
    } catch (error) {
        console.error('Error during cleanup and initialization:', error);
        // Ensure foreign key checks are re-enabled even on failure
        try {
            await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        } catch (reEnableError) {
            console.error('Failed to re-enable foreign key checks:', reEnableError);
        }
    } finally {
        await db.sequelize.close();
    }
}

cleanupAndInit();
