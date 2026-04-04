import dotenv from 'dotenv';
dotenv.config();

import * as emailService from './src/services/email.service.js';

const testMail = async () => {
    const to = 'abhivishwkarmaa52@gmail.com';
    const data = {
        name: 'Abhinav Vishwakarma',
        email: to,
        password: 'TestPassword@123',
        loginUrl: 'https://grclass.com'
    };

    console.log(`Sending template-based test mail to ${to}...`);
    const success = await emailService.sendTemplateEmail(to, 'WELCOME_USER', data);
    
    if (success) {
        console.log('✅ Success! Template-based email sent.');
    } else {
        console.log('❌ Failed to send template-based email. Check logs.');
    }
    process.exit(0);
};

testMail();
