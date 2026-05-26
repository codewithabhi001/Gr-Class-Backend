export default (sequelize, DataTypes) => {
    const SurveyorProfile = sequelize.define('SurveyorProfile', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV7, primaryKey: true },
        user_id: DataTypes.UUID,
        surveyor_application_id: { type: DataTypes.UUID, allowNull: true },
        license_number: DataTypes.STRING,
        authorized_ship_types: {
            type: DataTypes.JSON,
            get() {
                const val = this.getDataValue('authorized_ship_types');
                if (typeof val === 'string') {
                    try {
                        const parsed = JSON.parse(val);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    } catch (e) {
                        return val ? [val] : [];
                    }
                }
                return val || [];
            },
            set(val) {
                if (typeof val === 'string') {
                    try {
                        const parsed = JSON.parse(val);
                        this.setDataValue('authorized_ship_types', Array.isArray(parsed) ? parsed : [parsed]);
                    } catch (e) {
                        this.setDataValue('authorized_ship_types', val ? [val] : []);
                    }
                } else {
                    this.setDataValue('authorized_ship_types', val || []);
                }
            }
        },
        authorized_certificates: {
            type: DataTypes.JSON,
            get() {
                const val = this.getDataValue('authorized_certificates');
                if (typeof val === 'string') {
                    try {
                        const parsed = JSON.parse(val);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    } catch (e) {
                        return val ? [val] : [];
                    }
                }
                return val || [];
            },
            set(val) {
                if (typeof val === 'string') {
                    try {
                        const parsed = JSON.parse(val);
                        this.setDataValue('authorized_certificates', Array.isArray(parsed) ? parsed : [parsed]);
                    } catch (e) {
                        this.setDataValue('authorized_certificates', val ? [val] : []);
                    }
                } else {
                    this.setDataValue('authorized_certificates', val || []);
                }
            }
        },
        valid_from: DataTypes.DATEONLY,
        valid_to: DataTypes.DATEONLY,
        status: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'), defaultValue: 'ACTIVE' },
        is_available: { type: DataTypes.BOOLEAN, defaultValue: false },
        nationality: { type: DataTypes.STRING, allowNull: true },
        qualification: { type: DataTypes.STRING, allowNull: true },
        years_of_experience: { type: DataTypes.INTEGER, allowNull: true },
        cv_url: { type: DataTypes.STRING, allowNull: true },
        id_proof_url: { type: DataTypes.STRING, allowNull: true },
        license_copy_url: { type: DataTypes.STRING, allowNull: true },
    }, {
        tableName: 'surveyor_profiles',
        underscored: true,
        timestamps: true,
    });

    SurveyorProfile.associate = (models) => {
        SurveyorProfile.belongsTo(models.User, { foreignKey: 'user_id' });
        SurveyorProfile.belongsTo(models.SurveyorApplication, { foreignKey: 'surveyor_application_id', as: 'application' });
    };

    return SurveyorProfile;
};
