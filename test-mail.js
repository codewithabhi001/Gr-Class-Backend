import dotenv from 'dotenv';
dotenv.config();

import * as emailService from './src/services/email.service.js';

const testMail = async () => {
    const to = 'abhivishwkarmaa52@gmail.com';
    const name = 'Abhinav Vishwakarma';
    const email = to;
    const password = 'TestPassword@123';

    const welcomeEmailBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #1a3c5a;">TEST: Welcome to GR-Class Class, ${name}!</h2>
            <p>This is a manual test mail from the server.</p>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Login URL:</strong> <a href="https://grclass.com">https://grclass.com</a></p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> ${password}</p>
            </div>
            <p>Please ignore this mail if received by mistake.</p>
            <br>
            <p>Best Regards,<br><strong>GR-Class Class Dev Team</strong></p>
        </div>
    `;

    console.log(`Sending test mail to ${to}...`);
    const success = await emailService.sendEmail(to, 'GR-Class Class - Manual Test Email', welcomeEmailBody, 'system');
    
    if (success) {
        console.log('✅ Success! Test email sent.');
    } else {
        console.log('❌ Failed to send test email. Check logs.');
    }
    process.exit(0);
};

testMail();
