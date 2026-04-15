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
      .content { padding: 30px 20px !important; }
      .header { padding: 25px 20px !important; }
    }
  </style>
</head>
<body style="background-color: ${theme.colors.background}; margin: 0; padding: 40px 0;">
  <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0">${pre}</span>
  <center>
    <table border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="background-color: ${theme.colors.white}; border-radius: 0; overflow: hidden; border: 1px solid ${theme.colors.brand.faded};">
      
      <!-- HEADER -->
      <tr>
        <td align="left" class="header" style="background-color: ${theme.colors.brand.primary}; padding: 30px 40px; border-bottom: 4px solid ${theme.colors.brand.main};">
          <a href="https://grclass.com" target="_blank" style="text-decoration:none;">
            <img src="https://grclass.com/grclass-logo.webp" alt="GR Class" style="display:block; border:none; outline:none; height:45px; width:auto;" />
          </a>
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
        <td align="center" style="background-color: ${theme.colors.brand.navy_sec}; padding: 35px 40px;">
          <p style="margin: 0; font-size: 11px; color: ${theme.colors.text.light}; letter-spacing: 0.1em; font-weight: 700; text-transform: uppercase; margin-bottom: 15px;">
            © ${new Date().getFullYear()} GR Class. All Rights Reserved.
          </p>
          <div style="margin-top: 15px;">
            <a href="https://grclass.com/privacy" style="color: ${theme.colors.text.white}; font-size: 11px; text-decoration: none; margin: 0 10px; font-weight: 600;">Privacy Policy</a>
            <span style="color: ${theme.colors.text.muted}; font-size: 11px;">|</span>
            <a href="https://grclass.com" style="color: ${theme.colors.text.white}; font-size: 11px; text-decoration: none; margin: 0 10px; font-weight: 600;">Visit Website</a>
          </div>
        </td>
      </tr>
    </table>

    <!-- COMPLIANCE/LEGAL -->
    <table border="0" cellpadding="0" cellspacing="0" width="600" style="margin-top: 25px;">
      <tr>
        <td align="center">
          <p style="font-size: 10px; color: ${theme.colors.text.light}; line-height: 1.6; max-width: 500px;">
            You are receiving this automated diagnostic message because you are a registered professional on the GR Class Maritime Portal.<br>
            <strong>Location:</strong> 123 Maritime Plaza, Port Authority District.
          </p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
};

export const wrapEmailHtml = (opts) => wrapGrclassEmail(opts);

