#!/usr/bin/env node
/**
 * Sends one test email using the same config as the app (.env).
 *
 * Usage:
 *   node scripts/test-email.js you@example.com
 *   node scripts/test-email.js you@example.com --purpose=auth
 *   TEST_EMAIL_TO=you@example.com TEST_EMAIL_PURPOSE=alerts node scripts/test-email.js
 *
 * Requires either EMAIL_PROVIDER=ses (+ AWS + verified From) or SMTP_*.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { sendEmail, getMailFrom } = await import('../src/services/email.service.js');

const PURPOSES = new Set(['default', 'auth', 'alerts']);

const argv = process.argv.slice(2);
let purpose = (process.env.TEST_EMAIL_PURPOSE || 'default').toLowerCase();
const positional = [];
for (const a of argv) {
    if (a.startsWith('--purpose=')) {
        purpose = a.slice('--purpose='.length).toLowerCase();
    } else if (!a.startsWith('--')) {
        positional.push(a);
    }
}

if (!PURPOSES.has(purpose)) {
    console.error(`Invalid --purpose / TEST_EMAIL_PURPOSE: ${purpose}. Use: default | auth | alerts`);
    process.exit(1);
}

const purposeOption = purpose === 'default' ? {} : { purpose };

const to = positional[0] || process.env.TEST_EMAIL_TO;
if (!to || !to.includes('@')) {
    console.error('Usage: node scripts/test-email.js <recipient@email.com> [--purpose=default|auth|alerts]');
    console.error('   or: TEST_EMAIL_TO=<recipient@email.com> [TEST_EMAIL_PURPOSE=...] node scripts/test-email.js');
    process.exit(1);
}

const provider = (process.env.EMAIL_PROVIDER || 'smtp').toLowerCase();
const resolvedFrom = getMailFrom(purposeOption);

console.log('--- GR-CLASS email test ---');
console.log('Provider:', provider === 'ses' ? 'Amazon SES' : 'SMTP (Nodemailer)');
console.log('Purpose:', purpose);
if (provider === 'ses') {
    console.log('Region:', process.env.AWS_REGION || process.env.SES_REGION || '(missing)');
} else {
    console.log('SMTP host:', process.env.SMTP_HOST || '(missing)');
}
console.log('Resolved From:', resolvedFrom);
console.log('To:', to);
console.log('Sending...');

const subject = `[GR-CLASS] Test email (${purpose}) ${new Date().toISOString()}`;
const text = `This is a test message from GR-CLASS_BACKEND (scripts/test-email.js).

Purpose: ${purpose}
If you received this, email delivery is working.

Time: ${new Date().toISOString()}
`;
const html = `<p>This is a <strong>test</strong> message from <code>GR-CLASS_BACKEND</code> (<code>scripts/test-email.js</code>).</p>
<p>Purpose: <code>${purpose}</code></p>
<p>If you received this, email delivery is working.</p>
<p><small>${new Date().toISOString()}</small></p>`;

const ok = await sendEmail(to, subject, text, html, purposeOption);

if (ok) {
    console.log('ok: sendEmail returned true — check inbox/spam.');
    process.exit(0);
}

console.error('fail: sendEmail returned false — check logs (error.log / combined.log) and AWS/SES or SMTP settings.');
process.exit(1);
