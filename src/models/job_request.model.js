import { generateUniqueRandomId } from '../utils/idGenerator.util.js';

export default (sequelize, DataTypes) => {
    const JobRequest = sequelize.define('JobRequest', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV7, primaryKey: true },
        job_request_number: { 
            type: DataTypes.STRING, 
            unique: true,
            comment: 'Formatted random ID: GRJ-XXXXXXXX'
        },
        vessel_id: { type: DataTypes.UUID, allowNull: false },
        requested_by_user_id: { type: DataTypes.UUID, allowNull: false },
        certificate_type_id: { type: DataTypes.UUID, allowNull: false },
        reason: { type: DataTypes.TEXT, allowNull: false },
        target_port: { type: DataTypes.STRING, allowNull: false },
        target_date: { type: DataTypes.DATEONLY, allowNull: false },
        job_status: {
            type: DataTypes.ENUM(
                'CREATED', 'DOCUMENT_VERIFIED', 'APPROVED', 'ASSIGNED', 'SURVEY_AUTHORIZED', 'IN_PROGRESS', 'SURVEY_DONE',
                'REVIEWED', 'FINALIZED', 'REWORK_REQUESTED', 'PAYMENT_DONE', 'CERTIFIED', 'REJECTED'
            ),
            defaultValue: 'CREATED',
            get() {
                const raw = this.getDataValue('job_status');
                return (raw === null || raw === '') ? 'CREATED' : raw;
            },
        },
        pending_action: {
            type: DataTypes.VIRTUAL,
            get() {
                const status = this.getDataValue('job_status');
                const isSurveyRequired = this.getDataValue('is_survey_required') !== false;

                switch (status) {
                    case 'CREATED':
                    case 'REQUESTED':
                    case 'PENDING':
                        return {
                            role: 'TO',
                            fallbackRoles: [],
                            message: 'Waiting for Document Verification'
                        };
                    case 'DOCUMENT_VERIFIED':
                        return {
                            role: 'GM',
                            fallbackRoles: ['ADMIN'],
                            message: 'Waiting for GM to Approve Job Request'
                        };
                    case 'APPROVED':
                        if (isSurveyRequired) {
                            return {
                                role: 'GM',
                                fallbackRoles: ['ADMIN'],
                                message: 'Waiting for GM to Assign Surveyor'
                            };
                        } else {
                            return {
                                role: 'ADMIN',
                                fallbackRoles: ['TM', 'GM'],
                                message: 'Waiting for Finalization'
                            };
                        }
                    case 'ASSIGNED':
                        return {
                            role: 'TM',
                            fallbackRoles: ['ADMIN'],
                            message: 'Waiting for TM to Authorize Survey'
                        };
                    case 'SURVEY_AUTHORIZED':
                        return {
                            role: 'SURVEYOR',
                            fallbackRoles: [],
                            message: 'Waiting for Surveyor to Start Survey'
                        };
                    case 'IN_PROGRESS':
                        return {
                            role: 'SURVEYOR',
                            fallbackRoles: [],
                            message: 'Waiting for Survey Report Submission'
                        };
                    case 'SURVEY_DONE':
                        return {
                            role: 'TO',
                            fallbackRoles: ['ADMIN', 'TM'],
                            message: 'Waiting for Document Review'
                        };
                    case 'REVIEWED': {
                        const survey = this.survey;
                        const statementStatus = survey?.survey_statement_status;
                        if (statementStatus !== 'ISSUED') {
                            return {
                                role: 'TM',
                                fallbackRoles: ['ADMIN'],
                                message: 'Waiting for TM to Issue Survey Statement'
                            };
                        } else {
                            return {
                                role: 'TM',
                                fallbackRoles: ['ADMIN', 'GM'],
                                message: 'Waiting for TM to Finalize Survey'
                            };
                        }
                    }
                    case 'FINALIZED':
                    case 'PAYMENT_DONE': {
                        if (!this.getDataValue('generated_certificate_id')) {
                            return {
                                role: 'TM',
                                fallbackRoles: ['GM', 'ADMIN'],
                                message: 'Waiting for TM to Generate Draft Certificate'
                            };
                        } else {
                            return {
                                role: 'GM',
                                fallbackRoles: ['ADMIN'],
                                message: 'Waiting for GM to Issue Certificate'
                            };
                        }
                    }
                    case 'REWORK_REQUESTED':
                        return {
                            role: 'SURVEYOR',
                            fallbackRoles: [],
                            message: 'Waiting for Surveyor to upload corrected documents'
                        };
                    default:
                        return null;
                }
            }
        },
        assigned_surveyor_id: DataTypes.UUID,
        assigned_by_user_id: DataTypes.UUID,
        generated_certificate_id: DataTypes.UUID,
        approved_by_user_id: DataTypes.UUID,
        remarks: DataTypes.TEXT,
        is_survey_required: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        reschedule_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        priority: {
            type: DataTypes.ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT'),
            defaultValue: 'NORMAL',
            allowNull: false,
            comment: 'Job priority set via PUT /:id/priority by ADMIN/GM/TM/TO'
        },
        source_activity_request_id: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: 'Set when job is created via activity request conversion',
        },
    }, {
        tableName: 'job_requests',
        underscored: true,
        timestamps: true,
        updatedAt: true,
        hooks: {
            beforeCreate: async (job) => {
                if (!job.job_request_number) {
                    job.job_request_number = await generateUniqueRandomId('GRJ', JobRequest, 'job_request_number');
                }
            }
        }
    });


    JobRequest.associate = (models) => {
        JobRequest.belongsTo(models.Vessel, { foreignKey: 'vessel_id' });
        JobRequest.belongsTo(models.User, { foreignKey: 'requested_by_user_id', as: 'requester' });
        JobRequest.belongsTo(models.User, { foreignKey: 'assigned_surveyor_id', as: 'surveyor' });
        JobRequest.belongsTo(models.User, { foreignKey: 'assigned_by_user_id', as: 'assigned_by' });
        JobRequest.belongsTo(models.User, { foreignKey: 'approved_by_user_id', as: 'approver' });
        JobRequest.belongsTo(models.CertificateType, { foreignKey: 'certificate_type_id' });
        JobRequest.belongsTo(models.Certificate, { foreignKey: 'generated_certificate_id', as: 'Certificate' });
        JobRequest.hasMany(models.JobStatusHistory, { foreignKey: 'job_id' });

        JobRequest.hasMany(models.ActivityPlanning, { foreignKey: 'job_id' });
        JobRequest.hasMany(models.NonConformity, { foreignKey: 'job_id' });
        JobRequest.hasMany(models.Payment, { foreignKey: 'job_id' });
        JobRequest.hasMany(models.JobDocument, { foreignKey: 'job_id' });
        JobRequest.hasMany(models.JobReschedule, { foreignKey: 'job_id' });
        JobRequest.hasOne(models.Survey, { foreignKey: 'job_id', as: 'survey' });
        JobRequest.belongsTo(models.ActivityRequest, {
            foreignKey: 'source_activity_request_id',
            as: 'SourceActivityRequest',
        });
    };

    return JobRequest;
};
