import db from '../../models/index.js';
import { Op } from 'sequelize';

const { User, Client, Vessel, JobRequest, SurveyorProfile, Certificate, FlagAdministration, Survey, CertificateType, Payment, NonConformity } = db;

const vesselAttrs = ['id', 'vessel_name', 'imo_number', 'flag_administration_id', 'class_status'];

export const getAdminDashboard = async () => {
    const stats = await getOperationalStats();
    const roleCountsRaw = await User.findAll({
        attributes: ['role', [db.sequelize.fn('COUNT', 'role'), 'count']],
        group: ['role'],
        raw: true
    });

    const roleCounts = roleCountsRaw.reduce((acc, r) => {
        acc[r.role] = parseInt(r.count, 10);
        return acc;
    }, {});

    return {
        role: 'ADMIN',
        summary: {
            ...stats.summary,
            users: {
                total: roleCountsRaw.reduce((sum, r) => sum + parseInt(r.count, 10), 0),
                by_role: roleCounts,
                admin: roleCounts.ADMIN || 0,
                gm: roleCounts.GM || 0,
                tm: roleCounts.TM || 0,
                to: roleCounts.TO || 0,
                ta: roleCounts.TA || 0,
                surveyors: stats.surveyorCount,
                clients: roleCounts.CLIENT || 0,
                flag_admin: roleCounts.FLAG_ADMIN || 0,
            },
        },
        client_with_vessels: stats.client_with_vessels,
    };
}

const getOperationalStats = async () => {
    const [
        clientsWithVessels,
        vesselsCount,
        jobsCount,
        certificatesCount,
        surveyorProfilesCount,
        jobStatusCountsRaw,
        certStatusCountsRaw,
        surveyStatusCountsRaw,
        ncCountsRaw
    ] = await Promise.all([
        Client.findAll({
            where: { status: 'ACTIVE' },
            include: [{
                model: Vessel,
                as: 'Vessels',
                required: false,
                attributes: vesselAttrs,
                include: [{ model: FlagAdministration, as: 'FlagAdministration', attributes: ['flag_state_name'] }]
            }],
        }),
        Vessel.count(),
        JobRequest.count(),
        Certificate.count(),
        SurveyorProfile.count({ where: { status: 'ACTIVE' } }),
        JobRequest.findAll({
            attributes: ['job_status', [db.sequelize.fn('COUNT', 'job_status'), 'count']],
            group: ['job_status'],
            raw: true
        }),
        Certificate.findAll({
            attributes: ['status', [db.sequelize.fn('COUNT', 'status'), 'count']],
            group: ['status'],
            raw: true
        }),
        Survey.findAll({
            attributes: ['survey_status', [db.sequelize.fn('COUNT', 'survey_status'), 'count']],
            group: ['survey_status'],
            raw: true
        }),
        NonConformity.findAll({
            attributes: ['status', [db.sequelize.fn('COUNT', 'status'), 'count']],
            group: ['status'],
            raw: true
        })
    ]);

    const jobsByStatus = jobStatusCountsRaw.reduce((acc, j) => {
        const status = j.job_status || 'CREATED';
        acc[status] = (acc[status] || 0) + parseInt(j.count, 10);
        return acc;
    }, {});

    const certsByStatus = certStatusCountsRaw.reduce((acc, c) => {
        const status = c.status || 'VALID';
        acc[status] = (acc[status] || 0) + parseInt(c.count, 10);
        return acc;
    }, {});

    const surveysByStatus = surveyStatusCountsRaw.reduce((acc, s) => {
        const status = s.survey_status || 'NOT_STARTED';
        acc[status] = (acc[status] || 0) + parseInt(s.count, 10);
        return acc;
    }, {});

    const ncByStatus = ncCountsRaw.reduce((acc, n) => {
        const status = n.status || 'OPEN';
        acc[status] = (acc[status] || 0) + parseInt(n.count, 10);
        return acc;
    }, {});

    const clients = clientsWithVessels.map((c) => ({
        id: c.id,
        company_name: c.company_name,
        company_code: c.company_code,
        email: c.email,
        status: c.status,
        vessels: (c.Vessels || []).map((v) => ({
            id: v.id,
            vessel_name: v.vessel_name,
            imo_number: v.imo_number,
            flag: v.FlagAdministration?.flag_state_name,
            status: v.class_status,
        })),
    }));

    const sortedClients = clients
        .filter(c => c.vessels && c.vessels.length > 0)
        .sort((a, b) => b.vessels.length - a.vessels.length)
        .slice(0, 5);

    return {
        summary: {
            vessels: vesselsCount,
            clients: clients.length,
            jobs: { total: jobsCount, by_status: jobsByStatus },
            surveys: { total: surveyStatusCountsRaw.reduce((sum, s) => sum + parseInt(s.count, 10), 0), by_status: surveysByStatus },
            certificates: { total: certificatesCount, by_status: certsByStatus },
            non_conformities: { total: ncCountsRaw.reduce((sum, n) => sum + parseInt(n.count, 10), 0), by_status: ncByStatus }
        },
        surveyorCount: surveyorProfilesCount,
        client_with_vessels: sortedClients,
    };
}

