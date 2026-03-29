import { escapeHtml, wrapEmailHtml } from './layout.js';

/**
 * Password reset link email.
 * Expected data: { resetUrl: string, ttlMinutes?: number, userName?: string }
 */
export const templateName = 'PASSWORD_RESET';

export const render = (data) => {
    const resetUrl = String(data.resetUrl || '');
    const ttl = data.ttlMinutes != null ? Number(data.ttlMinutes) : 60;
    const userName = data.userName ? escapeHtml(data.userName) : '';

    const subject = 'Reset your GR Class password';

    const greeting = userName
        ? `<p style="margin:0 0 12px;">Hi ${userName},</p>`
        : `<p style="margin:0 0 12px;">Hello,</p>`;

    const innerHtml = `
      ${greeting}
      <p style="margin:0 0 16px;">We received a request to reset your password. Click the button below to choose a new password.</p>
      <p style="margin:0 0 20px;">
        <a href="${escapeHtml(resetUrl)}" style="display:inline-block;background:#18181b;color:#fafafa;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600;font-size:14px;">Reset password</a>
      </p>
      <p style="margin:0 0 12px;color:#52525b;font-size:13px;">Or copy and paste this link into your browser:</p>
      <p style="margin:0 0 20px;word-break:break-all;font-size:13px;color:#3f3f46;">${escapeHtml(resetUrl)}</p>
      <p style="margin:0;color:#52525b;font-size:14px;">This link expires in ${ttl} minute${ttl === 1 ? '' : 's'}. If you did not ask for a reset, you can ignore this email.</p>
    `;

    return {
        subject,
        html: wrapEmailHtml({ title: subject, innerHtml }),
        type: 'system',
    };
};
