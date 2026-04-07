import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import nodemailer from 'nodemailer';
import env from './env.js';

/**
 * AWS SESv2 Client Configuration
 * Modern Nodemailer (v7/v8) expects SESv2 for SDK v3 integration.
 */
const sesClient = new SESv2Client({
    region: env.aws.ses.region || env.aws.region,
    credentials: {
        accessKeyId: env.aws.ses.accessKeyId,
        secretAccessKey: env.aws.ses.secretAccessKey,
    },
});

/**
 * Nodemailer transporter for SES — allows for easy attachments and CID images.
 * Note: Newer nodemailer uses 'sesClient' and 'SendEmailCommand' in the config object.
 */
export const mailTransporter = nodemailer.createTransport({
    SES: { sesClient, SendEmailCommand },
});

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