export const getGMDashboard = async () => {
    const stats = await getOperationalStats();
    return {
        role: 'GM',
        summary: stats.summary,
        client_with_vessels: stats.client_with_vessels
    };
}

export const getTMDashboard = async () => {
    const stats = await getOperationalStats();
    return {
        role: 'TM',
        summary: stats.summary,
        client_with_vessels: stats.client_with_vessels
    };
}

export const getTODashboard = async (user) => {
    const stats = await getOperationalStats();
    
    // For TO, we might want to highlight jobs waiting for their action
    const pendingVerification = stats.summary.jobs.by_status['CREATED'] || 0;
    const pendingTechnicalReview = stats.summary.jobs.by_status['SURVEY_DONE'] || 0;

    return {
        role: 'TO',
        summary: {
            ...stats.summary,
            to_action: {
                verification_needed: pendingVerification,
                review_needed: pendingTechnicalReview
            }
        },
        client_with_vessels: stats.client_with_vessels
    };
}

export const getTADashboard = async (user) => {
    const stats = await getOperationalStats();
    return {
        role: 'TA',
        summary: stats.summary,
    };
}

export const getSurveyorDashboard = async (user) => {
    const [assignedJobs, allJobsRaw, allSurveysRaw, openNCsCount, profile] = await Promise.all([
        JobRequest.findAll({
            where: { assigned_surveyor_id: user.id },
            include: [
                'Vessel',
                'CertificateType',
                { model: Survey, as: 'survey', attributes: ['survey_status'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 10,
        }),
        JobRequest.findAll({
            where: { assigned_surveyor_id: user.id },
            attributes: ['job_status'],
            raw: true
        }),
        Survey.findAll({
            where: { surveyor_id: user.id },
            attributes: ['survey_status'],
            raw: true
        }),
        NonConformity.count({
            include: [{
                model: JobRequest,
                where: { assigned_surveyor_id: user.id },
                required: true
            }],
            where: { status: 'OPEN' }
        }),
        SurveyorProfile.findOne({ where: { user_id: user.id }, raw: true }),
    ]);

    const jobsByStatus = allJobsRaw.reduce((acc, j) => {
        const s = j.job_status || 'CREATED';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});

    const surveysByStatus = allSurveysRaw.reduce((acc, s) => {
        const status = s.survey_status || 'NOT_STARTED';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    return {
        role: 'SURVEYOR',
        user: { id: user.id, name: user.name, email: user.email },
        profile: profile || null,
        summary: {
            assigned_jobs_total: allJobsRaw.length,
            jobs_by_status: jobsByStatus,
            surveys_by_status: surveysByStatus,
            completed_surveys: surveysByStatus['FINALIZED'] || 0,
            open_non_conformities: openNCsCount,
            rework_requested: jobsByStatus['REWORK_REQUESTED'] || 0
        },
        recent_assigned_jobs: assignedJobs.map((j) => ({
            id: j.id,
            job_status: j.job_status,
            survey_status: j.survey?.survey_status || 'NOT_STARTED',
            target_date: j.target_date,
            vessel: j.Vessel ? { vessel_name: j.Vessel.vessel_name, imo_number: j.Vessel.imo_number } : null,
            certificate_type: j.CertificateType?.name
        })),
    };
}

export const getClientDashboard = async (clientId) => {
    if (!clientId) throw { statusCode: 403, message: 'User is not associated with a client' };

    // 1. Get vessel IDs first
    const vessels = await Vessel.findAll({ where: { client_id: clientId }, attributes: ['id', 'vessel_name'] });
    const vesselIds = vessels.map(v => v.id);

    if (vesselIds.length === 0) {
        return {
            role: 'CLIENT',
            stats: { total_vessels: 0, active_jobs: 0, expiring_soon: 0, pending_payments: 0 },
            recent_jobs: [],
            expiring_certificates: []
        };
    }

    // 2. Parallel fetch jobs and certificates
    const [jobs, certificates] = await Promise.all([
        JobRequest.findAll({
            where: { vessel_id: vesselIds },
            include: [
                { model: Vessel, attributes: ['vessel_name'] },
                { model: CertificateType, attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']]
        }),
        Certificate.findAll({
            where: { vessel_id: vesselIds },
            include: [{ model: Vessel, attributes: ['vessel_name'] }]
        })
    ]);

    // 3. Get payments for these jobs
    const jobIds = jobs.map(j => j.id);
    const payments = jobIds.length > 0 
        ? await Payment.findAll({ where: { job_id: jobIds } })
        : [];

    // Calculate statistics
    const stats = {
        total_vessels: vessels.length,
        active_jobs: jobs.filter(j => !['CERTIFIED', 'REJECTED', 'CANCELLED'].includes(j.job_status)).length,
        expiring_soon: certificates.filter(c => {
            const daysToExpiry = Math.floor((new Date(c.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
            return daysToExpiry <= 60 && daysToExpiry > 0;
        }).length,
        pending_payments: payments.filter(p => p.payment_status === 'UNPAID').length,
    };

    return {
        role: 'CLIENT',
        stats,
        recent_jobs: jobs.slice(0, 5).map(j => ({
            id: j.id,
            vessel_name: j.Vessel?.vessel_name,
            type: j.CertificateType?.name,
            status: j.job_status,
            date: j.createdAt
        })),
        expiring_certificates: certificates
            .filter(c => {
                const daysToExpiry = Math.floor((new Date(c.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
                return daysToExpiry <= 60 && daysToExpiry > 0;
            })
            .slice(0, 5)
            .map(c => ({
                id: c.id,
                name: c.certificate_name,
                vessel: c.Vessel?.vessel_name,
                expiry_date: c.expiry_date
            }))
    };
};

export const getFlagAdminDashboard = async () => {
    let flags = 0, flagsActive = 0;
    try {
        [flags, flagsActive] = await Promise.all([
            FlagAdministration.count(),
            FlagAdministration.count({ where: { status: 'ACTIVE' } }),
        ]);
    } catch (_) {
        // FlagAdministration table may not exist or be empty
    }

    let flagList = [];
    try {
        flagList = await FlagAdministration.findAll({
            attributes: ['id', 'flag_state_name', 'country', 'status'],
            raw: true,
        });
    } catch (_) { }
    return {
        role: 'FLAG_ADMIN',
        summary: {
            flags_total: flags,
            flags_active: flagsActive,
        },
        flags: flagList,
    };
}

export const getDefaultDashboard = async (user) => {
    return {
        role: user.role,
        user: { id: user.id, name: user.name, email: user.email },
        summary: {},
    };
}
