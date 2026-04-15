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

    const subject = 'Welcome to GR Class - Portal Access Credentials';

    const innerHtml = `
      <h1 style="margin: 0; color: ${theme.colors.text.core}; font-size: 22px; font-weight: 800; line-height: 1.2; letter-spacing: -0.02em;">
        Account Successfully Created
      </h1>
      <p style="margin: 20px 0; color: ${theme.colors.text.body}; font-size: 14px; line-height: 1.6;">
        Hi ${userName},<br><br>
        Welcome to <strong>GR Class</strong>. Your administrative account has been established. You can now access your dashboard and certification management tools using the secure credentials provided below.
      </p>
      
      <div style="background-color: ${theme.colors.brand.surface}; border: 1px solid ${theme.colors.brand.faded}; border-radius: ${theme.radius.lg}; padding: 24px; margin-bottom: 30px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="margin: 0; font-size: 11px; font-weight: 700; color: ${theme.colors.brand.main}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">
                Access Credentials
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: ${theme.colors.text.muted}; width: 80px;">Portal</td>
                  <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: ${theme.colors.text.core};"><a href="${loginUrl}" style="color: ${theme.colors.brand.deep}; text-decoration: none;">${loginUrl}</a></td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: ${theme.colors.text.muted};">User ID</td>
                  <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: ${theme.colors.text.core};">${userEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: ${theme.colors.text.muted};">Passkey</td>
                  <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: ${theme.colors.text.core};"><code style="background: ${theme.colors.neutral[200]}; padding: 2px 6px; border-radius: 4px;">${userPassword}</code></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>

      <div align="center" style="margin-bottom: 30px;">
        <a href="${loginUrl}" style="background-color: ${theme.colors.brand.main}; color: ${theme.colors.text.white}; padding: 14px 28px; border-radius: ${theme.radius.md}; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
          Access Secure Portal
        </a>
      </div>

      <p style="margin: 0; font-size: 12px; color: ${theme.colors.text.muted}; line-height: 1.6; border-top: 1px solid ${theme.colors.brand.faded}; padding-top: 20px;">
        <strong>Security Notice:</strong> For your protection, we recommend updating your password immediately after your initial login. If you did not expect this invitation, please ignore this email or contact support.
      </p>
    `;

    return {
        subject,
        html: wrapEmailHtml({ title: subject, innerHtml }),
        type: 'system',
    };
};
