import { escapeHtml, wrapEmailHtml } from './layout.js';
import { emailTheme as theme } from './theme.js';

/**
 * Password reset link email.
 * Expected data: { resetUrl: string, ttlMinutes?: number, userName?: string }
 */
export const templateName = 'PASSWORD_RESET';

export const render = (data) => {
    const resetUrl = String(data.resetUrl || '');
    const ttl = data.ttlMinutes != null ? Number(data.ttlMinutes) : 60;
    const userName = data.userName ? escapeHtml(data.userName) : '';

    const subject = 'Password Modification Request - GR Class';

    const greeting = userName
        ? `Hi ${userName},`
        : `Hello,`;

    const innerHtml = `
      <p style="margin: 0; font-size: 11px; font-weight: 700; color: ${theme.colors.brand.main}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
        Security Protocol
      </p>
      <h1 style="margin: 0; color: ${theme.colors.text.core}; font-size: 22px; font-weight: 800; line-height: 1.2; letter-spacing: -0.02em;">
        Reset Secure Passkey
      </h1>
      <p style="margin: 20px 0; color: ${theme.colors.text.body}; font-size: 14px; line-height: 1.6;">
        ${greeting}<br><br>
        A secure password modification request has been initiated for your <strong>GR Class</strong> account. Please utilize the authenticated link below to establish a new passkey.
      </p>
      
      <div align="center" style="margin: 35px 0;">
        <a href="${escapeHtml(resetUrl)}" style="background-color: ${theme.colors.brand.main}; color: ${theme.colors.text.white}; padding: 15px 35px; border-radius: 0; text-decoration: none; font-size: 13px; font-weight: 700; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em;">
          Confirm Modification
        </a>
      </div>

      <div style="background-color: ${theme.colors.brand.surface}; border: 1px solid ${theme.colors.brand.faded}; border-radius: 0; padding: 20px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 12px; color: ${theme.colors.text.muted}; line-height: 1.6;">
            <strong>Manual Verification Link:</strong><br>
            <a href="${escapeHtml(resetUrl)}" style="color: ${theme.colors.brand.main}; text-decoration: none; word-break: break-all;">${escapeHtml(resetUrl)}</a>
        </p>
      </div>

      <p style="margin: 0; font-size: 12px; color: ${theme.colors.text.muted}; line-height: 1.6; border-top: 1px solid ${theme.colors.brand.faded}; padding-top: 20px;">
        <strong>Validation:</strong> Link expires in <strong>${ttl} minutes</strong>. If this action was not authorized, please secure your terminal immediately.
      </p>
    `;

    return {
        subject,
        html: wrapEmailHtml({ title: subject, innerHtml }),
        type: 'system',
    };
};
