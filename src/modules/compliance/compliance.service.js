import db from '../../models/index.js';

export const exportUserData = async (userId) => {
    const user = await db.User.findByPk(userId, {
        include: [
            { model: db.JobRequest, as: 'ClientJobs' },
            { model: db.SupportTicket, as: 'Tickets' }
        ]
    });
    if (!user) throw { statusCode: 404, message: 'User not found' };

    const plainUser = user.get({ plain: true });
    plainUser.RequestedJobs = plainUser.ClientJobs;
    delete plainUser.ClientJobs;

    return plainUser;
};

export const anonymizeUser = async (userId) => {
    const user = await db.User.findByPk(userId, { useMaster: true });
    if (!user) throw { statusCode: 404, message: 'User not found' };

    await user.update({
        name: 'ANONYMOUS',
        email: `anon-${userId}@gr-class.internal`,
        phone: '0000000000',
        status: 'INACTIVE'
    });

    return { success: true, message: 'User data anonymized' };
};
