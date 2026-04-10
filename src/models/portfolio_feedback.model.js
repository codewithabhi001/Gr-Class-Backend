export default (sequelize, DataTypes) => {
    const PortfolioFeedback = sequelize.define('PortfolioFeedback', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV7,
            primaryKey: true
        },
        client_id: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true // A client can only have one portfolio feedback entry
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        designation: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        company: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        is_visible: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'portfolio_feedbacks',
        underscored: true,
        timestamps: true
    });

    PortfolioFeedback.associate = (models) => {
        PortfolioFeedback.belongsTo(models.User, { as: 'Client', foreignKey: 'client_id' });
    };

    return PortfolioFeedback;
};
