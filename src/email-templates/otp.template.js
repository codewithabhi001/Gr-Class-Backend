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

    const subject = `[${purpose.toUpperCase()}] Security Token - GR Class`;

    const innerHtml = `
      <p style="margin: 0; font-size: 11px; font-weight: 700; color: ${theme.colors.brand.main}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
        Identity Verification
      </p>
      <h1 style="margin: 0; color: ${theme.colors.text.core}; font-size: 22px; font-weight: 800; line-height: 1.2; letter-spacing: -0.02em;">
        ${purpose.charAt(0).toUpperCase() + purpose.slice(1)} Token
      </h1>
      <p style="margin: 20px 0; color: ${theme.colors.text.body}; font-size: 14px; line-height: 1.6;">
        Authenticate your session on the <strong>GR Class</strong> maritime network. Use the following diagnostic token to proceed with your requested action.
      </p>
      
      <div style="background-color: ${theme.colors.brand.surface}; border: 1px solid ${theme.colors.brand.faded}; border-radius: 0; padding: 40px 20px; text-align: center; margin-bottom: 30px;">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; color: ${theme.colors.brand.main}; letter-spacing: 8px;">${otp}</span>
      </div>

      <p style="margin: 0; font-size: 12px; color: ${theme.colors.text.muted}; line-height: 1.6; border-top: 1px solid ${theme.colors.brand.faded}; padding-top: 20px;">
        <strong>Validation:</strong> Expires in <strong>${ttl} minutes</strong>. If you did not initiate this authentication request, please notify your division supervisor immediately.
      </p>
    `;

    return {
        subject,
        html: wrapEmailHtml({ title: subject, innerHtml }),
        type: 'system',
    };
};
