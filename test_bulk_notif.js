import db from './src/models/index.js';
import { notifyRoles } from './src/services/notification.service.js';

async function testNotifyRoles() {
    console.log('Testing notifyRoles optimization...');

    // We expect a single bulk insert for notifications
    await notifyRoles(['ADMIN', 'GM'], 'Bulk Test', 'Testing bulkCreate and Parallel dispatch');

    console.log('Done.');
    process.exit(0);
}

testNotifyRoles();
