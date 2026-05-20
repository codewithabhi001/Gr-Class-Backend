import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const sqlFilePath = './Gr_class_Prod_site_static_contents.sql';

async function run() {
  console.log('Connecting to database...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    multipleStatements: true
  });

  try {
    console.log('Reading SQL file...');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Executing SQL statements...');
    await connection.query(sql);
    console.log('SQL statements executed successfully!');
  } catch (error) {
    console.error('Error executing SQL:', error);
  } finally {
    await connection.end();
  }
}

run();
