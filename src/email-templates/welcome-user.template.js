import { escapeHtml, wrapEmailHtml } from './layout.js';
import { emailTheme as theme } from './theme.js';

/**
 * Welcome user email with credentials.
 * Expected data: { name: string, email: string, password: string, loginUrl?: string }
 */
export const templateName = 'WELCOME_USER';

export const render = (data) => {
    const userName = data.name ? escapeHtml(data.name) : 'User';
    const userEmail = data.email ? escapeHtml(data.email) : '';
    const userPassword = data.password ? escapeHtml(data.password) : '';
    const loginUrl = data.loginUrl ? escapeHtml(data.loginUrl) : 'https://ops.grclass.com';

    const subject = 'GR Class - Portal Access Credentials';

    const innerHtml = `
      <h1 style="margin: 0; color: ${theme.colors.text.core}; font-size: 21px; font-weight: 800; line-height: 1.2; letter-spacing: -0.02em;">
        PORTAL ACCESS GRANTED
      </h1>
      <p style="margin: 20px 0; color: ${theme.colors.text.body}; font-size: 14px; line-height: 1.6;">
        Hi ${userName},<br><br>
        Your administrative access to the <strong>GR Class</strong> maritime portal has been successfully provisioned. You can now manage vessel inspections and certification workflows using the secure credentials below.
      </p>
      
      <div style="background-color: ${theme.colors.brand.surface}; border: 1px solid ${theme.colors.brand.faded}; border-radius: 0; padding: 24px; margin-bottom: 30px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="margin: 0; font-size: 11px; font-weight: 700; color: ${theme.colors.brand.main}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">
                Secure Credentials
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: ${theme.colors.text.muted}; width: 100px;">Access Link</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: ${theme.colors.text.core};"><a href="${loginUrl}" style="color: ${theme.colors.brand.main}; text-decoration: none;">${loginUrl}</a></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: ${theme.colors.text.muted};">User ID</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: ${theme.colors.text.core};">${userEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: ${theme.colors.text.muted};">Passkey</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: ${theme.colors.text.core};"><code style="background: #f1f5f9; padding: 3px 6px; color: ${theme.colors.brand.main}; border: 1px solid #e2e8f0;">${userPassword}</code></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>

      <div align="center" style="margin-bottom: 30px;">
        <a href="${loginUrl}" style="background-color: ${theme.colors.brand.main}; color: ${theme.colors.text.white}; padding: 15px 35px; border-radius: 0; text-decoration: none; font-size: 13px; font-weight: 700; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em;">
          Enter Portal Now
        </a>
      </div>

      <p style="margin: 0; font-size: 12px; color: ${theme.colors.text.muted}; line-height: 1.6; border-top: 1px solid ${theme.colors.brand.faded}; padding-top: 20px;">
        <strong>Safety Advisory:</strong> For sensitive maritime operations, we mandate a password update upon first entry. Please ensure these credentials are kept confidential within your authorized division.
      </p>
    `;

    return {
        subject,
        html: wrapEmailHtml({ title: subject, innerHtml }),
        type: 'system',
    };
};
