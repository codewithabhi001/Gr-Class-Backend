// Certificate Expiry Monitor Cron Job
import cron from 'node-cron';
import db from '../models/index.js';
import * as certService from '../modules/certificates/certificate.service.js';
import * as emailService from './email.service.js';
import logger from '../utils/logger.js';

export const startMonitoring = () => {
    // Check every day at 00:01
    cron.schedule('1 0 * * *', async () => {
        logger.info('CRON: Checking Certificate Expirations (30, 15, 7 days)');
        
        try {
            const checkDays = [30, 15, 7];
            
            for (const days of checkDays) {
                const certificates = await certService.getExpiringCertificates(days);
                
                for (const cert of certificates) {
                    const vessel = cert.Vessel;
                    if (!vessel || !vessel.client_id) continue;

                    // Fetch active client users for this vessel's client
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
                            logger.info(`[CRON] Expiry notice (${days}d) sent to ${clientEmails.length} users for Cert ${cert.certificate_number}`);
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
