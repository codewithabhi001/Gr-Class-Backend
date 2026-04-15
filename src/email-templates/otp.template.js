import { escapeHtml, wrapEmailHtml } from './layout.js';
import { emailTheme as theme } from './theme.js';

/**
 * OTP / verification code email.
 * Expected data: { otp: string, purpose?: string, ttlMinutes?: number }
 */
export const templateName = 'OTP';

export const render = (data) => {
    const otp = escapeHtml(data.otp);
    const purpose = data.purpose ? escapeHtml(data.purpose) : 'verification';
    const ttl = data.ttlMinutes != null ? Number(data.ttlMinutes) : 10;

    const subject = 'Verification Code - GR Class';

    const innerHtml = `
      <p style="margin: 0; font-size: 11px; font-weight: 700; color: ${theme.colors.brand.main}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
        Identity Verification
      </p>
      <h1 style="margin: 0; color: ${theme.colors.text.core}; font-size: 22px; font-weight: 800; line-height: 1.2; letter-spacing: -0.02em;">
        ${purpose.charAt(0).toUpperCase() + purpose.slice(1)} Code
      </h1>
      <p style="margin: 20px 0; color: ${theme.colors.text.body}; font-size: 14px; line-height: 1.6;">
        Please use the following single-use code to complete your security verification process. This code is valid for a limited duration.
      </p>
      
      <div align="center" style="background-color: ${theme.colors.brand.surface}; border: 1px solid ${theme.colors.brand.faded}; border-radius: ${theme.radius.lg}; padding: 30px; margin-bottom: 30px;">
        <div style="font-size: 32px; font-weight: 800; letter-spacing: 0.25em; color: ${theme.colors.brand.primary}; font-family: 'Courier New', Courier, monospace;">
          ${otp}
        </div>
      </div>

      <p style="margin: 0; font-size: 12px; color: ${theme.colors.text.muted}; line-height: 1.6; text-align: center;">
        Expires in <strong>${ttl} minute${ttl === 1 ? '' : 's'}</strong>.<br>
        If you did not initiate this request, please secure your account.
      </p>
    `;

    return {
        subject,
        html: wrapEmailHtml({ title: subject, innerHtml }),
        type: 'system',
    };
};
