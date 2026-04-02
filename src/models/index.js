import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Sequelize from 'sequelize';
import env from '../config/env.js';

import { v7 as uuidv7 } from 'uuid';

// Polyfill UUIDV7 for Sequelize
Sequelize.DataTypes.UUIDV7 = uuidv7;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbConfig = env.database;

const sequelize = new Sequelize(dbConfig.name, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectOptions: dbConfig.sslCa ? {
        ssl: {
            ca: fs.readFileSync(path.resolve(dbConfig.sslCa))
        }
    } : {},
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    // Add connection pool settings to avoid frequent handshakes with remote RDS
    pool: {
        max: 20,
        min: 2,
        idle: 300000,   // Wait 5 minutes before closing idle connections (default 10s)
        acquire: 60000,
    },
});

const db = {};

const loadModels = async () => {
    const files = fs.readdirSync(__dirname)
        .filter(file => {
            return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
        });

    for (const file of files) {
        const modelModule = await import(path.join(__dirname, file));
        const model = modelModule.default(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    }

    Object.keys(db).forEach(modelName => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });

    // Attach Immutable Audit Trail hooks to Critical Workflow states
    const auditableModels = ['JobRequest', 'Survey', 'Certificate'];
    auditableModels.forEach(modelName => {
        const Model = db[modelName];
        if (!Model) return;

        const auditAction = async (instance, options, action) => {
            if (!db.AuditLog) return;
            const auditData = {
                action,
                entity_name: modelName,
                entity_id: instance.id,
                old_values: action === 'CREATE' ? null : (instance._previousDataValues || null),
                new_values: action === 'DELETE' ? null : (instance.dataValues || null),
                user_id: options?.user_id || null, // Passed in queries: { user_id: req.user.id }
                ip_address: options?.ip_address || null,
                user_agent: options?.user_agent || null
            };
            await db.AuditLog.create(auditData, { transaction: options?.transaction });
        };

        Model.addHook('afterCreate', async (instance, options) => auditAction(instance, options, 'CREATE'));
        Model.addHook('afterUpdate', async (instance, options) => auditAction(instance, options, 'UPDATE'));
        Model.addHook('afterDestroy', async (instance, options) => auditAction(instance, options, 'DELETE'));
    });

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;
};

// We need to export a promise or await this initialization in app.js
// But usually models are synch loaded in CJS. In ESM, top-level await is available in Node 14.8+
await loadModels();

export default db;
