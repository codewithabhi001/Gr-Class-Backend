'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('vessels', {
            id: {
                type: Sequelize.CHAR(36).BINARY,
                primaryKey: true,
                allowNull: false
            },
            client_id: {
                type: Sequelize.CHAR(36).BINARY,
                allowNull: true,
                references: {
                    model: 'clients',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            vessel_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            imo_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            call_sign: {
                type: Sequelize.STRING,
                allowNull: true
            },
            mmsi_number: {
                type: Sequelize.STRING,
                allowNull: true
            },
            flag_administration_id: {
                type: Sequelize.CHAR(36).BINARY,
                allowNull: false,
                references: {
                    model: 'flag_administrations',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            port_of_registry: {
                type: Sequelize.STRING,
                allowNull: true
            },
            year_built: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            ship_type: {
                type: Sequelize.STRING,
                allowNull: true
            },
            gross_tonnage: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: true
            },
            net_tonnage: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: true
            },
            deadweight: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: true
            },
            class_status: {
                type: Sequelize.ENUM('ACTIVE', 'SUSPENDED', 'WITHDRAWN'),
                defaultValue: 'ACTIVE',
                allowNull: true
            },
            current_class_society: {
                type: Sequelize.STRING,
                allowNull: true
            },
            engine_type: {
                type: Sequelize.STRING,
                allowNull: true
            },
            builder_name: {
                type: Sequelize.STRING,
                allowNull: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        await queryInterface.addIndex('vessels', ['client_id']);
        await queryInterface.addIndex('vessels', ['imo_number'], { unique: true, name: 'vessels_imo_number_unique' });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('vessels');
    }
};
