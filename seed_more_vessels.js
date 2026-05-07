
import db from './src/models/index.js';

async function seedMoreVessels() {
    const clientId = '019dfc47-ab9b-71f8-9f3f-aa509ca79f82';
    const flagAdminId = '019cbf1d-b2d4-716e-a355-6ab44e966963';
    const vessels = [
        {
            vessel_name: 'Vessel Delta',
            imo_number: '9999994',
            mmsi_number: '444444444',
            call_sign: 'DELTA1',
            ship_type: 'Bulk Carrier',
            client_id: clientId,
            flag_administration_id: flagAdminId,
            class_status: 'ACTIVE'
        },
        {
            vessel_name: 'Vessel Epsilon',
            imo_number: '9999995',
            mmsi_number: '555555555',
            call_sign: 'EPSILON1',
            ship_type: 'Container Ship',
            client_id: clientId,
            flag_administration_id: flagAdminId,
            class_status: 'ACTIVE'
        }
    ];

    for (const v of vessels) {
        await db.Vessel.findOrCreate({
            where: { imo_number: v.imo_number },
            defaults: v
        });
    }
    console.log('Seed: Added 2 more vessels.');
    process.exit();
}

seedMoreVessels();
