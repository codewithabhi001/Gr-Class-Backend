export default (sequelize, DataTypes) => {
    const SiteStaticContent = sequelize.define('SiteStaticContent', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        key: {
            type: DataTypes.STRING(64),
            allowNull: false,
            unique: true,
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        body_html: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        faq_items: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Array of { question, answer, sort_order }',
        },
        news_items: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Array of { id, title, body_html, thumbnail_url, published_at }',
        }
    }, {
        tableName: 'site_static_contents',
        timestamps: true,
        underscored: true,
    });

    return SiteStaticContent;
};
