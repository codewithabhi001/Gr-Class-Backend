'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('job_requests', 'source_activity_request_id', {
            type: Sequelize.CHAR(36).BINARY,
            allowNull: true,
            references: {
                model: 'activity_requests',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        });
        await queryInterface.addIndex('job_requests', ['source_activity_request_id'], {
            name: 'idx_job_requests_source_activity_request_id',
        });
    },

    async down(queryInterface) {
        await queryInterface.removeIndex('job_requests', 'idx_job_requests_source_activity_request_id');
        await queryInterface.removeColumn('job_requests', 'source_activity_request_id');
    },
};
