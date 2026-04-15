import { emailTheme as theme } from './theme.js';

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
 * Professional Maritime/Industrial Email Wrapper
 * @param {{ title: string, innerHtml: string, preheader?: string }} opts
 */
export const wrapGrclassEmail = ({ title, innerHtml, preheader = '' }) => {
  const safeTitle = escapeHtml(title);
  const pre = escapeHtml(preheader).slice(0, 200);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      background-color: ${theme.colors.background};
      font-family: ${theme.typography.fontFamily};
    }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content { padding: 20px !important; }
    }
  </style>
</head>
<body style="background-color: ${theme.colors.background}; margin: 0; padding: 40px 0;">
  <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0">${pre}</span>
  <center>
    <table border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="background-color: ${theme.colors.white}; border-radius: ${theme.radius.xl}; overflow: hidden; box-shadow: 0 10px 30px rgba(30, 27, 75, 0.08); border: 1px solid ${theme.colors.brand.faded};">
      
      <!-- HEADER -->
      <tr>
        <td align="center" style="background-color: ${theme.colors.brand.primary}; padding: 30px 40px; border-bottom: 4px solid ${theme.colors.brand.main};">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <div style="color: ${theme.colors.text.white}; font-size: 18px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
                  GIRIK <span style="color: ${theme.colors.brand.accent};">SHIPPING</span>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- CONTENT BODY -->
      <tr>
        <td class="content" style="padding: 40px 40px 30px 40px;">
          ${innerHtml}
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td align="center" style="background-color: ${theme.colors.brand.deep}; padding: 30px 40px;">
          <p style="margin: 0; font-size: 11px; color: ${theme.colors.brand.accent}; letter-spacing: 0.05em; font-weight: 500;">
            © ${new Date().getFullYear()} Girik Shipping. All Rights Reserved.
          </p>
          <div style="margin-top: 15px;">
            <a href="https://grclass.com/privacy" style="color: ${theme.colors.text.white}; font-size: 11px; text-decoration: none; margin: 0 10px; font-weight: 600;">Privacy Policy</a>
            <span style="color: ${theme.colors.brand.accent}; font-size: 11px;">|</span>
            <a href="#" style="color: ${theme.colors.text.white}; font-size: 11px; text-decoration: none; margin: 0 10px; font-weight: 600;">Unsubscribe</a>
          </div>
        </td>
      </tr>
    </table>

    <!-- COMPLIANCE/LEGAL -->
    <table border="0" cellpadding="0" cellspacing="0" width="600" style="margin-top: 20px;">
      <tr>
        <td align="center">
          <p style="font-size: 10px; color: ${theme.colors.text.light}; line-height: 1.5;">
            You are receiving this email because you are a registered user of the Girik Maritime Portal.<br>
            123 Maritime Plaza, Port Authority District.
          </p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
};

export const wrapEmailHtml = (opts) => wrapGrclassEmail(opts);

