import db from '../../models/index.js';
import { flatActivityRequestListRow, flatActivityRequestDetailRow } from '../../utils/listRowFlatten.util.js';
import * as fileAccessService from '../../services/fileAccess.service.js';

const ActivityRequest = db.ActivityRequest;
const Vessel = db.Vessel;

const activityRequestVesselInclude = {
    model: Vessel,
    attributes: [
        'id', 'vessel_name', 'imo_number', 'call_sign', 'mmsi_number',
        'port_of_registry', 'year_built', 'ship_type', 'gross_tonnage',
        'net_tonnage', 'deadweight', 'class_status', 'current_class_society',
        'engine_type', 'client_id', 'flag_administration_id',
    ],
    include: [
        { model: db.FlagAdministration, as: 'FlagAdministration', attributes: ['flag_state_name'] },
        { model: db.Client, as: 'Client', attributes: ['company_name', 'company_code'] },
    ],
};

const enrichAttachments = async (attachments, user = null) => {
    const urls = Array.isArray(attachments) ? attachments : [];
    return Promise.all(urls.map(async (fileUrl) => {
        const { fileName, signedUrl } = await fileAccessService.processFileAccess({ file_url: fileUrl }, user);
        return { filename: fileName, signedUrl };
    }));
};

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
            activityRequestVesselInclude,
            { model: db.JobRequest, as: 'LinkedJob', attributes: ['id', 'job_status', 'job_request_number'] },
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

export const getActivityRequestById = async (id, scopeFilters = {}, user = null) => {
    const request = await ActivityRequest.findOne({
        where: { id, ...scopeFilters },
        include: [
            { model: db.User, as: 'Requester', attributes: ['id', 'name', 'email'] },
            activityRequestVesselInclude,
            {
                model: db.JobRequest,
                as: 'LinkedJob',
                attributes: ['id', 'job_status', 'reason', 'job_request_number']
            }
        ]
    });
    if (!request) throw { statusCode: 404, message: 'Activity request not found' };

    const plain = request.get({ plain: true });
    plain.attachments = await enrichAttachments(plain.attachments, user);
    return flatActivityRequestDetailRow(plain);
};

export const updateActivityStatus = async (id, status, remarks) => {
    const request = await ActivityRequest.findByPk(id);
    if (!request) throw { statusCode: 404, message: 'Activity request not found' };
    return await request.update({ status, rejection_reason: remarks });
};
