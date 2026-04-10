import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function run() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Checking for rating column...');
        const [columns] = await connection.query('DESCRIBE portfolio_feedbacks');
        const hasRating = columns.some(col => col.Field === 'rating');

        if (hasRating) {
            console.log('Column "rating" already exists in "portfolio_feedbacks".');
        } else {
            console.log('Adding "rating" column to "portfolio_feedbacks"...');
            await connection.query('ALTER TABLE portfolio_feedbacks ADD COLUMN rating INT NULL AFTER comment');
            console.log('Column "rating" added successfully.');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}

run();
