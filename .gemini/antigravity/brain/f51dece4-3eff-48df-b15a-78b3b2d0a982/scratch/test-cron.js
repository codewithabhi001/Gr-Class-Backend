
import db from '../src/models/index.js';
import * as certService from '../src/modules/certificates/certificate.service.js';
import * as emailService from '../src/services/email.service.js';
import logger from '../src/utils/logger.js';

async function testExpiryCheck() {
    logger.info('TEST: Checking Certificate Expirations (30, 15, 7 days)');
    
    try {
        const checkDays = [30, 15, 7];
        
        for (const days of checkDays) {
            const certificates = await certService.getExpiringCertificates(days);
            logger.info(`Found ${certificates.length} certificates expiring in ${days} days`);
            
            for (const cert of certificates) {
                const vessel = cert.Vessel;
                if (!vessel || !vessel.client_id) {
                    logger.info(`Skipping cert ${cert.certificate_number}: No vessel or client_id`);
                    continue;
                }

                // Fetch active client users for this vessel's client
                const clientUsers = await db.User.findAll({
                    where: { client_id: vessel.client_id, role: 'CLIENT', status: 'ACTIVE' },
                    attributes: ['email']
                });

                const clientEmails = clientUsers.map(u => u.email).filter(Boolean);
                
                if (clientEmails.length > 0) {
                    try {
                        const expiryStr = new Date(cert.expiry_date).toLocaleDateString();
                        logger.info(`Attempting to send email for ${cert.certificate_number} with expiry ${expiryStr}`);
                        
                        await emailService.sendTemplateEmail(clientEmails, 'CERTIFICATE_EXPIRY', {
                            certificateNumber: cert.certificate_number,
                            vesselName: vessel.vessel_name,
                            certificateType: cert.CertificateType?.name || 'Maritime Certificate',
                            expiryDate: expiryStr,
                            daysRemaining: days
                        });
                        logger.info(`[TEST] Expiry notice (${days}d) sent to ${clientEmails.length} users for Cert ${cert.certificate_number}`);
                    } catch (mailErr) {
                        logger.warn(`[TEST] Failed to send email for Cert ${cert.certificate_number}: ${mailErr.message}`);
                    }
                } else {
                    logger.info(`No client emails found for cert ${cert.certificate_number}`);
                }
            }
        }
    } catch (e) {
        logger.error('TEST Error (Certificate Expiry Monitor):', e);
    }
}

testExpiryCheck().then(() => {
    console.log('Test complete');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
