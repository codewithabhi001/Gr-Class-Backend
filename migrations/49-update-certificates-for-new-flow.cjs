'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Add new columns
        await queryInterface.addColumn('certificates', 'source_type', {
            type: Sequelize.ENUM('INTERNAL', 'EXTERNAL'),
            defaultValue: 'INTERNAL',
            allowNull: false
        });

        await queryInterface.addColumn('certificates', 'certificate_term', {
            type: Sequelize.ENUM('FULL_TERM', 'SHORT_TERM'),
            defaultValue: 'FULL_TERM',
            allowNull: true
        });

        await queryInterface.addColumn('certificates', 'flag_administration_id', {
            type: Sequelize.CHAR(36).BINARY,
            allowNull: true,
            references: {
                model: 'flag_administrations',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        await queryInterface.addColumn('certificates', 'certificate_authority_id', {
            type: Sequelize.CHAR(36).BINARY,
            allowNull: true,
            references: {
                model: 'certificate_authorities',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        await queryInterface.addColumn('certificates', 'version', {
            type: Sequelize.INTEGER,
            defaultValue: 1,
            allowNull: false
        });

        await queryInterface.addColumn('certificates', 'manual_text', {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Stores structured JSON for template fields'
        });

        await queryInterface.addColumn('certificates', 'remarks', {
            type: Sequelize.TEXT,
            allowNull: true
        });

        await queryInterface.addColumn('certificates', 'uploaded_file_url', {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'S3 key for external certificates'
        });

        await queryInterface.addColumn('certificates', 'generated_pdf_url', {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'S3 key for system generated certificates'
        });

        await queryInterface.addColumn('certificates', 'issued_at', {
            type: Sequelize.DATE,
            allowNull: true
        });

        // 2. Update status ENUM to include DRAFT and ISSUED
        // Note: For MySQL, we can use changeColumn with the new ENUM definition.
        await queryInterface.changeColumn('certificates', 'status', {
            type: Sequelize.ENUM('DRAFT', 'ISSUED', 'VALID', 'EXPIRED', 'SUSPENDED', 'REVOKED'),
            defaultValue: 'VALID',
            allowNull: false
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('certificates', 'source_type');
        await queryInterface.removeColumn('certificates', 'certificate_term');
        await queryInterface.removeColumn('certificates', 'flag_administration_id');
        await queryInterface.removeColumn('certificates', 'certificate_authority_id');
        await queryInterface.removeColumn('certificates', 'version');
        await queryInterface.removeColumn('certificates', 'manual_text');
        await queryInterface.removeColumn('certificates', 'remarks');
        await queryInterface.removeColumn('certificates', 'uploaded_file_url');
        await queryInterface.removeColumn('certificates', 'generated_pdf_url');
        await queryInterface.removeColumn('certificates', 'issued_at');

        // Revert status ENUM
        await queryInterface.changeColumn('certificates', 'status', {
            type: Sequelize.ENUM('VALID', 'EXPIRED', 'SUSPENDED', 'REVOKED'),
            defaultValue: 'VALID',
            allowNull: false
        });
    }
};
