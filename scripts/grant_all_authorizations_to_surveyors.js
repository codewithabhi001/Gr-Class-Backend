import 'dotenv/config';
import db from '../src/models/index.js';
import { v4 as uuidv4 } from 'uuid';

async function main() {
    try {
        const surveyors = await db.User.findAll({
            where: { role: 'SURVEYOR' },
            attributes: ['id', 'email', 'name', 'status'],
            order: [['created_at', 'ASC']]
        });

        if (!surveyors.length) {
            console.log('No SURVEYOR users found. Nothing to update.');
            process.exit(0);
        }

        const vesselRows = await db.Vessel.findAll({
            attributes: ['ship_type'],
            where: db.sequelize.where(
                db.sequelize.fn('TRIM', db.sequelize.col('ship_type')),
                { [db.Sequelize.Op.ne]: '' }
            ),
            group: ['ship_type'],
            raw: true
        });

        const allShipTypes = [...new Set(vesselRows.map(r => r.ship_type).filter(Boolean))].sort();

        const certTypes = await db.CertificateType.findAll({
            where: { status: 'ACTIVE' },
            attributes: ['name'],
            raw: true
        });
        const allCertificateNames = [...new Set(certTypes.map(c => c.name).filter(Boolean))].sort();

        console.log(`Found surveyors: ${surveyors.length}`);
        console.log(`Found ship types: ${allShipTypes.length}`);
        console.log(`Found ACTIVE certificate types: ${allCertificateNames.length}`);

        if (allShipTypes.length === 0) {
            console.warn('Warning: No ship types found in vessels table. authorized_ship_types will be set to [].');
        }
        if (allCertificateNames.length === 0) {
            console.warn('Warning: No ACTIVE certificate types found. authorized_certificates will be set to [].');
        }

        const txn = await db.sequelize.transaction();
        try {
            for (const s of surveyors) {
                const [profile, created] = await db.SurveyorProfile.findOrCreate({
                    where: { user_id: s.id },
                    defaults: {
                        user_id: s.id,
                        license_number: `SURV-${uuidv4().substring(0, 6).toUpperCase()}`,
                        valid_from: new Date(),
                        status: 'ACTIVE',
                        is_available: true,
                        authorized_ship_types: allShipTypes,
                        authorized_certificates: allCertificateNames
                    },
                    transaction: txn
                });

                if (!created) {
                    await profile.update(
                        {
                            status: 'ACTIVE',
                            is_available: true,
                            authorized_ship_types: allShipTypes,
                            authorized_certificates: allCertificateNames
                        },
                        { transaction: txn }
                    );
                }

                // Ensure user is not blocked at user-level (job assignment checks profile, but keep them aligned).
                if (s.status !== 'ACTIVE') {
                    await db.User.update({ status: 'ACTIVE' }, { where: { id: s.id }, transaction: txn });
                }

                console.log(
                    `${created ? 'Created' : 'Updated'} profile for surveyor ${s.id} (${s.email || s.name || 'unknown'})`
                );
            }

            await txn.commit();
        } catch (e) {
            await txn.rollback();
            throw e;
        }

        console.log('Done.');
        process.exit(0);
    } catch (error) {
        console.error('Failed:', error);
        process.exit(1);
    }
}

main();

