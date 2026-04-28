export default (sequelize, DataTypes) => {
    const JobDocument = sequelize.define('JobDocument', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV7, primaryKey: true },
        job_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        required_document_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        custom_document_name: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Name for additional documents that are not part of required_documents'
        },
        file_url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        uploaded_by: {
            type: DataTypes.UUID,
            allowNull: false
        },
        verification_status: {
            type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
            defaultValue: 'PENDING',
            comment: 'TO sets this during document verification'
        },
        rejection_reason: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Reason why TO rejected this document'
        },
        verified_by: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: 'User ID of the TO who verified/rejected this document'
        }
    }, {
        tableName: 'job_documents',
        underscored: true,
        timestamps: true,
    });

    JobDocument.associate = (models) => {
        JobDocument.belongsTo(models.JobRequest, { foreignKey: 'job_id' });
        JobDocument.belongsTo(models.CertificateRequiredDocument, { foreignKey: 'required_document_id' });
        JobDocument.belongsTo(models.User, { foreignKey: 'uploaded_by', as: 'Uploader' });
    };

    return JobDocument;
};
