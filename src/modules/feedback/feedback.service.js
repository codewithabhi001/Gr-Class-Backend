import db from '../../models/index.js';
import { flatFeedbackListRow } from '../../utils/listRowFlatten.util.js';
import * as notificationService from '../../services/notification.service.js';

const CustomerFeedback = db.CustomerFeedback;
const JobRequest = db.JobRequest;

export const submitFeedback = async (data, userId, clientId) => {
    const job = await JobRequest.findByPk(data.job_id, {
        include: [{ model: db.Vessel, attributes: ['client_id'] }]
    });

    if (!job) throw { statusCode: 404, message: 'Job not found' };

    if (clientId && job.Vessel.client_id !== clientId) {
        throw { statusCode: 403, message: 'Unauthorized to provide feedback for this job' };
    }

    // Feedback is allowed only after the job is certified (finalized)
    if (job.job_status !== 'CERTIFIED') {
        throw { statusCode: 400, message: 'Feedback allowed only for CERTIFIED jobs' };
    }

    const existing = await CustomerFeedback.findOne({ where: { job_id: data.job_id } });
    if (existing) {
        throw { statusCode: 400, message: 'Feedback already submitted for this job' };
    }

    const feedback = await CustomerFeedback.create({
        ...data,
        client_id: clientId,
        user_id: userId
    });

    if (feedback.rating < 3) {
        notificationService.notifyRoles(['GM', 'ADMIN'], 'Customer Dissatisfaction Alert', `Low rating (${feedback.rating}/5) received for Job ${job.job_number || job.id}.`);
    }

    return feedback;
};

export const getFeedbackForJob = async (jobId) => {
    return await CustomerFeedback.findOne({
        where: { job_id: jobId },
        include: ['Client'] // Ensure association exists
    });
};

export const getFeedbackById = async (id) => {
    const feedback = await CustomerFeedback.findByPk(id, {
        include: [
            {
                model: db.JobRequest,
                attributes: ['job_request_number']
            },
            {
                model: db.User,
                as: 'Client',
                attributes: ['id', 'name', 'email'],
                include: [
                    {
                        model: db.Client,
                        attributes: ['company_name']
                    }
                ]
            }
        ]
    });
    if (!feedback) throw { statusCode: 404, message: 'Feedback not found' };
    return feedback;
};

export const getAllFeedback = async (query) => {
    const { page = 1, limit = 10 } = query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, parseInt(limit, 10));
    const result = await CustomerFeedback.findAndCountAll({
        limit: pageLimit,
        offset: (pageNum - 1) * pageLimit,
        order: [['createdAt', 'DESC']],
        include: [
            {
                model: db.JobRequest,
                attributes: ['job_request_number']
            },
            {
                model: db.User,
                as: 'Client',
                attributes: ['id', 'name', 'email'],
                include: [
                    {
                        model: db.Client,
                        attributes: ['company_name']
                    }
                ]
            }
        ]
    });
    return {
        total: result.count,
        page: pageNum,
        limit: pageLimit,
        totalPages: Math.ceil(result.count / pageLimit),
        rows: result.rows.map(flatFeedbackListRow),
    };
};

