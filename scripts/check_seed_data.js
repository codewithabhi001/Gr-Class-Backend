import db from '../src/models/index.js';

async function check() {
    try {
        const { Op } = db.Sequelize;
        const vessel = await db.Vessel.findOne({ where: { class_status: 'ACTIVE' } });
        const certType = await db.CertificateType.findOne({ where: { status: 'ACTIVE', requires_survey: true } });
        const surveyorProfile = await db.SurveyorProfile.findOne({
            where: { status: 'ACTIVE', is_available: true },
            include: [{
                model: db.User,
                required: true,
                attributes: ['id', 'name'],
                where: { role: 'SURVEYOR', status: 'ACTIVE'}
            }]
        });
        const toUser = await db.User.findOne({ where: { role: 'TO', status: 'ACTIVE' } });
        const gmUser = await db.User.findOne({ where: { role: 'GM', status: 'ACTIVE' } });
        const tmUser = await db.User.findOne({ where: { role: 'TM', status: 'ACTIVE' } });
        const adminUser = await db.User.findOne({ where: { role: 'ADMIN', status: 'ACTIVE' } });

        console.log({
            vessel: !!vessel,
            certType: !!certType,
            surveyorProfile: !!surveyorProfile,
            toUser: !!toUser,
            gmUser: !!gmUser,
            tmUser: !!tmUser,
            adminUser: !!adminUser
        });

        if (!surveyorProfile) {
            const allProfiles = await db.SurveyorProfile.findAll({
                include: [{
                    model: db.User,
                    attributes: ['id', 'name', 'role', 'status']
                }]
            });
            console.log('All surveyor profiles:', allProfiles.map(p => ({
                id: p.id,
                status: p.status,
                is_available: p.is_available,
                user: p.User ? { name: p.User.name, role: p.User.role, status: p.User.status } : null
            })));
        }

        const allUsers = await db.User.findAll({ attributes: ['id', 'name', 'role', 'status'] });
        console.log('All Users summary:', allUsers.map(u => ({ name: u.name, role: u.role, status: u.status })));

    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

check();
