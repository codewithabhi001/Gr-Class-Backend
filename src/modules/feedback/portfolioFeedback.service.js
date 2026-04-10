import db from '../../models/index.js';

const PortfolioFeedback = db.PortfolioFeedback;
const User = db.User;

/**
 * Upsert portfolio feedback for a client
 * @param {string} clientId 
 * @param {object} data - { comment, profile_url, designation, company }
 */
export const upsertFeedback = async (clientId, data) => {
    const { comment, designation, company } = data;

    // Use upsert or findOne then update/create
    const [feedback, created] = await PortfolioFeedback.findOrCreate({
        where: { client_id: clientId },
        defaults: {
            client_id: clientId,
            comment,
            designation,
            company,
            is_visible: false // New feedback or updates default to false (needs admin review?)
            // Actually, if they update, maybe we should keep the visibility status or reset it.
            // Requirement says "client first time create kr sake aur next time se sirf update"
        }
    });

    if (!created) {
        await feedback.update({
            comment,
            designation,
            company,
            // is_visible: feedback.is_visible // Keep existing visibility or reset?
            // Usually, updating content should probably require re-approval.
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
    return await PortfolioFeedback.findAll({
        where: { is_visible: true },
        attributes: { exclude: ['is_visible'] },
        include: [{
            model: User,
            as: 'Client',
            attributes: ['id', 'name', 'email', 'profile_pic_url']
        }],
        order: [['updated_at', 'DESC']]
    });
};

/**
 * Get feedback for a specific client
 */
export const getClientFeedback = async (clientId) => {
    return await PortfolioFeedback.findOne({
        where: { client_id: clientId },
        attributes: { exclude: ['is_visible'] }
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
