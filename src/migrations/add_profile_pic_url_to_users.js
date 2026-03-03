/**
 * Migration: Add profile_pic_url to users table
 * 
 * This migration adds the profile_pic_url column to the users table
 * to support user profile pictures.
 * 
 * Usage:
 * node src/migrations/add_profile_pic_url_to_users.js
 */

import db from '../models/index.js';

async function migrate() {
    try {
        console.log('🔄 Starting migration: Add profile_pic_url to users\n');

        await db.sequelize.authenticate();
        console.log('✅ Database connection established\n');

        // Check if column already exists
        const [results] = await db.sequelize.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME = 'profile_pic_url'
        `);

        if (results.length > 0) {
            console.log('⏭️  Column profile_pic_url already exists. Skipping migration.\n');
            process.exit(0);
        }

        console.log('📝 Adding profile_pic_url column to users table...');

        // Add the column
        await db.sequelize.query(`
            ALTER TABLE users 
            ADD COLUMN profile_pic_url VARCHAR(255) NULL AFTER fcm_token
        `);

        console.log('✅ Column profile_pic_url added successfully\n');

        // Verify the migration
        const [verify] = await db.sequelize.query(`
            DESCRIBE users
        `);

        const hasColumn = verify.some(col => col.Field === 'profile_pic_url');

        if (hasColumn) {
            console.log('📊 Migration completed successfully!');
        } else {
            console.log('❌ Migration failed to verify column existence.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

// Run the migration
migrate();
