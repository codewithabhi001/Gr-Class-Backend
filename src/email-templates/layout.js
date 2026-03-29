import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let _logoDataUriCache = null;

/**
 * Inline logo for email clients (no external URL required). Cached after first read.
 * @returns {string | null}
 */
export const getLogoDataUri = () => {
    if (_logoDataUriCache !== null) return _logoDataUriCache;
    try {
        const logoPath = path.join(__dirname, 'assets', 'logo.png');
        const buf = fs.readFileSync(logoPath);
        _logoDataUriCache = `data:image/png;base64,${buf.toString('base64')}`;
    } catch {
        _logoDataUriCache = '';
    }
    return _logoDataUriCache || null;
};

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
 * @param {{ title: string, innerHtml: string, preheader?: string }} opts
 * @returns {string}
 */
export const wrapGrclassEmail = ({ title, innerHtml, preheader = '' }) => {
    const logoUri = getLogoDataUri();
    const safeTitle = escapeHtml(title);
    const pre = escapeHtml(preheader).slice(0, 200);

    const logoBlock = logoUri
        ? `<img src="${logoUri}" alt="GR Class" width="56" height="56" style="display:block;width:56px;height:56px;border-radius:12px;object-fit:cover;border:1px solid #e2e8f0;" />`
        : `<div style="width:56px;height:56px;border-radius:12px;background:linear-gradient(135deg,#1e3a5f 0%,#0f172a 100%);color:#fff;font-weight:700;font-size:18px;line-height:56px;text-align:center;">GR</div>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;">
  <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0">${pre}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 24px rgba(15,23,42,0.06);">
          <tr>
            <td style="background:linear-gradient(180deg,#0f172a 0%,#1e293b 100%);padding:28px 32px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="72" valign="middle" style="padding-right:16px;">${logoBlock}</td>
                  <td valign="middle" style="color:#f8fafc;">
                    <div style="font-size:20px;font-weight:700;letter-spacing:-0.02em;line-height:1.2;">GR Class</div>
                    <div style="font-size:13px;color:#94a3b8;margin-top:4px;">Classification &amp; certification</div>
                    <a href="https://grclass.com" style="font-size:12px;color:#38bdf8;text-decoration:none;margin-top:6px;display:inline-block;">grclass.com</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 28px;font-size:16px;line-height:1.6;color:#334155;">
              ${innerHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <table role="presentation" width="100%" style="border-top:1px solid #e2e8f0;padding-top:20px;">
                <tr>
                  <td style="font-size:12px;color:#94a3b8;line-height:1.5;">
                    This is an automated message from <strong style="color:#64748b;">GR Class</strong> (grclass.com). Please do not reply to this email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="max-width:600px;margin:16px auto 0;font-size:11px;color:#94a3b8;text-align:center;">&copy; ${new Date().getFullYear()} GR Class. All rights reserved.</p>
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
