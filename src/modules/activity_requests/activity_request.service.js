import db from '../../models/index.js';
import { flatActivityRequestListRow } from '../../utils/listRowFlatten.util.js';

const ActivityRequest = db.ActivityRequest;
const Vessel = db.Vessel;

export const createActivityRequest = async (data, userId) => {
    const count = await ActivityRequest.count({ paranoid: false });
    const requestNumber = `AR-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    return await ActivityRequest.create({
        ...data,
        request_number: requestNumber,
        requested_by: userId,
        status: 'PENDING'
    });
};

export const getActivityRequests = async (query, scopeFilters = {}) => {
    const { page = 1, limit = 10, ...filters } = query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, parseInt(limit, 10));
    const { count, rows } = await ActivityRequest.findAndCountAll({
        where: { ...filters, ...scopeFilters },
        attributes: ['id', 'request_number', 'activity_type', 'requested_service', 'proposed_date', 'status', 'vessel_id', 'created_at'],
        include: [
            { model: Vessel, attributes: ['id', 'vessel_name', 'imo_number'] },
            { model: db.JobRequest, as: 'LinkedJob', attributes: ['id', 'job_status'] }
        ],
        order: [['created_at', 'DESC']],
        limit: pageLimit,
        offset: (pageNum - 1) * pageLimit,
    });
    return {
        total: count,
        page: pageNum,
        limit: pageLimit,
        totalPages: Math.ceil(count / pageLimit),
        rows: rows.map(flatActivityRequestListRow),
    };
};

export const getActivityRequestById = async (id, scopeFilters = {}) => {
    const request = await ActivityRequest.findOne({
        where: { id, ...scopeFilters },
        include: [Vessel, 'LinkedJob']
    });
    if (!request) throw { statusCode: 404, message: 'Activity request not found' };
    return request;
};

export const updateActivityStatus = async (id, status, remarks) => {
    const request = await ActivityRequest.findByPk(id);
    if (!request) throw { statusCode: 404, message: 'Activity request not found' };
    return await request.update({ status, remarks });
};
