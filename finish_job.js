
import db from './src/models/index.js';
import * as surveyService from './src/modules/surveys/survey.service.js';
import * as paymentService from './src/modules/payments/payment.service.js';
import * as certificateService from './src/modules/certificates/certificate.service.js';

async function finishJob() {
    try {
        const jobId = '019dfc4d-e620-7129-829c-ae0132d154c5'; // Vessel Beta
        const tmUser = await db.User.findOne({ where: { role: 'TM', status: 'ACTIVE' } });
        const adminUser = await db.User.findOne({ where: { role: 'ADMIN', status: 'ACTIVE' } });
        const authority = await db.CertificateAuthority.findOne({ where: { status: 'ACTIVE' } });

        console.log('Finalizing Job (TM)...');
        await surveyService.finalizeSurvey(jobId, tmUser);
        
        console.log('Processing Payment (Admin)...');
        const payment = await paymentService.createInvoice({ job_id: jobId, amount: 1500, currency: 'USD' }, adminUser.id);
        await paymentService.markPaid(payment.id, adminUser.id, null, { remarks: 'Manual finish' });
        
        console.log('Generating Certificate (Admin)...');
        const certDraft = await certificateService.generateCertificate({
            job_id: jobId,
            validity_years: 1,
            certificate_authority_id: authority.id,
            certificate_term: 'FULL_TERM'
        }, adminUser);
        await certificateService.issueCertificate(certDraft.id, adminUser);
        
        console.log('Job finished successfully!');
    } catch (error) {
        console.error('Error finishing job:', error);
    } finally {
        process.exit();
    }
}

finishJob();
