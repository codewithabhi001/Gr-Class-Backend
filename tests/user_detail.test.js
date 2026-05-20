/**
 * Integration Test for User Detail endpoint service logic.
 * Run: node --test tests/user_detail.test.js
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { v7 as uuidv7 } from 'uuid';
import db from '../src/models/index.js';
import * as userService from '../src/modules/users/user.service.js';

describe('User Detail Service (getUserById)', () => {
    it('should successfully retrieve a user with no password_hash', async () => {
        const userId = uuidv7();
        const userEmail = `user_${Date.now()}@test.com`;

        // Create user in DB
        await db.User.create({
            id: userId,
            name: 'Test Admin User',
            email: userEmail,
            role: 'ADMIN',
            password_hash: 'super_secret_hash',
            status: 'ACTIVE'
        });

        // Call getUserById service
        const retrieved = await userService.getUserById(userId);
        assert.ok(retrieved, 'Should retrieve the user');
        assert.strictEqual(retrieved.id, userId);
        assert.strictEqual(retrieved.email, userEmail);
        assert.strictEqual(retrieved.password_hash, undefined, 'password_hash must be excluded');

        // Clean up
        await db.User.destroy({ where: { id: userId } });
    });

    it('should include Client association with company details when user has role CLIENT', async () => {
        const clientId = uuidv7();
        const userId = uuidv7();
        const userEmail = `client_user_${Date.now()}@test.com`;

        // Create client first
        await db.Client.create({
            id: clientId,
            company_name: 'Test Logistics Corp',
            company_code: `TLC-${Date.now().toString().slice(-4)}`,
            email: `contact_${Date.now()}@testlogistics.com`,
            status: 'ACTIVE'
        });

        // Create user referencing client
        await db.User.create({
            id: userId,
            name: 'Test Client User',
            email: userEmail,
            role: 'CLIENT',
            password_hash: 'client_pass_hash',
            status: 'ACTIVE',
            client_id: clientId
        });

        // Call getUserById
        const retrieved = await userService.getUserById(userId);
        assert.ok(retrieved, 'Should retrieve the user');
        assert.strictEqual(retrieved.id, userId);
        assert.ok(retrieved.Client, 'Client association must be included');
        assert.strictEqual(retrieved.Client.id, clientId);
        assert.strictEqual(retrieved.Client.company_name, 'Test Logistics Corp');
        assert.strictEqual(retrieved.password_hash, undefined, 'password_hash must be excluded');

        // Clean up
        await db.User.destroy({ where: { id: userId } });
        await db.Client.destroy({ where: { id: clientId } });
    });

    it('should include SurveyorProfile association when user has role SURVEYOR', async () => {
        const userId = uuidv7();
        const surveyorProfileId = uuidv7();
        const userEmail = `surveyor_user_${Date.now()}@test.com`;

        // Create user
        await db.User.create({
            id: userId,
            name: 'Test Surveyor User',
            email: userEmail,
            role: 'SURVEYOR',
            password_hash: 'surveyor_pass_hash',
            status: 'ACTIVE'
        });

        // Create surveyor profile referencing user
        await db.SurveyorProfile.create({
            id: surveyorProfileId,
            user_id: userId,
            license_number: 'LIC-9999',
            authorized_ship_types: ['Cargo', 'Tanker'],
            authorized_certificates: ['Safety Cert'],
            valid_from: '2026-01-01',
            valid_to: '2027-01-01',
            status: 'ACTIVE'
        });

        // Call getUserById
        const retrieved = await userService.getUserById(userId);
        assert.ok(retrieved, 'Should retrieve the user');
        assert.strictEqual(retrieved.id, userId);
        assert.ok(retrieved.SurveyorProfile, 'SurveyorProfile association must be included');
        assert.strictEqual(retrieved.SurveyorProfile.id, surveyorProfileId);
        assert.strictEqual(retrieved.SurveyorProfile.license_number, 'LIC-9999');
        assert.strictEqual(retrieved.password_hash, undefined, 'password_hash must be excluded');

        // Clean up
        await db.SurveyorProfile.destroy({ where: { id: surveyorProfileId } });
        await db.User.destroy({ where: { id: userId } });
    });

    it('should throw a 404 error if user does not exist', async () => {
        const fakeId = uuidv7();
        try {
            await userService.getUserById(fakeId);
            assert.fail('Should have failed with 404');
        } catch (e) {
            assert.strictEqual(e.statusCode, 404);
            assert.strictEqual(e.message, 'User not found');
        }
    });
});
