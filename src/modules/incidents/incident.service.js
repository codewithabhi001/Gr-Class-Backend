import db from '../../models/index.js';

const Incident = db.Incident;
const Vessel = db.Vessel;

export const reportIncident = async (data, userId, clientId) => {
    // If clientId is provided (from CLIENT role), ensure vessel belongs to them
    if (clientId) {
        if (!data.vessel_id) throw { statusCode: 400, message: 'Vessel ID is required for reporting an incident' };
        const vessel = await Vessel.findOne({ where: { id: data.vessel_id, client_id: clientId } });
        if (!vessel) throw { statusCode: 403, message: 'Unauthorized vessel selection' };
    }

    return await Incident.create({
        ...data,
        reported_by: userId,
        status: 'OPEN'
    });
};

export const getIncidents = async (query, scopeFilters = {}) => {
    const { page = 1, limit = 10, status, ...rest } = query;
    const where = { ...rest, ...scopeFilters };
    if (status) where.status = status;

    const { count, rows } = await Incident.findAndCountAll({
        where,
        attributes: ['id', 'vessel_id', 'reported_by', 'title', 'status', 'created_at'],
        include: [{ model: Vessel, attributes: ['id', 'vessel_name', 'imo_number'] }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit, 10),
        offset: (parseInt(page, 10) - 1) * parseInt(limit, 10)
    });

    // Calculate status counts
    const statusWhere = { ...where };
    delete statusWhere.status;
    const statusCounts = await Incident.findAll({
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


export const getIncidentById = async (id, scopeFilters = {}) => {
    const incident = await Incident.findOne({
        where: { id, ...scopeFilters },
        include: [{ model: Vessel, attributes: ['id', 'vessel_name', 'imo_number'] }]
    });
    if (!incident) throw { statusCode: 404, message: 'Incident not found' };
    return incident;
};

export const updateIncidentStatus = async (id, status, remarks) => {
    const incident = await Incident.findByPk(id);
    if (!incident) throw { statusCode: 404, message: 'Incident not found' };
    return await incident.update({ status, remarks });
};
