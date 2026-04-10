import * as portfolioFeedbackService from './portfolioFeedback.service.js';
import { resolveEntity } from '../../services/fileAccess.service.js';

/**
 * Client submits or updates their portfolio feedback
 */
export const submitFeedback = async (req, res, next) => {
    try {
        const clientId = req.user.id;
        const feedback = await portfolioFeedbackService.upsertFeedback(clientId, req.body);
        const feedbackJson = feedback.toJSON();
        delete feedbackJson.is_visible;
        
        const resolvedFeedback = await resolveEntity(feedbackJson, req.user);
        
        res.status(200).json({
            success: true,
            message: 'Feedback submitted successfully and is pending admin approval',
            data: resolvedFeedback
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Client gets their own portfolio feedback
 */
export const getMyFeedback = async (req, res, next) => {
    try {
        const clientId = req.user.id;
        const feedback = await portfolioFeedbackService.getClientFeedback(clientId);
        const resolvedFeedback = await resolveEntity(feedback, req.user);
        res.status(200).json({
            success: true,
            data: resolvedFeedback
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
        const resolvedFeedbacks = await resolveEntity(feedbacks, req.user);
        res.status(200).json({
            success: true,
            data: resolvedFeedbacks
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
        const resolvedFeedbacks = await resolveEntity(feedbacks); // Public resolution (e.g. CDN)
        res.status(200).json({
            success: true,
            data: resolvedFeedbacks
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
        const resolvedFeedback = await resolveEntity(feedback, req.user);
        res.status(200).json({
            success: true,
            message: `Feedback is now ${is_visible ? 'visible' : 'hidden'}`,
            data: resolvedFeedback
        });
    } catch (error) {
        next(error);
    }
};
