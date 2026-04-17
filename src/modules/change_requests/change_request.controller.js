import * as changeRequestService from './change_request.service.js';
import logger from '../../utils/logger.js';

// Scope helper for CLIENT role
const getScopeFilters = (user) => {
    const scopeFilters = {};
    if (user.role === 'CLIENT') {
        scopeFilters.requested_by = user.id;
    }
    return scopeFilters;
};

/**
 * Create a new change request
 */
export const createChangeRequest = async (req, res, next) => {
    try {
        const changeRequest = await changeRequestService.createChangeRequest({
            ...req.body,
            requested_by: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Change request created successfully',
            change_request: changeRequest
        });
    } catch (error) {
        logger.error('Create change request error:', error);
        next(error);
    }
};

/**
 * Get all change requests
 */
export const getChangeRequests = async (req, res, next) => {
    try {
        const scopeFilters = getScopeFilters(req.user);
        const filters = {
            status: req.query.status,
            entity_type: req.query.entity_type,
            requested_by: req.query.requested_by,
            ...scopeFilters
        };

        const changeRequests = await changeRequestService.getChangeRequests(filters);

        res.json({
            success: true,
            change_requests: changeRequests,
            total: changeRequests.length
        });
    } catch (error) {
        logger.error('Get change requests error:', error);
        next(error);
    }
};

/**
 * Get change request by ID
 */
export const getChangeRequestById = async (req, res, next) => {
    try {
        const scopeFilters = getScopeFilters(req.user);
        const changeRequest = await changeRequestService.getChangeRequestById(req.params.id, scopeFilters);

        res.json({
            success: true,
            change_request: changeRequest
        });
    } catch (error) {
        logger.error('Get change request by ID error:', error);
        next(error);
    }
};

/**
 * Approve a change request
 */
export const approveChangeRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { remarks } = req.body;

        const changeRequest = await changeRequestService.approveChangeRequest(
            id,
            req.user.id,
            remarks
        );

        res.json({
            message: 'Change request approved',
            change_request: changeRequest
        });
    } catch (error) {
        logger.error('Approve change request error:', error);
        next(error);
    }
};

/**
 * Reject a change request
 */
export const rejectChangeRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { remarks } = req.body;

        const changeRequest = await changeRequestService.rejectChangeRequest(
            id,
            req.user.id,
            remarks
        );

        res.json({
            message: 'Change request rejected',
            change_request: changeRequest
        });
    } catch (error) {
        logger.error('Reject change request error:', error);
        next(error);
    }
};
