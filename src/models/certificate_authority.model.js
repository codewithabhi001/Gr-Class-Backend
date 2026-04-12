export default (sequelize, DataTypes) => {
    const CertificateAuthority = sequelize.define('CertificateAuthority', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV7, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        code: DataTypes.STRING,
        country: DataTypes.STRING,
        logo_url: {
            type: DataTypes.STRING,
            comment: 'Stores the S3 key of the logo image'
        },
        status: {
            type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
            defaultValue: 'ACTIVE'
        }
    }, {
        tableName: 'certificate_authorities',
        underscored: true,
        timestamps: true,
    });

    CertificateAuthority.associate = (models) => {
        CertificateAuthority.hasMany(models.Certificate, { foreignKey: 'certificate_authority_id' });
    };

    return CertificateAuthority;
};
