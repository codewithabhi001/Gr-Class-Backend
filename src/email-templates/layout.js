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
<body style="margin:0;padding:0;background:${theme.colors.background};font-family:${theme.typography.sans};">
  <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0">${pre}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${theme.colors.background};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:${theme.radius.lg};overflow:hidden;border:1px solid ${theme.colors.neutral[200]};box-shadow:0 4px 24px rgba(0,0,0,0.04);">
          <tr>
            <td style="background:#ffffff; padding:28px 32px 24px; border-bottom:1px solid ${theme.colors.neutral[200]};">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td valign="middle" style="padding-right:16px;">
                    <a href="https://grclass.com" target="_blank" style="display:inline-block; text-decoration:none;">
                      <img src="cid:grclass-logo" alt="GR Class" style="display:block; border:none; outline:none; height:85px; width:auto; max-width:260px;" />
                    </a>
                  </td>
                  <td valign="middle">
                    <div style="font-size:24px;font-weight:800;letter-spacing:-0.02em;line-height:1.2;color:${theme.colors.navy[900]};">GR Class</div>
                    <div style="font-size:14px;color:${theme.colors.neutral[500]};margin-top:4px;font-weight:500;">Classification &amp; certification</div>
                    <a href="https://grclass.com" style="font-size:13px;color:${theme.colors.brand[600]};text-decoration:none;margin-top:6px;display:inline-block;font-weight:600;">grclass.com</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 28px;font-size:16px;line-height:1.6;color:${theme.colors.neutral[700]};">
              ${innerHtml}
            </td>
          </tr>
          ${unsubscribeBlock}
          <tr>
            <td style="padding:0 32px 28px;">
              <table role="presentation" width="100%" style="border-top:1px solid ${theme.colors.neutral[200]};padding-top:20px;">
                <tr>
                  <td style="font-size:12px;color:${theme.colors.neutral[500]};line-height:1.5;text-align:center;">
                    This is an automated message from <strong style="color:${theme.colors.neutral[700]};">GR Class</strong> (grclass.com). Please do not reply to this email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="max-width:600px;margin:16px auto 0;font-size:11px;color:${theme.colors.neutral[400]};text-align:center;">&copy; ${new Date().getFullYear()} GR Class. All rights reserved.</p>
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
