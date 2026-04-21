import db from '../../models/index.js';
import * as authService from '../auth/auth.service.js';

const Client = db.Client;
const User = db.User;
const Vessel = db.Vessel;
const JobRequest = db.JobRequest;
const Certificate = db.Certificate;
const Payment = db.Payment;

const CLIENT_FIELDS = [
    'company_name', 'company_code', 'address', 'country', 'email', 'phone',
    'contact_person_name', 'contact_person_email', 'status',
];

export const createClient = async (data) => {
    const { user: userData, ...clientPayload } = data;
    const clientFields = Object.fromEntries(
        CLIENT_FIELDS.filter((k) => clientPayload[k] !== undefined).map((k) => [k, clientPayload[k]])
    );

    if (!userData) {
        return await Client.create(clientFields);
    }

    const result = await db.sequelize.transaction(async (transaction) => {
        const client = await Client.create(clientFields, { transaction });
        const { user } = await authService.register(
            {
                name: userData.name,
                email: userData.email,
                password: userData.password,
                role: userData.role || 'CLIENT',
                phone: userData.phone,
                client_id: client.id,
            },
            { transaction }
        );
        return { client, user };
    });

    return result;
};

export const getClients = async (query) => {
    const { page = 1, limit = 10, ...filters } = query;
    const result = await Client.findAndCountAll({
        where: filters,
        attributes: [
            'id',
            'company_name',
            'company_code',
            'status',
            'email',
            'created_at'
        ],

        include: [{ model: User, attributes: ['id'] }],
        distinct: true,
        limit: parseInt(limit),
        offset: (page - 1) * limit,
    });

    result.rows = result.rows.map(client => {
        const plainClient = client.get({ plain: true });
        plainClient.has_user = !!(plainClient.Users && plainClient.Users.length > 0);
        delete plainClient.Users;
        return plainClient;
    });

    return result;
};

export const getClientById = async (id) => {
    const client = await Client.findByPk(id);
    if (!client) throw { statusCode: 404, message: 'Client not found' };
    return client;
};

export const updateClient = async (id, data) => {
    const client = await getClientById(id);
    return await client.update(data);
};

export const deleteClient = async (id) => {
    const client = await getClientById(id);
    return await client.update({ status: 'INACTIVE' });
};


export const getClientDocuments = async (clientId, user) => {
    if (!clientId) throw { statusCode: 404, message: 'Client not found' };

    const vessels = await Vessel.findAll({ where: { client_id: clientId }, attributes: ['id', 'vessel_name'] });
    const vesselIds = vessels.map(v => v.id);

    const jobs = await JobRequest.findAll({
        where: { vessel_id: vesselIds },
        attributes: ['id'],
        include: [{ model: db.CertificateType, attributes: ['name'] }]
    });
    const jobIds = jobs.map(j => j.id);

    let allDocs = [];

    if (vesselIds.length > 0) {
        const vesselDocs = await db.VesselDocument.findAll({
            where: { vessel_id: vesselIds },
            attributes: [
                'id',
                'vessel_id',
                'file_url',
                'file_type',
                'document_type',
                'description',
                'uploaded_by',
                'created_at',
                'updated_at'
            ],
            order: [['created_at', 'DESC']]
        });
        allDocs = allDocs.concat(vesselDocs.map(d => ({
            ...d.toJSON(),
            entity_type: 'VESSEL',
            entity_id: d.vessel_id
        })));
    }

    if (jobIds.length > 0) {
        const jobDocs = await db.JobDocument.findAll({
            where: { job_id: jobIds },
            attributes: [
                'id',
                'job_id',
                'file_url',
                'file_type',
                'document_type',
                'description',
                'uploaded_by',
                'created_at',
                'updated_at'
            ],
            order: [['created_at', 'DESC']]
        });
        allDocs = allDocs.concat(jobDocs.map(d => ({
            ...d.toJSON(),
            entity_type: 'JOB',
            entity_id: d.job_id
        })));
    }

    // You could also fetch from ActivityPlanning/Checklist if needed
    // Assuming surveys.length > 0 for surveyor docs, but JobDocs should cover most for clients

    // Sort combined docs
    allDocs.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));

    const { processFileAccess } = await import('../../services/fileAccess.service.js');

    const enrichedDocs = await Promise.all(allDocs.map(async (docJson) => {
        const accessInfo = await processFileAccess(docJson, user);

        let entityName = 'Unknown Entity';
        if (docJson.entity_type === 'VESSEL') {
            const v = vessels.find(v => v.id === docJson.entity_id);
            if (v) entityName = `Vessel (${v.vessel_name})`;
        } else if (docJson.entity_type === 'JOB') {
            const j = jobs.find(j => j.id === docJson.entity_id);
            if (j && j.CertificateType) entityName = `Job (${j.CertificateType.name})`;
        }

        return {
            ...docJson,
            ...accessInfo,
            entity_name: entityName,
            file_url: undefined // hide raw S3 url
        };
    }));

    return enrichedDocs;
};
