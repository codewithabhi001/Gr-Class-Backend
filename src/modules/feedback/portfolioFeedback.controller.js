import * as portfolioFeedbackService from './portfolioFeedback.service.js';

/**
 * Client submits or updates their portfolio feedback
 */
export const submitFeedback = async (req, res, next) => {
    try {
        const clientId = req.user.id;
        const feedback = await portfolioFeedbackService.upsertFeedback(clientId, req.body);
        res.status(200).json({
            success: true,
            message: 'Feedback submitted successfully and is pending admin approval',
            data: feedback
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin gets all portfolio feedbacks
 */
export const getAllFeedback = async (req, res, next) => {
    try {
        const feedbacks = await portfolioFeedbackService.getAllFeedbackAdmin();
        res.status(200).json({
            success: true,
            data: feedbacks
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Public gets visible portfolio feedbacks
 */
export const getPublicFeedback = async (req, res, next) => {
    try {
        const feedbacks = await portfolioFeedbackService.getPublicFeedback();
        res.status(200).json({
            success: true,
            data: feedbacks
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin toggles visibility of a feedback
 */
export const toggleVisibility = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { is_visible } = req.body;
        const feedback = await portfolioFeedbackService.updateVisibility(id, is_visible);
        res.status(200).json({
            success: true,
            message: `Feedback is now ${is_visible ? 'visible' : 'hidden'}`,
            data: feedback
        });
    } catch (error) {
        next(error);
    }
};
