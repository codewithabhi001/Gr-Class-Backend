import db from '../../models/index.js';
import * as notificationService from '../../services/notification.service.js';

const Toca = db.Toca;

export const createToca = async (data, userId) => {
    const toca = await Toca.create({ ...data, requested_by: userId, status: 'PENDING' });
    return toca;
};

export const updateStatus = async (id, status, userId) => {
    const toca = await Toca.findByPk(id, { useMaster: true });
    if (!toca) throw { statusCode: 404, message: 'TOCA not found' };

    await toca.update({ status, decision_date: new Date(), decided_by: userId });

    notificationService.notifyRoles(['GM'], 'TOCA Status Update', `TOCA ${id} is now ${status}`);

    return toca;
};

export const getTocas = async (query) => {
    return await Toca.findAll({
        limit: 10,
        attributes: ['id', 'vessel_id', 'losing_class_society', 'gaining_class_society', 'request_date', 'status', 'decision_date'],
        useReplica: true
    });
};
