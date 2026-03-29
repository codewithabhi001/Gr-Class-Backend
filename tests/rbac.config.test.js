/**
 * Single source of truth for role lists — sanity checks.
 * Run: node --test tests/rbac.config.test.js
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { RBAC, isRoleAllowed } from '../src/config/rbac.config.js';

describe('rbac.config', () => {
    it('AUTHORIZE_SURVEY matches route + service contract', () => {
        assert.ok(isRoleAllowed(RBAC.AUTHORIZE_SURVEY, 'ADMIN'));
        assert.ok(isRoleAllowed(RBAC.AUTHORIZE_SURVEY, 'TM'));
        assert.strictEqual(isRoleAllowed(RBAC.AUTHORIZE_SURVEY, 'GM'), false);
    });

    it('GENERATE_CERTIFICATE includes GM', () => {
        assert.ok(isRoleAllowed(RBAC.GENERATE_CERTIFICATE, 'GM'));
    });
});
