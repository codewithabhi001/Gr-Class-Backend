import { escapeHtml, wrapEmailHtml } from './layout.js';
import { emailTheme as theme } from './theme.js';

/**
 * Password reset link email.
 * Expected data: { resetUrl: string, ttlMinutes?: number, userName?: string }
 */
export const templateName = 'PASSWORD_RESET';

export const render = (data) => {
    const resetUrl = String(data.resetUrl || '');
    const ttl = data.ttlMinutes != null ? Number(data.ttlMinutes) : 10;
    const userName = data.userName ? escapeHtml(data.userName) : '';

    const subject = 'Password Reset Request - GR Class';

    const greeting = userName
        ? `Hi ${userName},`
        : `Hello,`;

    const innerHtml = `
      <p style="margin: 0; font-size: 11px; font-weight: 700; color: ${theme.colors.brand.main}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
        Security Update
      </p>
      <h1 style="margin: 0; color: ${theme.colors.text.core}; font-size: 22px; font-weight: 800; line-height: 1.2; letter-spacing: -0.02em;">
        Reset Your Password
      </h1>
      <p style="margin: 20px 0; color: ${theme.colors.text.body}; font-size: 14px; line-height: 1.6;">
        ${greeting}<br><br>
        We received a request to reset the password for your account. Click the button below to establish a new, secure password.
      </p>
      
      <div align="center" style="margin: 30px 0;">
        <a href="${escapeHtml(resetUrl)}" style="background-color: ${theme.colors.brand.main}; color: ${theme.colors.text.white}; padding: 14px 28px; border-radius: ${theme.radius.md}; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
          Reset Access Password
        </a>
      </div>

      <div style="background-color: ${theme.colors.brand.surface}; border: 1px solid ${theme.colors.brand.faded}; border-radius: ${theme.radius.lg}; padding: 20px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 12px; color: ${theme.colors.text.muted}; line-height: 1.6;">
            <strong>Link direct:</strong><br>
            <a href="${escapeHtml(resetUrl)}" style="color: ${theme.colors.brand.deep}; text-decoration: none; word-break: break-all;">${escapeHtml(resetUrl)}</a>
        </p>
      </div>

      <p style="margin: 0; font-size: 12px; color: ${theme.colors.text.muted}; line-height: 1.6; text-align: center;">
        This request expires in <strong>${ttl} minute${ttl === 1 ? '' : 's'}</strong>.<br>
        If you did not request this, please ignore this email.
      </p>
    `;

    return {
        subject,
        html: wrapEmailHtml({ title: subject, innerHtml }),
        type: 'system',
    };
};
