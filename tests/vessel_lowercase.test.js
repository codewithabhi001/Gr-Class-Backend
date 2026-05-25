/**
 * Integration Test for Vessel Lowercase and Trim hook.
 * Run: node --test tests/vessel_lowercase.test.js
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { v7 as uuidv7 } from 'uuid';
import db from '../src/models/index.js';

describe('Vessel Model Hooks - Lowercase & Trim', () => {
    it('should lowercase and trim string fields when creating a vessel', async () => {
        const clientId = uuidv7();
        const flagId = uuidv7();
        const vesselId = uuidv7();

        // 1. Create client and flag administration first
        await db.Client.create({
            id: clientId,
            company_name: `Test Client ${Date.now()}`,
            company_code: `TC-${Date.now().toString().slice(-4)}`,
            email: `client_${Date.now()}@test.com`,
            status: 'ACTIVE'
        });

        await db.FlagAdministration.create({
            id: flagId,
            flag_state_name: `Panama State ${Date.now()}`,
            country: 'Panama',
            authority_name: 'Panama Maritime',
            contact_email: `panama_${Date.now()}@flag.com`,
            status: 'ACTIVE'
        });

        try {
            // 2. Create a vessel with mixed casing and trailing spaces
            const imoNum = `${Math.floor(1000000 + Math.random() * 8999999)}`;
            await db.Vessel.create({
                id: vesselId,
                client_id: clientId,
                flag_administration_id: flagId,
                vessel_name: '  Mv Ocean QUEEN  ',
                imo_number: imoNum,
                call_sign: '  XyZ123  ',
                mmsi_number: '123456789',
                port_of_registry: '  SINGAPORE Port  ',
                ship_type: '  BULK carrier  ',
                current_class_society: '  American BUREAU of Shipping  ',
                engine_type: '  WARTSILA 9RND90  ',
                builder_name: '  HYUNDAI Heavy Industries  ',
                class_status: 'ACTIVE'
            });

            // 3. Fetch from database to verify values are stored in lowercase and trimmed
            const vessel = await db.Vessel.findByPk(vesselId);
            assert.ok(vessel, 'Vessel should be created');

            assert.strictEqual(vessel.vessel_name, 'mv ocean queen');
            assert.strictEqual(vessel.call_sign, 'xyz123');
            assert.strictEqual(vessel.port_of_registry, 'singapore port');
            assert.strictEqual(vessel.ship_type, 'bulk carrier');
            assert.strictEqual(vessel.current_class_society, 'american bureau of shipping');
            assert.strictEqual(vessel.engine_type, 'wartsila 9rnd90');
            assert.strictEqual(vessel.builder_name, 'hyundai heavy industries');

            // Class status is an ENUM and should remain unchanged
            assert.strictEqual(vessel.class_status, 'ACTIVE');

        } finally {
            // 4. Clean up
            await db.Vessel.destroy({ where: { id: vesselId } });
            await db.FlagAdministration.destroy({ where: { id: flagId } });
            await db.Client.destroy({ where: { id: clientId } });
        }
    });

    it('should lowercase and trim string fields when updating a vessel', async () => {
        const clientId = uuidv7();
        const flagId = uuidv7();
        const vesselId = uuidv7();

        // 1. Create client and flag administration first
        await db.Client.create({
            id: clientId,
            company_name: `Test Client ${Date.now()}`,
            company_code: `TC-${Date.now().toString().slice(-4)}`,
            email: `client_${Date.now()}@test.com`,
            status: 'ACTIVE'
        });

        await db.FlagAdministration.create({
            id: flagId,
            flag_state_name: `Panama State ${Date.now()}`,
            country: 'Panama',
            authority_name: 'Panama Maritime',
            contact_email: `panama_${Date.now()}@flag.com`,
            status: 'ACTIVE'
        });

        try {
            // 2. Create vessel in lowercase
            const imoNum = `${Math.floor(1000000 + Math.random() * 8999999)}`;
            const vessel = await db.Vessel.create({
                id: vesselId,
                client_id: clientId,
                flag_administration_id: flagId,
                vessel_name: 'mv ocean queen',
                imo_number: imoNum,
                call_sign: 'xyz123',
                mmsi_number: '123456789',
                port_of_registry: 'singapore port',
                ship_type: 'bulk carrier',
                current_class_society: 'american bureau of shipping',
                engine_type: 'wartsila 9rnd90',
                builder_name: 'hyundai heavy industries',
                class_status: 'ACTIVE'
            });

            // 3. Update with mixed casing and spaces
            await vessel.update({
                vessel_name: '  Mv STAR King  ',
                call_sign: '  AbCdEfG  ',
                port_of_registry: '  LONDON port  '
            });

            // 4. Fetch and verify
            const updatedVessel = await db.Vessel.findByPk(vesselId);
            assert.strictEqual(updatedVessel.vessel_name, 'mv star king');
            assert.strictEqual(updatedVessel.call_sign, 'abcdefg');
            assert.strictEqual(updatedVessel.port_of_registry, 'london port');

        } finally {
            // 5. Clean up
            await db.Vessel.destroy({ where: { id: vesselId } });
            await db.FlagAdministration.destroy({ where: { id: flagId } });
            await db.Client.destroy({ where: { id: clientId } });
        }
    });

    it('should lowercase and trim string fields when creating a User, Client, and FlagAdministration', async () => {
        const clientId = uuidv7();
        const flagId = uuidv7();
        const userId = uuidv7();

        try {
            // 1. Create client with mixed casing
            await db.Client.create({
                id: clientId,
                company_name: '  GIRIK Maritime Services  ',
                company_code: '  GMS-101  ',
                email: '  INFO@GIRIKMARITIME.COM  ',
                contact_person_name: '  JOHN doe  ',
                contact_person_email: '  JOHN.DOE@GIRIK.COM  ',
                country: '  SINGAPORE  ',
                status: 'ACTIVE'
            });

            // Verify Client
            const client = await db.Client.findByPk(clientId);
            assert.strictEqual(client.company_name, 'girik maritime services');
            assert.strictEqual(client.company_code, 'gms-101');
            assert.strictEqual(client.email, 'info@girikmaritime.com');
            assert.strictEqual(client.contact_person_name, 'john doe');
            assert.strictEqual(client.contact_person_email, 'john.doe@girik.com');
            assert.strictEqual(client.country, 'singapore');

            // 2. Create flag with mixed casing
            await db.FlagAdministration.create({
                id: flagId,
                flag_state_name: '  Panama STATE  ',
                country: '  PANAMA  ',
                authority_name: '  Panama MARITIME Authority  ',
                contact_email: '  CONTACT@PANAMAFLAG.COM  ',
                status: 'ACTIVE'
            });

            // Verify Flag
            const flag = await db.FlagAdministration.findByPk(flagId);
            assert.strictEqual(flag.flag_state_name, 'panama state');
            assert.strictEqual(flag.country, 'panama');
            assert.strictEqual(flag.authority_name, 'panama maritime authority');
            assert.strictEqual(flag.contact_email, 'contact@panamaflag.com');

            // 3. Create User with mixed casing
            await db.User.create({
                id: userId,
                name: 'Jane Smith',
                email: '  JANE.SMITH@TEST.COM  ',
                role: 'ADMIN',
                password_hash: 'x'
            });

            // Verify User
            const user = await db.User.findByPk(userId);
            assert.strictEqual(user.email, 'jane.smith@test.com');

        } finally {
            // Clean up
            await db.User.destroy({ where: { id: userId } });
            await db.FlagAdministration.destroy({ where: { id: flagId } });
            await db.Client.destroy({ where: { id: clientId } });
        }
    });
});
