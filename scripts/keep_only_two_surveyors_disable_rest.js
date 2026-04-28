import 'dotenv/config';
import db from '../src/models/index.js';

const KEEP_EMAILS = new Set([
    'abhivishwkarmaa52@gmail.com',
    'abhisheksingh9709844475@gmail.com'
].map(e => e.toLowerCase()));

async function main() {
    try {
        const allSurveyors = await db.User.findAll({
            where: { role: 'SURVEYOR' },
            attributes: ['id', 'email', 'name', 'status'],
            order: [['created_at', 'ASC']]
        });

        if (!allSurveyors.length) {
            console.log('No SURVEYOR users found. Nothing to do.');
            process.exit(0);
        }

        const keep = allSurveyors.filter(u => (u.email || '').toLowerCase() && KEEP_EMAILS.has(u.email.toLowerCase()));
        const disable = allSurveyors.filter(u => !KEEP_EMAILS.has((u.email || '').toLowerCase()));

        if (keep.length !== 2) {
            throw new Error(
                `Expected to keep exactly 2 surveyors by email. Found ${keep.length}. ` +
                `Found emails: ${keep.map(k => k.email).join(', ')}`
            );
        }

        const primaryKeep = keep[0]; // used for reassignment

        console.log(`Keeping 2 surveyors: ${keep.map(k => `${k.email} (${k.id})`).join(' | ')}`);
        console.log(`Disabling ${disable.length} other surveyors...`);

        const disableIds = disable.map(u => u.id);

        const txn = await db.sequelize.transaction();
        try {
            // 1) Reassign surveys (cannot be NULL due to FK + allowNull: false)
            const reassignedSurveys = await db.Survey.update(
                { surveyor_id: primaryKeep.id },
                { where: { surveyor_id: { [db.Sequelize.Op.in]: disableIds } }, transaction: txn }
            );

            // 2) Unassign jobs (safe: FK is SET NULL)
            const unassignedJobs = await db.JobRequest.update(
                { assigned_surveyor_id: null },
                { where: { assigned_surveyor_id: { [db.Sequelize.Op.in]: disableIds } }, transaction: txn }
            );

            // 3) Disable surveyor profiles (if exist)
            await db.SurveyorProfile.update(
                {
                    status: 'INACTIVE',
                    is_available: false,
                    authorized_ship_types: [],
                    authorized_certificates: []
                },
                { where: { user_id: { [db.Sequelize.Op.in]: disableIds } }, transaction: txn }
            );

            // 4) Disable users
            await db.User.update(
                { status: 'INACTIVE' },
                { where: { id: { [db.Sequelize.Op.in]: disableIds } }, transaction: txn }
            );

            // 5) Ensure kept ones are ACTIVE + available
            await db.User.update(
                { status: 'ACTIVE' },
                { where: { id: { [db.Sequelize.Op.in]: keep.map(k => k.id) } }, transaction: txn }
            );
            await db.SurveyorProfile.update(
                { status: 'ACTIVE', is_available: true },
                { where: { user_id: { [db.Sequelize.Op.in]: keep.map(k => k.id) } }, transaction: txn }
            );

            await txn.commit();

            console.log(`Reassigned surveys result: ${JSON.stringify(reassignedSurveys)}`);
            console.log(`Unassigned jobs result: ${JSON.stringify(unassignedJobs)}`);
            console.log('Done.');
            process.exit(0);
        } catch (e) {
            await txn.rollback();
            throw e;
        }
    } catch (error) {
        console.error('Failed:', error);
        process.exit(1);
    }
}

main();

