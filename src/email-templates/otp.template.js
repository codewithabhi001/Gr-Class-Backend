import { escapeHtml, wrapEmailHtml } from './layout.js';

/**
 * OTP / verification code email.
 * Expected data: { otp: string, purpose?: string, ttlMinutes?: number }
 */
export const templateName = 'OTP';

export const render = (data) => {
    const otp = escapeHtml(data.otp);
    const purpose = data.purpose ? escapeHtml(data.purpose) : 'verification';
    const ttl = data.ttlMinutes != null ? Number(data.ttlMinutes) : 10;

    const subject = 'Your GR Class verification code';

    const innerHtml = `
      <p style="margin:0 0 12px;">Your one-time code for <strong>${purpose}</strong> is:</p>
      <p style="margin:0 0 20px;font-size:28px;font-weight:700;letter-spacing:0.2em;">${otp}</p>
      <p style="margin:0;color:#52525b;font-size:14px;">This code expires in ${ttl} minute${ttl === 1 ? '' : 's'}. If you did not request this, you can ignore this email.</p>
    `;

    return {
        subject,
        html: wrapEmailHtml({ title: subject, innerHtml }),
        type: 'system',
    };
};
