import { emailTheme as theme } from './theme.js';

// (getLogoPath and getLogoCid removed — using CSS logo instead)

const EMAIL_FONT_STACK = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/**
 * Escapes text for safe use inside HTML body content.
 * @param {unknown} value
 * @returns {string}
 */
export const escapeHtml = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * GR Class branded transactional shell (table layout for email clients).
 * @param {{ title: string, innerHtml: string, preheader?: string, unsubscribeUrl?: string }} opts
 * @returns {string}
 */
export const wrapGrclassEmail = ({ title, innerHtml, preheader = '', unsubscribeUrl }) => {
  const safeTitle = escapeHtml(title);
  const pre = escapeHtml(preheader).slice(0, 200);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <style>
    body, table, td, p, a, span {
      font-family: ${EMAIL_FONT_STACK} !important;
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:${EMAIL_FONT_STACK};">
  <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0">${pre}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:40px 16px;font-family:${EMAIL_FONT_STACK};">
    <tr>
        <td align="center" style="font-family:${EMAIL_FONT_STACK};">
        <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:${theme.radius.lg};overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 20px rgba(0,0,0,0.05);font-family:${EMAIL_FONT_STACK};">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, ${theme.colors.brand[50]} 0%, #f0f9ff 100%); padding:32px 32px 32px; border-bottom:3px solid ${theme.colors.brand[500]}; font-family:${EMAIL_FONT_STACK};">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-family:${EMAIL_FONT_STACK};">
                <tr>
                  <td valign="middle" style="padding-right:20px; width:100px; font-family:${EMAIL_FONT_STACK};">
                    <a href="https://grclass.com" target="_blank" style="display:inline-block; text-decoration:none; font-family:${EMAIL_FONT_STACK};">
                      <img src="https://grclass.com/grclass-logo.webp" alt="GR Class" style="display:block; border:none; outline:none; height:70px; width:auto; max-width:180px;" />
                    </a>
                  </td>
                  <td valign="middle" style="border-left:2px solid ${theme.colors.brand[100]}; padding-left:20px; font-family:${EMAIL_FONT_STACK};">
                    <div style="font-size:24px;font-weight:800;letter-spacing:-0.02em;line-height:1.2;color:${theme.colors.brand[700]};font-family:${EMAIL_FONT_STACK};">GR Class</div>
                    <div style="font-size:14px;color:${theme.colors.brand[600]};margin-top:4px;font-weight:500;font-family:${EMAIL_FONT_STACK};">Classification &amp; certification</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px 32px;font-size:16px;line-height:1.6;color:${theme.colors.neutral[600]};font-family:${EMAIL_FONT_STACK};">
              ${innerHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:0 32px 32px; font-family:${EMAIL_FONT_STACK};">
              <table role="presentation" width="100%" style="border-top:1px solid ${theme.colors.neutral[100]};padding-top:24px; font-family:${EMAIL_FONT_STACK};">
                <tr>
                  <td style="font-size:13px;color:${theme.colors.neutral[500]};line-height:1.6;text-align:center; font-family:${EMAIL_FONT_STACK};">
                    This is an automated message from <strong style="color:${theme.colors.brand[700]}; font-family:${EMAIL_FONT_STACK};">GR Class</strong> (<a href="https://grclass.com" style="color:${theme.colors.brand[600]};text-decoration:none; font-family:${EMAIL_FONT_STACK};">grclass.com</a>).<br> Please do not reply to this email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="max-width:600px;margin:24px auto 0;font-size:12px;color:${theme.colors.neutral[400]};text-align:center; font-family:${EMAIL_FONT_STACK};">&copy; ${new Date().getFullYear()} GR Class. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * @deprecated Use wrapGrclassEmail — kept for existing template imports.
 */
export const wrapEmailHtml = (opts) => wrapGrclassEmail(opts);

