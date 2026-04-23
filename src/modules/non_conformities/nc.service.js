import db from '../../models/index.js';
import * as notificationService from '../../services/notification.service.js';

const NonConformity = db.NonConformity;

export const createNC = async (data, user) => {
    const nc = await NonConformity.create({ ...data, status: 'OPEN' });

    // Notify (non-blocking)
    notificationService.notifyRoles(['TM', 'TO'], 'New Non-Conformity', `NC raised for Job ${data.job_id} by ${user.name}`);

    return nc;
};

export const closeNC = async (id, remarks) => {
    const nc = await NonConformity.findByPk(id);
    if (!nc) throw { statusCode: 404, message: 'NC not found' };

    await nc.update({ status: 'CLOSED', closure_remarks: remarks, closed_at: new Date() });

    return nc;
};

const NC_LIST_ATTRIBUTES = ['id', 'job_id', 'severity', 'status', 'created_at'];

export const getNCs = async (query) => {
    const { page = 1, limit = 10, job_id, status } = query;
    const where = {};
    if (job_id) where.job_id = job_id;
    if (status) where.status = status;

    const { count, rows } = await NonConformity.findAndCountAll({
        where,
        attributes: NC_LIST_ATTRIBUTES,
        limit: parseInt(limit, 10),
        offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        order: [['createdAt', 'DESC']]
    });

    // Calculate status counts
    const statusWhere = { ...where };
    delete statusWhere.status;
    const statusCounts = await NonConformity.findAll({
        where: statusWhere,
        attributes: [
            ['status', 'status'],
            [db.sequelize.fn('COUNT', db.sequelize.col('status')), 'count']
        ],
        group: ['status'],
        raw: true
    });

    const pageLimit = parseInt(limit, 10) || 10;
    return {
        total: count,
        page: parseInt(page),
        limit: pageLimit,
        totalPages: Math.ceil(count / pageLimit),
        status_counts: statusCounts.map(sc => ({ status: sc.status, count: parseInt(sc.count, 10) })),
        rows
    };
};

export const getNCById = async (id) => {
    const nc = await NonConformity.findByPk(id);
    if (!nc) throw { statusCode: 404, message: 'Non-Conformity not found' };
    return nc;
};

export const getByJob = async (jobId) => {
    return await NonConformity.findAll({
        where: { job_id: jobId },
        attributes: NC_LIST_ATTRIBUTES
    });
};

