import { escapeHtml, wrapEmailHtml } from './layout.js';
import { emailTheme as theme } from './theme.js';

/**
 * Email address verification (magic link).
 * Expected data: { verifyUrl: string, ttlMinutes?: number, userName?: string }
 */
export const templateName = 'EMAIL_VERIFICATION';

export const render = (data) => {
    const verifyUrl = String(data.verifyUrl || '');
    const ttl = data.ttlMinutes != null ? Number(data.ttlMinutes) : 24 * 60;
    const userName = data.userName ? escapeHtml(data.userName) : '';

    const subject = 'Verify Your Email - GR Class';

    const greeting = userName
        ? `Hi ${userName},`
        : `Hello,`;

    const innerHtml = `
      <p style="margin: 0; font-size: 11px; font-weight: 700; color: ${theme.colors.brand.main}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
        Account Verification
      </p>
      <h1 style="margin: 0; color: ${theme.colors.text.core}; font-size: 22px; font-weight: 800; line-height: 1.2; letter-spacing: -0.02em;">
        Confirm Your Email
      </h1>
      <p style="margin: 20px 0; color: ${theme.colors.text.body}; font-size: 14px; line-height: 1.6;">
        ${greeting}<br><br>
        Thank you for joining the GR Class platform. Please confirm your email address to activate your account and gain access to our maritime certification systems.
      </p>
      
      <div align="center" style="margin: 30px 0;">
        <a href="${escapeHtml(verifyUrl)}" style="background-color: ${theme.colors.brand.main}; color: ${theme.colors.text.white}; padding: 14px 28px; border-radius: ${theme.radius.md}; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
          Verify Email Address
        </a>
      </div>

      <div style="background-color: ${theme.colors.brand.surface}; border: 1px solid ${theme.colors.brand.faded}; border-radius: ${theme.radius.lg}; padding: 20px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 12px; color: ${theme.colors.text.muted}; line-height: 1.6;">
            <strong>Verification link:</strong><br>
            <a href="${escapeHtml(verifyUrl)}" style="color: ${theme.colors.brand.deep}; text-decoration: none; word-break: break-all;">${escapeHtml(verifyUrl)}</a>
        </p>
      </div>

      <p style="margin: 0; font-size: 12px; color: ${theme.colors.text.muted}; line-height: 1.6; text-align: center;">
        This verification link is valid for <strong>${Math.floor(ttl/60)} hours</strong>.<br>
        If you did not register for this account, you can safely ignore this email.
      </p>
    `;

    return {
        subject,
        html: wrapEmailHtml({ title: subject, innerHtml }),
        type: 'system',
    };
};
