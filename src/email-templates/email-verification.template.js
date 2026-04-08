import { escapeHtml, wrapEmailHtml } from './layout.js';

/**
 * Email address verification (magic link).
 * Expected data: { verifyUrl: string, ttlMinutes?: number, userName?: string }
 */
export const templateName = 'EMAIL_VERIFICATION';

export const render = (data) => {
    const verifyUrl = String(data.verifyUrl || '');
    const ttl = data.ttlMinutes != null ? Number(data.ttlMinutes) : 24 * 60;
    const userName = data.userName ? escapeHtml(data.userName) : '';

    const subject = 'Verify your email for GR Class';

    const greeting = userName
        ? `<p style="margin:0 0 12px;">Hi ${userName},</p>`
        : `<p style="margin:0 0 12px;">Hello,</p>`;

    const innerHtml = `
      ${greeting}
      <p style="margin:0 0 16px;">Please confirm your email address by clicking the button below.</p>
      <p style="margin:0 0 20px;">
        <a href="${escapeHtml(verifyUrl)}" style="display:inline-block;background:#14b8a6;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600;font-size:14px;">Verify email</a>
      </p>
      <p style="margin:0 0 12px;color:#71717a;font-size:13px;">Or open this link:</p>
      <p style="margin:0 0 20px;word-break:break-all;font-size:13px;color:#4b5563;">${escapeHtml(verifyUrl)}</p>
      <p style="margin:0;color:#71717a;font-size:14px;">This link expires in ${ttl} minute${ttl === 1 ? '' : 's'}.</p>
    `;

    return {
        subject,
        html: wrapEmailHtml({ title: subject, innerHtml }),
        type: 'system',
    };
};
