export default (sequelize, DataTypes) => {
    const SiteStaticContent = sequelize.define('SiteStaticContent', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        slug: {
            type: DataTypes.STRING(64),
            allowNull: false,
            unique: true
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        content_type: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        body_html: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
        thumbnail_url: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        faq_items: {
            type: DataTypes.JSON,
            allowNull: true
        },
        is_published: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        published_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        updated_by: {
            type: DataTypes.UUID,
            allowNull: true
        }
    }, {
        tableName: 'site_static_contents',
        timestamps: true,
        underscored: true
    });

    SiteStaticContent.associate = (models) => {
        SiteStaticContent.belongsTo(models.User, { foreignKey: 'updated_by', as: 'editor' });
    };

    return SiteStaticContent;
};
