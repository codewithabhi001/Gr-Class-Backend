import db from './src/models/index.js';

async function fixSurveyorTables() {
  try {
    await db.sequelize.authenticate();
    console.log('Connected to DB.');

    // 1. Fix surveyor_profiles
    console.log('Fixing surveyor_profiles...');
    try {
      await db.sequelize.query(`ALTER TABLE surveyor_profiles ADD COLUMN license_copy_url VARCHAR(255) NULL`);
      console.log('  Added license_copy_url');
    } catch (e) {
      console.log('  license_copy_url exists or error:', e.message);
    }

    try {
      await db.sequelize.query(`ALTER TABLE surveyor_profiles ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
      console.log('  Added created_at');
    } catch (e) {
      console.log('  created_at exists or error:', e.message);
    }

    try {
      await db.sequelize.query(`ALTER TABLE surveyor_profiles ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
      console.log('  Added updated_at');
    } catch (e) {
      console.log('  updated_at exists or error:', e.message);
    }

    // 2. Fix surveyor_applications
    console.log('Fixing surveyor_applications...');
    try {
      await db.sequelize.query(`ALTER TABLE surveyor_applications ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
      console.log('  Added created_at');
    } catch (e) {
      console.log('  created_at exists or error:', e.message);
    }

    try {
      await db.sequelize.query(`ALTER TABLE surveyor_applications ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
      console.log('  Added updated_at');
    } catch (e) {
      console.log('  updated_at exists or error:', e.message);
    }

  } catch (error) {
    console.error('Task failed:', error);
  } finally {
    await db.sequelize.close();
  }
}

fixSurveyorTables();
