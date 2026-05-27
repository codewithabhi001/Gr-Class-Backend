export default (sequelize, DataTypes) => {
    const NonConformity = sequelize.define('NonConformity', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV7, primaryKey: true },
        job_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'job_requests',
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        job_certificate_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'job_certificates',
                key: 'id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        },
        description: DataTypes.TEXT,
        severity: DataTypes.ENUM('MINOR', 'MAJOR', 'CRITICAL'),
        status: { type: DataTypes.ENUM('OPEN', 'CLOSED'), defaultValue: 'OPEN' },
        closure_remarks: DataTypes.TEXT,
        closed_at: DataTypes.DATE,
    }, {
        tableName: 'non_conformities',
        underscored: true,
        timestamps: true,
    });

    NonConformity.associate = (models) => {
        NonConformity.belongsTo(models.JobRequest, { foreignKey: 'job_id' });
        NonConformity.belongsTo(models.JobCertificate, { foreignKey: 'job_certificate_id' });
    };

    return NonConformity;
};
