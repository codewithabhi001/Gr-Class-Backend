import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import nodemailer from 'nodemailer';
import env from './env.js';

let mailTransporter;

if (env.mail.host) {
    // Standard SMTP Transporter
    mailTransporter = nodemailer.createTransport({
        host: env.mail.host,
        port: env.mail.port,
        secure: env.mail.port == 465, // true for 465, false for other ports
        auth: {
            user: env.mail.user,
            pass: env.mail.pass,
        },
    });
} else {
    // AWS SESv2 Transporter
    const credentials = (env.aws.ses.accessKeyId && env.aws.ses.secretAccessKey)
        ? {
            accessKeyId: env.aws.ses.accessKeyId,
            secretAccessKey: env.aws.ses.secretAccessKey,
        }
        : undefined;

    const sesClient = new SESv2Client({
        region: env.aws.ses.region || env.aws.region,
        ...(credentials && { credentials }),
    });

    mailTransporter = nodemailer.createTransport({
        SES: { sesClient, SendEmailCommand },
    });
}

export { mailTransporter };

/**
 * Sender Email Map
 */
export const SENDER_MAP = {
    alerts: 'alerts@grclass.com',
    notifications: 'notify@grclass.com',
    notification: 'notify@grclass.com',
    system: 'no-reply@grclass.com',
    subscribe: 'subscribe@grclass.com'
};

export default sesClient;
