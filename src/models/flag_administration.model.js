export default (sequelize, DataTypes) => {
    const FlagAdministration = sequelize.define('FlagAdministration', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV7, primaryKey: true },
        flag_state_name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        country: { type: DataTypes.STRING, allowNull: false },
        authority_name: { type: DataTypes.STRING, allowNull: false },
        contact_email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        authorization_scope: DataTypes.TEXT,
        logo_url: DataTypes.STRING,
        status: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE'), defaultValue: 'ACTIVE' },
    }, {
        tableName: 'flag_administrations',
        underscored: true,
        timestamps: true,
        indexes: [
            { fields: ['status'] }
        ],
        hooks: {
            beforeValidate: (flag) => {
                const fieldsToLower = [
                    'flag_state_name',
                    'country',
                    'authority_name',
                    'contact_email'
                ];
                for (const field of fieldsToLower) {
                    if (typeof flag[field] === 'string') {
                        flag[field] = flag[field].toLowerCase().trim();
                    }
                }
            }
        }
    });

    FlagAdministration.associate = (models) => {
        FlagAdministration.hasMany(models.Vessel, {
            foreignKey: 'flag_administration_id',
            as: 'Vessels'
        });
    };

    return FlagAdministration;
};
