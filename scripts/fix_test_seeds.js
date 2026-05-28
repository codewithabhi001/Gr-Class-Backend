import db from '../src/models/index.js';

async function fix() {
    try {
        console.log('--- Fixing/Ensuring Test Seeds ---');

        // 1. Ensure Client
        const [client] = await db.Client.findOrCreate({
            where: { company_code: 'PACIFIC' },
            defaults: {
                company_name: 'Pacific Shipping Ltd',
                email: 'ops@pacific.com',
                status: 'ACTIVE'
            }
        });
        console.log(`Client ensured: ${client.id}`);

        // 2. Ensure FlagAdministration
        const [flag] = await db.FlagAdministration.findOrCreate({
            where: { flag_state_name: 'Panama' },
            defaults: {
                country: 'Panama',
                authority_name: 'Panama Maritime Authority',
                contact_email: 'info@pma.pa',
                status: 'ACTIVE',
                logo_url: 'https://dummy-bucket.s3.amazonaws.com/panama-logo.png'
            }
        });
        console.log(`Flag Administration ensured: ${flag.id}`);

        // 3. Ensure Vessel
        const [vessel] = await db.Vessel.findOrCreate({
            where: { imo_number: '1234567' },
            defaults: {
                vessel_name: 'MV GR-Workshop',
                client_id: client.id,
                flag_administration_id: flag.id,
                call_sign: 'GRWK',
                mmsi_number: '123456789',
                port_of_registry: 'Panama',
                year_built: 2010,
                ship_type: 'Cargo',
                class_status: 'ACTIVE',
                current_class_society: 'GR-Class'
            }
        });
        console.log(`Vessel ensured: ${vessel.id}`);

        // 4. Ensure Surveyor Profile for all active surveyors
        const surveyors = await db.User.findAll({ where: { role: 'SURVEYOR', status: 'ACTIVE' } });
        for (const s of surveyors) {
            const [profile, created] = await db.SurveyorProfile.findOrCreate({
                where: { user_id: s.id },
                defaults: {
                    status: 'ACTIVE',
                    is_available: true,
                    authorized_ship_types: JSON.stringify(['Cargo', 'Tanker']),
                    authorized_certificates: JSON.stringify(['Load Line', 'Class Certificate'])
                }
            });
            if (created) {
                console.log(`Surveyor Profile created for user ${s.name}`);
            } else {
                console.log(`Surveyor Profile already exists for user ${s.name}`);
                await profile.update({ is_available: true, status: 'ACTIVE' });
            }
        }

        console.log('--- Fix Complete ---');
    } catch (e) {
        console.error('Error during fix:', e);
    } finally {
        process.exit(0);
    }
}

fix();
