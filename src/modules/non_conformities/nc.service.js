import db from '../../models/index.js';
import * as notificationService from '../../services/notification.service.js';
import { NC_STATUSES } from '../../constants/statuses.js';
import { buildFullStatusCounts } from '../../utils/statusCount.util.js';
import { flatNcListRow, flatNcDetailRow } from '../../utils/listRowFlatten.util.js';

const NonConformity = db.NonConformity;
const { JobRequest, Vessel } = db;

const NC_JOB_INCLUDE = [
    {
        model: JobRequest,
        attributes: ['id', 'job_request_number', 'vessel_id'],
        include: [{ model: Vessel, attributes: ['vessel_name'] }],
    },
];

export const createNC = async (data, user) => {
    const nc = await NonConformity.create({ ...data, status: 'OPEN' });

    // Notify (non-blocking)
    notificationService.notifyRoles(['TM', 'TO'], 'New Non-Conformity', `NC raised for Job ${data.job_id} by ${user.name}`);

    return nc;
};

export const closeNC = async (id, remarks) => {
    const nc = await NonConformity.findByPk(id, { useMaster: true });
    if (!nc) throw { statusCode: 404, message: 'NC not found' };

    await nc.update({ status: 'CLOSED', closure_remarks: remarks, closed_at: new Date() });

    return nc;
};

const NC_LIST_ATTRIBUTES = ['id', 'job_id', 'job_certificate_id', 'severity', 'status', 'created_at'];

export const getNCs = async (query) => {
    const { page = 1, limit = 10, job_id, job_certificate_id, status } = query;
    const where = {};
    if (job_id) where.job_id = job_id;
    if (job_certificate_id) where.job_certificate_id = job_certificate_id;
    if (status) where.status = status;

    const { count, rows } = await NonConformity.findAndCountAll({
        where,
        attributes: NC_LIST_ATTRIBUTES,
        include: NC_JOB_INCLUDE,
        limit: parseInt(limit, 10),
        offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        order: [['createdAt', 'DESC']],
        useReplica: true
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
        raw: true,
        useReplica: true
    });

    const pageLimit = parseInt(limit, 10) || 10;
    return {
        total: count,
        page: parseInt(page),
        limit: pageLimit,
        totalPages: Math.ceil(count / pageLimit),
        status_counts: buildFullStatusCounts(statusCounts, NC_STATUSES),
        rows: rows.map(flatNcListRow),
    };
};

export const getNCById = async (id) => {
    const nc = await NonConformity.findByPk(id, { include: NC_JOB_INCLUDE });
    if (!nc) throw { statusCode: 404, message: 'Non-Conformity not found' };
    return flatNcDetailRow(nc);
};

export const getByJob = async (jobId, jobCertificateId = null) => {
    const where = { job_id: jobId };
    if (jobCertificateId) where.job_certificate_id = jobCertificateId;
    const rows = await NonConformity.findAll({
        where,
        attributes: NC_LIST_ATTRIBUTES,
        include: NC_JOB_INCLUDE,
        order: [['createdAt', 'DESC']],
        useReplica: true
    });
    return rows.map(flatNcListRow);
};

