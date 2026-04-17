import db from '../src/models/index.js';

async function syncMissingColumns() {
    const queryInterface = db.sequelize.getQueryInterface();
    const missingColumns = [];

    console.log('Starting full mapping audit of all tables and attempting to ADD missing columns...\n');

    for (const modelName of Object.keys(db)) {
        if (modelName === 'sequelize' || modelName === 'Sequelize') continue;
        
        const Model = db[modelName];
        if (!Model.tableName) continue;

        let tableDescription;
        try {
            tableDescription = await queryInterface.describeTable(Model.tableName);
        } catch (err) {
            console.log(`[WARN] Table does not exist in DB: ${Model.tableName}. Consider running normal migrations first.`);
            continue;
        }

        const modelAttributes = Model.rawAttributes;

        for (const attrName in modelAttributes) {
            const attr = modelAttributes[attrName];
            const dbColumnName = attr.field || attrName;
            
            // Skip foreign keys and standard generic stuff sometimes handled differently, though usually fine.
            // But we MUST check if it exists in the tableDescription.
            if (!tableDescription[dbColumnName]) {
                console.log(`❌ Missing column detected: ${Model.tableName}.${dbColumnName}`);
                missingColumns.push({
                    table: Model.tableName,
                    column: dbColumnName,
                    attrOptions: attr
                });
            }
        }
    }

    if (missingColumns.length === 0) {
        console.log('✅ Audit complete. All columns exist in the database.');
        process.exit(0);
    } 

    console.log(`\nAttempting to automatically ADD ${missingColumns.length} missing columns...`);
    
    for (const miss of missingColumns) {
        try {
            console.log(`Adding ${miss.table}.${miss.column} ...`);
            await queryInterface.addColumn(miss.table, miss.column, {
                type: miss.attrOptions.type,
                allowNull: miss.attrOptions.allowNull !== undefined ? miss.attrOptions.allowNull : true,
                defaultValue: miss.attrOptions.defaultValue,
                comment: miss.attrOptions.comment
            });
            console.log(`✅ Successfully added ${miss.table}.${miss.column}`);
        } catch (err) {
            console.error(`❌ Failed to add ${miss.table}.${miss.column} - Error: ${err.message}`);
        }
    }

    console.log('\nMigration / Sync process finished.');
    process.exit(0);
}

syncMissingColumns().catch(err => {
    console.error('Audit/Sync failed:', err);
    process.exit(1);
});
