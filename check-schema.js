import db from './src/models/index.js';

(async () => {
  try {
    const models = db.sequelize.models;
    let missingColumnsCount = 0;

    for (const [modelName, model] of Object.entries(models)) {
      if (modelName === 'SequelizeMeta') continue;
      
      const tableName = model.tableName;
      const attributes = model.rawAttributes;
      
      // Get columns from DB
      const [columns] = await db.sequelize.query(`SHOW COLUMNS FROM \`${tableName}\``);
      const dbColumns = columns.map(c => c.Field);
      
      const missingInDb = [];
      
      for (const [attrName, attrDef] of Object.entries(attributes)) {
        // Find the actual field name (taking underscored into account, though rawAttributes usually has field)
        const fieldName = attrDef.field || attrName;
        
        // Skip virtual types
        if (attrDef.type.constructor.name === 'VIRTUAL') continue;
        
        if (!dbColumns.includes(fieldName)) {
          missingInDb.push(fieldName);
        }
      }
      
      if (missingInDb.length > 0) {
        console.log(`❌ Model: ${modelName} (Table: ${tableName}) is missing columns in DB: ${missingInDb.join(', ')}`);
        missingColumnsCount++;
      } else {
        console.log(`✅ Model: ${modelName} - All columns present in DB.`);
      }
    }

    if (missingColumnsCount === 0) {
      console.log('\n🎉 ALL models match the database schema perfectly! No missing columns found.');
    } else {
      console.log(`\n⚠️ Found ${missingColumnsCount} model(s) with missing columns.`);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
})();
