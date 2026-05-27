/**
 * Integration Test for Client Search service logic.
 * Run: node --test tests/client_search.test.js
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { v7 as uuidv7 } from 'uuid';
import db from '../src/models/index.js';
import * as clientService from '../src/modules/clients/client.service.js';

describe('Client Search Service (getClients)', () => {
    it('should filter clients by search term', async () => {
        const client1Id = uuidv7();
        const client2Id = uuidv7();
        const searchName = `JPL-WOr-${Date.now()}`;
        const searchCode = `JC-${Date.now().toString().slice(-4)}`;
        const searchEmail = `contact_${Date.now()}@jplwor.com`;

        // Create two clients
        await db.Client.create({
            id: client1Id,
            company_name: searchName,
            company_code: searchCode,
            email: searchEmail,
            status: 'ACTIVE'
        });

        await db.Client.create({
            id: client2Id,
            company_name: `Other Corp ${Date.now()}`,
            company_code: `OC-${Date.now().toString().slice(-4)}`,
            email: `other_${Date.now()}@othercorp.com`,
            status: 'ACTIVE'
        });

        try {
            // Test searching by company name
            const resultByName = await clientService.getClients({ search: 'JPL-WOr' });
            assert.ok(resultByName.rows.length >= 1, 'Should find at least one client');
            const found1 = resultByName.rows.find(c => c.id === client1Id);
            assert.ok(found1, 'Should find client1 by name search');
            // DB normalizes client names to lowercase; compare case-insensitively
            assert.strictEqual(String(found1.company_name).toLowerCase(), searchName.toLowerCase());

            // Test searching by company code
            const resultByCode = await clientService.getClients({ search: searchCode });
            assert.ok(resultByCode.rows.length >= 1, 'Should find client1 by code search');
            const found2 = resultByCode.rows.find(c => c.id === client1Id);
            assert.ok(found2);

            // Test searching by email
            const resultByEmail = await clientService.getClients({ search: 'jplwor.com' });
            assert.ok(resultByEmail.rows.length >= 1, 'Should find client1 by email domain');
            const found3 = resultByEmail.rows.find(c => c.id === client1Id);
            assert.ok(found3);

            // Test searching with a query that matches nothing
            const resultNone = await clientService.getClients({ search: 'nonexistent-company-query-xyz' });
            const found4 = resultNone.rows.find(c => c.id === client1Id || c.id === client2Id);
            assert.strictEqual(found4, undefined, 'Should not match any test clients');

        } finally {
            // Clean up
            await db.Client.destroy({ where: { id: [client1Id, client2Id] } });
        }
    });
});
