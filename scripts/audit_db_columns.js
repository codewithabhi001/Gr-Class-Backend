import db from '../src/models/index.js';

async function auditDatabase() {
    const queryInterface = db.sequelize.getQueryInterface();
    const missingColumns = [];

    console.log('Starting explicit full mapping audit of all tables and columns against Sequelize models...\n');

    for (const modelName of Object.keys(db)) {
        if (modelName === 'sequelize' || modelName === 'Sequelize') continue;
        
        const Model = db[modelName];
        if (!Model.tableName) continue;

        let tableDescription;
        try {
            tableDescription = await queryInterface.describeTable(Model.tableName);
        } catch (err) {
            console.error(`[ERROR] Table does not exist in DB: ${Model.tableName}`);
            missingColumns.push({
                table: Model.tableName,
                column: 'ENTIRE_TABLE_MISSING',
                type: 'TABLE'
            });
            continue;
        }

        const modelAttributes = Model.rawAttributes;

        for (const attrName in modelAttributes) {
            const attr = modelAttributes[attrName];
            // Sequelize maps column names in rawAttributes using field property if defined
            const dbColumnName = attr.field || attrName;
            
            if (!tableDescription[dbColumnName]) {
                missingColumns.push({
                    table: Model.tableName,
                    column: dbColumnName,
                    type: attr.type.toSql(),
                    allowNull: attr.allowNull,
                    defaultValue: attr.defaultValue
                });
            }
        }
    }

    if (missingColumns.length === 0) {
        console.log('✅ Audit complete. All columns exist in the database.');
    } else {
        console.log('❌ Missing columns found:');
        console.log(JSON.stringify(missingColumns, null, 2));
    }

    process.exit(0);
}

auditDatabase().catch(err => {
    console.error('Audit failed:', err);
    process.exit(1);
});
