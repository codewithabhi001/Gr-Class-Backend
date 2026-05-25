// Certificate Expiry Monitor Cron Job
import cron from 'node-cron';
import db from '../models/index.js';
import * as certService from '../modules/certificates/certificate.service.js';
import * as emailService from './email.service.js';
import logger from '../utils/logger.js';

export const startMonitoring = () => {
    // Check every day at 00:05
    cron.schedule('5 0 * * *', async () => {
        logger.info('CRON: Processing Certificate Lifecycle (Expiry & Alerts)');
        
        try {
            const now = new Date();
            
            // 1. Mark Expired Certificates
            const expiredCount = await db.Certificate.update(
                { status: 'EXPIRED' },
                { 
                    where: { 
                        status: { [db.Sequelize.Op.in]: ['ISSUED', 'VALID'] }, // Both ISSUED and VALID ones can expire
                        expiry_date: { [db.Sequelize.Op.lt]: now } 
                    } 
                }
            );
            if (expiredCount[0] > 0) {
                logger.info(`[CRON] Marked ${expiredCount[0]} certificates as EXPIRED`);
            }

            // 2. Alert Generation (90, 60, 30, 7 days)
            const alertDays = [90, 60, 30, 7];
            
            for (const days of alertDays) {
                // Find certificates expiring EXACTLY in 'days' to avoid repeat emails
                const targetDate = new Date();
                targetDate.setDate(now.getDate() + days);
                const dateString = targetDate.toISOString().split('T')[0];

                const certificates = await db.Certificate.findAll({
                    where: {
                        status: { [db.Sequelize.Op.in]: ['ISSUED', 'VALID'] }, // Both ISSUED and VALID ones can expire
                        expiry_date: {
                            [db.Sequelize.Op.gte]: `${dateString} 00:00:00`,
                            [db.Sequelize.Op.lte]: `${dateString} 23:59:59`
                        }
                    },
                    include: [
                        { model: db.Vessel },
                        { model: db.CertificateType }
                    ]
                });
                
                for (const cert of certificates) {
                    const vessel = cert.Vessel;
                    if (!vessel || !vessel.client_id) continue;

                    const clientUsers = await db.User.findAll({
                        where: { client_id: vessel.client_id, role: 'CLIENT', status: 'ACTIVE' },
                        attributes: ['email']
                    });

                    const clientEmails = clientUsers.map(u => u.email).filter(Boolean);
                    
                    if (clientEmails.length > 0) {
                        try {
                            await emailService.sendTemplateEmail(clientEmails, 'CERTIFICATE_EXPIRY', {
                                certificateNumber: cert.certificate_number,
                                vesselName: vessel.vessel_name,
                                certificateType: cert.CertificateType?.name || 'Maritime Certificate',
                                expiryDate: new Date(cert.expiry_date).toLocaleDateString(),
                                daysRemaining: days
                            });
                            logger.info(`[CRON] Expiry notice (${days}d) sent for Cert ${cert.certificate_number}`);
                        } catch (mailErr) {
                            logger.warn(`[CRON] Failed to send email for Cert ${cert.certificate_number}: ${mailErr.message}`);
                        }
                    }
                }
            }
        } catch (e) {
            logger.error('CRON Error (Certificate Expiry Monitor):', e);
        }
    });

    logger.info('System Monitoring Logic Initialized (Node-Cron)');
};
