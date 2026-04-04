import crypto from 'crypto';

export default (sequelize, DataTypes) => {
    const NewsletterSubscriber = sequelize.define('NewsletterSubscriber', {
        id: {
            type: DataTypes.CHAR(36).BINARY,
            primaryKey: true,
            allowNull: false,
            defaultValue: () => crypto.randomUUID()
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        subscribed_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        unsubscribed_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        source: {
            type: DataTypes.STRING(100),
            allowNull: true
        }
    }, {
        tableName: 'newsletter_subscribers',
        timestamps: false,
        underscored: true
    });

    return NewsletterSubscriber;
};
