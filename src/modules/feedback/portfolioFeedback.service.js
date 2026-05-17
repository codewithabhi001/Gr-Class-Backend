import db from '../../models/index.js';

const PortfolioFeedback = db.PortfolioFeedback;
const User = db.User;

/**
 * Upsert portfolio feedback for a client
 * @param {string} clientId 
 * @param {object} data - { comment, profile_url, designation, company }
 */
export const upsertFeedback = async (clientId, data) => {
    const { comment, designation, company, rating } = data;

    // Use upsert or findOne then update/create
    const [feedback, created] = await PortfolioFeedback.findOrCreate({
        where: { client_id: clientId },
        defaults: {
            client_id: clientId,
            comment,
            designation,
            company,
            rating,
            is_visible: false 
        }
    });

    if (!created) {
        await feedback.update({
            comment,
            designation,
            company,
            rating,
            is_visible: false 
        });
    }

    return feedback;
};

/**
 * Get all feedback for admin management
 */
export const getAllFeedbackAdmin = async () => {
    return await PortfolioFeedback.findAll({
        attributes: [
            'id',
            'client_id',
            'comment',
            'rating',
            'designation',
            'company',
            'is_visible',
            'created_at',
            'updated_at'
        ],
        include: [{
            model: User,
            as: 'Client',
            attributes: ['id', 'name', 'email', 'profile_pic_url']
        }],
        order: [['created_at', 'DESC']]
    });
};

/**
 * Get visible feedback for public portfolio
 */
export const getPublicFeedback = async () => {
    const feedbacks = await PortfolioFeedback.findAll({
        where: { is_visible: true },
        attributes: [
            'comment',
            'rating',
            'company'
        ],
        include: [{
            model: User,
            as: 'Client',
            attributes: ['name', 'profile_pic_url'],
            include: [{
                model: db.Client,
                attributes: ['company_name', 'country']
            }]
        }],
        order: [['updated_at', 'DESC']]
    });

    return feedbacks.map(f => {
        const plain = typeof f.toJSON === 'function' ? f.toJSON() : f;
        return {
            company_name: plain.company || plain.Client?.Client?.company_name,
            username: plain.Client?.name,
            company_country: plain.Client?.Client?.country,
            profile_pic_url: plain.Client?.profile_pic_url,
            comment: plain.comment,
            rating: plain.rating
        };
    });
};

/**
 * Get feedback for a specific client
 */
export const getClientFeedback = async (clientId) => {
    return await PortfolioFeedback.findOne({
        where: { client_id: clientId },
        attributes: [
            'id',
            'client_id',
            'comment',
            'rating',
            'designation',
            'company',
            'created_at',
            'updated_at'
        ]
    });
};

/**
 * Toggle visibility of feedback (Admin action)
 */
export const updateVisibility = async (id, isVisible) => {
    const feedback = await PortfolioFeedback.findByPk(id);
    if (!feedback) {
        throw new Error('Feedback not found');
    }
    await feedback.update({ is_visible: isVisible });
    return feedback;
};
