import { describe, it } from 'node:test';
import assert from 'node:assert';
import db from '../src/models/index.js';
import * as userService from '../src/modules/users/user.service.js';

describe('User Creation Profile Hook', () => {
    it('should automatically create a SurveyorProfile when role is SURVEYOR', async () => {
        const email = `test_surveyor_${Date.now()}@girik.com`;
        const data = {
            name: 'Automatic Surveyor',
            email,
            password: 'Password123!',
            role: 'SURVEYOR',
            phone: '9876543210',
            license_number: 'TEST-AUTO-SURV',
            nationality: 'Indian',
            qualification: 'B.Sc. Nautical Science',
            years_of_experience: 5
        };

        const result = await userService.createUser(data);
        assert.ok(result.user, 'Should return registered user');
        assert.strictEqual(result.user.email, email);

        // Verify user exists in db
        const user = await db.User.findOne({ where: { email } });
        assert.ok(user, 'User should be in database');

        // Verify SurveyorProfile was created
        const profile = await db.SurveyorProfile.findOne({ where: { user_id: user.id } });
        assert.ok(profile, 'SurveyorProfile should be created automatically');
        assert.strictEqual(profile.license_number, 'TEST-AUTO-SURV');
        assert.strictEqual(profile.nationality, 'Indian');
        assert.strictEqual(profile.qualification, 'B.Sc. Nautical Science');
        assert.strictEqual(profile.years_of_experience, 5);

        // Clean up
        await db.SurveyorProfile.destroy({ where: { user_id: user.id } });
        await db.User.destroy({ where: { id: user.id } });
    });

    it('should NOT create a SurveyorProfile when role is ADMIN', async () => {
        const email = `test_admin_${Date.now()}@girik.com`;
        const data = {
            name: 'Automatic Admin',
            email,
            password: 'Password123!',
            role: 'ADMIN',
            phone: '9876543211'
        };

        const result = await userService.createUser(data);
        assert.ok(result.user, 'Should return registered user');

        const user = await db.User.findOne({ where: { email } });
        assert.ok(user, 'User should be in database');

        const profile = await db.SurveyorProfile.findOne({ where: { user_id: user.id } });
        assert.strictEqual(profile, null, 'SurveyorProfile should NOT be created for ADMIN role');

        // Clean up
        await db.User.destroy({ where: { id: user.id } });
    });
});
