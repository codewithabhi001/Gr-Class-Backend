export default (sequelize, DataTypes) => {
    const JobCertificate = sequelize.define('JobCertificate', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV7,
            primaryKey: true
        },
        job_request_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        certificate_type_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        generated_certificate_id: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: 'Populated when the certificate is finally issued'
        },
        status: {
            type: DataTypes.ENUM(
                'PENDING', 
                'DOCUMENT_VERIFIED',
                'REWORK_REQUESTED',
                'SURVEY_AUTHORIZED',
                'SURVEY_DONE',
                'ISSUED',
                'REJECTED'
            ),
            defaultValue: 'PENDING'
        },
        rework_remarks: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Specific remarks if this particular certificate needs rework'
        }
    }, {
        tableName: 'job_certificates',
        underscored: true,
        timestamps: true,
        updatedAt: true
    });

    JobCertificate.associate = (models) => {
        JobCertificate.belongsTo(models.JobRequest, { foreignKey: 'job_request_id' });
        JobCertificate.belongsTo(models.CertificateType, { foreignKey: 'certificate_type_id' });
        JobCertificate.belongsTo(models.Certificate, { foreignKey: 'generated_certificate_id', as: 'Certificate' });
        JobCertificate.hasMany(models.JobDocument, { foreignKey: 'job_certificate_id' });
        JobCertificate.hasOne(models.Survey, { foreignKey: 'job_certificate_id', as: 'survey' });
    };

    return JobCertificate;
};
