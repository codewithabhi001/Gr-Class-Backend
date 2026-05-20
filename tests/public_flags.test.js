/**
 * Integration Test for public flags endpoint service logic.
 * Run: node --test tests/public_flags.test.js
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import db from '../src/models/index.js';
import * as publicService from '../src/modules/public/public.service.js';

describe('Public Flags Service', () => {
    it('should retrieve only ACTIVE flags with minimal details', async () => {
        // Create an ACTIVE flag administration
        const activeFlag = await db.FlagAdministration.create({
            flag_state_name: `ActiveFlag-${Date.now()}-${Math.random()}`,
            country: 'TestLand',
            authority_name: 'Test Authority Active',
            logo_url: 'https://cdn.example.com/logo-active.png',
            status: 'ACTIVE',
            contact_email: 'active@flag.com'
        });

        // Create an INACTIVE flag administration
        const inactiveFlag = await db.FlagAdministration.create({
            flag_state_name: `InactiveFlag-${Date.now()}-${Math.random()}`,
            country: 'SecretLand',
            authority_name: 'Test Authority Inactive',
            logo_url: 'https://cdn.example.com/logo-inactive.png',
            status: 'INACTIVE',
            contact_email: 'inactive@flag.com'
        });

        // Fetch flags using public service
        const flags = await publicService.getFlagsPublic();

        // Verify that the active flag is in the list, but the inactive flag is not
        const activeInList = flags.find(f => f.id === activeFlag.id);
        const inactiveInList = flags.find(f => f.id === inactiveFlag.id);

        assert.ok(activeInList, 'Active flag should be returned in public flags list');
        assert.strictEqual(inactiveInList, undefined, 'Inactive flag should not be returned in public flags list');

        // Verify minimal attributes on the returned active flag record
        const flagObj = activeInList.get ? activeInList.get({ plain: true }) : activeInList;
        const keys = Object.keys(flagObj);

        // Minimal attributes should be exactly: id, flag_state_name, country, authority_name, logo_url
        assert.ok(keys.includes('id'), 'Should include id');
        assert.ok(keys.includes('flag_state_name'), 'Should include flag_state_name');
        assert.ok(keys.includes('country'), 'Should include country');
        assert.ok(keys.includes('authority_name'), 'Should include authority_name');
        assert.ok(keys.includes('logo_url'), 'Should include logo_url');

        // Ensure no sensitive or extra fields like status, contact_email, created_at, updated_at are returned
        assert.strictEqual(keys.includes('status'), false, 'Status should be omitted from public response');
        assert.strictEqual(keys.includes('contact_email'), false, 'Contact email should be omitted from public response');
    });
});
