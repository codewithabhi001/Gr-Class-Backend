import { SESClient } from '@aws-sdk/client-ses';
import env from './env.js';

/**
 * AWS SES Client Configuration
 */
const sesClient = new SESClient({
    region: env.aws.ses.region || env.aws.region,
    credentials: {
        accessKeyId: env.aws.ses.accessKeyId,
        secretAccessKey: env.aws.ses.secretAccessKey,
    },
});

/**
 * Sender Email Map
 */
export const SENDER_MAP = {
    alerts: 'alerts@grclass.com',
    notifications: 'notify@grclass.com',
    system: 'no-reply@grclass.com',
};

export default sesClient;
