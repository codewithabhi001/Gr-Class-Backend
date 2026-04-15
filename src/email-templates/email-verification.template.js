import { escapeHtml, wrapEmailHtml } from './layout.js';
import { emailTheme as theme } from './theme.js';

/**
 * Email verification / activation email.
 * Expected data: { verifyUrl: string, ttlSeconds?: number, userName?: string }
 */
export const templateName = 'EMAIL_VERIFICATION';

export const render = (data) => {
    const verifyUrl = String(data.verifyUrl || '');
    const ttl = data.ttlSeconds != null ? Number(data.ttlSeconds) : 86400; // 24h
    const userName = data.userName ? escapeHtml(data.userName) : '';

    const subject = 'Activate Your Account - GR Class';

    const greeting = userName
        ? `Hi ${userName},`
        : `Hello,`;

    const innerHtml = `
      <p style="margin: 0; font-size: 11px; font-weight: 700; color: ${theme.colors.brand.main}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
        Account activation
      </p>
      <h1 style="margin: 0; color: ${theme.colors.text.core}; font-size: 22px; font-weight: 800; line-height: 1.2; letter-spacing: -0.02em;">
        Confirm Identity
      </h1>
      <p style="margin: 20px 0; color: ${theme.colors.text.body}; font-size: 14px; line-height: 1.6;">
        ${greeting}<br><br>
        Thank you for registering on the <strong>GR Class</strong> maritime portal. To finalize your division access and activate all professional tools, please verify your email address.
      </p>
      
      <div align="center" style="margin: 35px 0;">
        <a href="${escapeHtml(verifyUrl)}" style="background-color: ${theme.colors.brand.main}; color: ${theme.colors.text.white}; padding: 15px 35px; border-radius: 0; text-decoration: none; font-size: 13px; font-weight: 700; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em;">
          Confirm activation
        </a>
      </div>

      <div style="background-color: ${theme.colors.brand.surface}; border: 1px solid ${theme.colors.brand.faded}; border-radius: 0; padding: 20px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 12px; color: ${theme.colors.text.muted}; line-height: 1.6;">
            <strong>Manual URL:</strong><br>
            <a href="${escapeHtml(verifyUrl)}" style="color: ${theme.colors.brand.main}; text-decoration: none; word-break: break-all;">${escapeHtml(verifyUrl)}</a>
        </p>
      </div>

      <p style="margin: 0; font-size: 12px; color: ${theme.colors.text.muted}; line-height: 1.6; border-top: 1px solid ${theme.colors.brand.faded}; padding-top: 20px;">
        <strong>Validation:</strong> Link expires in <strong>${Math.floor(ttl/3600)} hours</strong>. If you did not register for an account, please disregard this message.
      </p>
    `;

    return {
        subject,
        html: wrapEmailHtml({ title: subject, innerHtml }),
        type: 'system',
    };
};
