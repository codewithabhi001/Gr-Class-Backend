import db from '../../models/index.js';
import { VESSEL_CLASS_STATUSES } from '../../constants/statuses.js';
import { buildFullStatusCounts } from '../../utils/statusCount.util.js';
import { flatVesselListRow } from '../../utils/listRowFlatten.util.js';

const Vessel = db.Vessel;
const Client = db.Client;
const FlagAdministration = db.FlagAdministration;

const ensureValidFlag = async (flagId) => {
    if (!flagId) return;
    const flag = await FlagAdministration.findOne({
        where: { id: flagId, status: 'ACTIVE' }
    });
    if (!flag) {
        throw { statusCode: 400, message: `Invalid or inactive flag administration (ID: ${flagId}).` };
    }
};

export const createVessel = async (data, userId) => {
    // Check if client exists
    const client = await Client.findByPk(data.client_id || data.vessel_owner_id);
    if (!client) {
        throw { statusCode: 400, message: 'Client not found' };
    }

    // Duplicate check
    const existing = await Vessel.findOne({ where: { imo_number: data.imo_number } });
    if (existing) {
        throw { statusCode: 400, message: 'Vessel with this IMO number already exists' };
    }
    await ensureValidFlag(data.flag_administration_id);

    const { uploaded_documents, ...vesselData } = data;
    const txn = await db.sequelize.transaction();
    try {
        const vessel = await Vessel.create(vesselData, { transaction: txn });

        if (uploaded_documents && uploaded_documents.length > 0) {
            const docsToCreate = uploaded_documents.map(doc => ({
                vessel_id: vessel.id,
                file_url: doc.file_url,
                document_type: doc.document_type || 'OTHER',
                description: doc.description || '',
                uploaded_by: userId
            }));
            await db.VesselDocument.bulkCreate(docsToCreate, { transaction: txn });
        }

        await txn.commit();
        return vessel;
    } catch (error) {
        await txn.rollback();
        throw error;
    }
};

export const getVessels = async (query, scopeFilters = {}, userRole = null) => {
    const { page = 1, limit = 10, ...filters } = query;
    const where = { ...filters, ...scopeFilters };

    const { count, rows } = await Vessel.findAndCountAll({
        where,
        attributes: ['id', 'vessel_name', 'imo_number', 'ship_type', 'class_status', 'client_id', 'flag_administration_id', 'created_at'],
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        include: [
            { model: Client, as: 'Client', attributes: ['id', 'company_name', 'company_code', 'status'] },
            { model: FlagAdministration, as: 'FlagAdministration', attributes: ['flag_state_name'] }
        ],
        order: [['created_at', 'DESC']]
    });

    // Calculate status counts
    const statusWhere = { ...where };
    delete statusWhere.class_status;
    const statusCounts = await Vessel.findAll({
        where: statusWhere,
        attributes: [
            ['class_status', 'status'],
            [db.sequelize.fn('COUNT', db.sequelize.col('class_status')), 'count']
        ],
        group: ['class_status'],
        raw: true
    });

    return {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
        status_counts: buildFullStatusCounts(statusCounts, VESSEL_CLASS_STATUSES),
        rows: rows.map(flatVesselListRow),
    };
};

export const getVesselById = async (id, scopeFilters = {}, user = null) => {
    if (!id) throw { statusCode: 400, message: 'Vessel ID is required' };
    const vessel = await Vessel.findOne({
        where: { id, ...scopeFilters },
        include: [
            { model: Client, as: 'Client' },
            { model: FlagAdministration, as: 'FlagAdministration', attributes: ['flag_state_name'] },
            {
                model: db.VesselDocument,
                as: 'Documents',
                include: [{ model: db.User, as: 'Uploader', attributes: ['id', 'name'] }]
            }
        ]
    });
    if (!vessel) throw { statusCode: 404, message: 'Vessel not found' };

    const vesselPlain = vessel.get({ plain: true });

    if (vesselPlain.Documents && vesselPlain.Documents.length > 0) {
        const { processFileAccess } = await import('../../services/fileAccess.service.js');
        const enrichedDocs = await Promise.all(vesselPlain.Documents.map(async (doc) => {
            const accessInfo = await processFileAccess(doc, user);
            return {
                ...doc,
                ...accessInfo,
                file_url: undefined // hide raw s3 url
            };
        }));
        vesselPlain.uploaded_documents = enrichedDocs;
    } else {
        vesselPlain.uploaded_documents = [];
    }

    delete vesselPlain.Documents; // remove raw DB nested object if needed, or keep it, replacing is cleaner.

    return vesselPlain;
};

export const getVesselsByClientId = async (clientId) => {
    // Check if client exists
    const client = await Client.findByPk(clientId);
    if (!client) {
        throw { statusCode: 404, message: 'Client not found' };
    }

    const vessels = await Vessel.findAll({
        where: { client_id: clientId },
        attributes: ['id', 'vessel_name', 'imo_number', 'ship_type', 'class_status', 'client_id', 'flag_administration_id', 'created_at'],
        include: [
            {
                model: Client,
                as: 'Client',
                attributes: ['id', 'company_name', 'company_code', 'status']
            },
            {
                model: FlagAdministration,
                as: 'FlagAdministration',
                attributes: ['flag_state_name']
            }
        ],
        order: [['created_at', 'DESC']]
    });

    return {
        client_id: client.id,
        client_name: client.company_name,
        client_code: client.company_code,
        client_email: client.email,
        client_phone: client.phone,
        client_status: client.status,
        count: vessels.length,
        rows: vessels.map(flatVesselListRow),
    };
};

export const updateVessel = async (id, data, scopeFilters = {}, userId = null) => {
    if (!id) throw { statusCode: 400, message: 'Vessel ID is required for update' };
    // We use Vessel.findOne to get the Sequelize instance for .update()
    const vesselQuery = await Vessel.findOne({
        where: { id, ...scopeFilters }
    });

    if (!vesselQuery) {
        throw { statusCode: 404, message: 'Vessel not found' };
    }

    if (data.imo_number && data.imo_number !== vesselQuery.imo_number) {
        const existing = await Vessel.findOne({ where: { imo_number: data.imo_number } });
        if (existing) {
            throw { statusCode: 400, message: 'Another vessel with this IMO number already exists' };
        }
    }
    if (data.flag_administration_id) {
        await ensureValidFlag(data.flag_administration_id);
    }

    const { uploaded_documents, ...updateData } = data;
    const txn = await db.sequelize.transaction();

    try {
        await vesselQuery.update(updateData, { transaction: txn });

        if (uploaded_documents && uploaded_documents.length > 0) {
            const docsToCreate = uploaded_documents.map(doc => ({
                vessel_id: vesselQuery.id,
                file_url: doc.file_url,
                document_type: doc.document_type || 'OTHER',
                description: doc.description || '',
                uploaded_by: userId
            }));
            await db.VesselDocument.bulkCreate(docsToCreate, { transaction: txn });
        }

        await txn.commit();
        return vesselQuery;
    } catch (error) {
        await txn.rollback();
        throw error;
    }
};
