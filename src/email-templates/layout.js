import { emailTheme as theme } from './theme.js';

// (getLogoPath and getLogoCid removed — using CSS logo instead)

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
    const unsubscribeBlock = unsubscribeUrl ? `
          <tr>
            <td style="padding:0 32px 20px; text-align: center;">
              <a href="${unsubscribeUrl}" style="display:inline-block; font-size:13px; color:${theme.colors.brand[600]}; text-decoration:none; margin-top: 10px;">Unsubscribe from these emails</a>
            </td>
          </tr>` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:${theme.colors.neutral[100]};font-family:${theme.typography.sans};">
  <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0">${pre}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${theme.colors.neutral[100]};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:${theme.radius.lg};overflow:hidden;border:1px solid ${theme.colors.neutral[200]};box-shadow:0 10px 25px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, ${theme.colors.brand[50]} 0%, ${theme.colors.brand[100]} 100%); padding:32px 32px 32px; border-bottom:3px solid ${theme.colors.brand[400]};">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td valign="middle" style="padding-right:20px; width:100px;">
                    <a href="https://grclass.com" target="_blank" style="display:inline-block; text-decoration:none;">
                      <img src="cid:grclass-logo" alt="GR Class" style="display:block; border:none; outline:none; height:70px; width:auto; max-width:180px;" />
                    </a>
                  </td>
                  <td valign="middle" style="border-left:2px solid ${theme.colors.brand[200]}; padding-left:20px;">
                    <div style="font-size:24px;font-weight:800;letter-spacing:-0.02em;line-height:1.2;color:${theme.colors.navy[900]};">GR Class</div>
                    <div style="font-size:14px;color:${theme.colors.navy[800]};margin-top:4px;font-weight:500;">Classification &amp; certification</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px 32px;font-size:16px;line-height:1.6;color:${theme.colors.neutral[700]};">
              ${innerHtml}
            </td>
          </tr>
          ${unsubscribeBlock}
          <!-- Footer -->
          <tr>
            <td style="padding:0 32px 32px;">
              <table role="presentation" width="100%" style="border-top:1px solid ${theme.colors.neutral[100]};padding-top:24px;">
                <tr>
                  <td style="font-size:13px;color:${theme.colors.neutral[500]};line-height:1.6;text-align:center;">
                    This is an automated message from <strong style="color:${theme.colors.navy[900]};">GR Class</strong> (<a href="https://grclass.com" style="color:${theme.colors.brand[600]};text-decoration:none;">grclass.com</a>).<br> Please do not reply to this email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="max-width:600px;margin:24px auto 0;font-size:12px;color:${theme.colors.neutral[400]};text-align:center;">&copy; ${new Date().getFullYear()} GR Class. All rights reserved.</p>
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
