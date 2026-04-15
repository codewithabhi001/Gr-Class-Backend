import { escapeHtml, wrapEmailHtml } from './layout.js';
import { emailTheme as theme } from './theme.js';

export const messageToHtml = (text) => {
    if (!text) return '';
    return text.split('\n').map(line => `<p style="margin:0 0 12px; font-size:14px; line-height:1.6; color:${theme.colors.text.body};">${escapeHtml(line)}</p>`).join('');
};

/**
 * Modern notification builder for GR Class alerts.
 */
export const buildTransactionalNotificationEmail = (options) => {
    const {
        templateName = 'NOTIFICATION',
        data = {},
        fallbackSubject = '',
        fallbackBody = ''
    } = options;

    const subject = fallbackSubject || `GR Class - ${templateName.replace(/_/g, ' ')}`;
    const label = templateName.replace(/_/g, ' ');
    const headline = data.title || (data.vesselName ? `Update: ${data.vesselName}` : 'System Update');
    const messageText = fallbackBody || data.message || '';

    const labelStyle = `color:${theme.colors.text.muted}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; width:110px; padding:10px 0; border-bottom:1px solid ${theme.colors.brand.faded};`;
    const valueStyle = `color:${theme.colors.text.core}; font-size:13px; font-weight:600; padding:10px 0; border-bottom:1px solid ${theme.colors.brand.faded};`;
    const metaCellStyle = `padding: 10px 0; vertical-align: top; font-family:${theme.typography.fontFamily};`;

    const metaRows = [];
    if (data.jobId) {
        metaRows.push(
            `<tr><td style="${metaCellStyle} ${labelStyle}">Reference ID</td><td style="${metaCellStyle} ${valueStyle}">${escapeHtml(String(data.jobId))}</td></tr>`
        );
    }
    if (data.status) {
        metaRows.push(
            `<tr><td style="${metaCellStyle} ${labelStyle}">New Status</td><td style="${metaCellStyle} ${valueStyle} color:${theme.colors.brand.main};">${escapeHtml(String(data.status))}</td></tr>`
        );
    }
    if (data.vesselName) {
        metaRows.push(
            `<tr><td style="${metaCellStyle} ${labelStyle}">Vessel Asset</td><td style="${metaCellStyle} ${valueStyle}">${escapeHtml(String(data.vesselName))}</td></tr>`
        );
    }
    if (data.certificateNumber) {
        metaRows.push(
            `<tr><td style="${metaCellStyle} ${labelStyle}">Certificate</td><td style="${metaCellStyle} ${valueStyle}">${escapeHtml(String(data.certificateNumber))}</td></tr>`
        );
    }

    const metaTable = metaRows.length
        ? `<div style="background-color:${theme.colors.brand.surface}; border:1px solid ${theme.colors.brand.faded}; border-radius:0; overflow:hidden; margin-top:24px;">
             <table role="presentation" width="100%" style="border-collapse:collapse; margin: 0 20px; width: calc(100% - 40px);">${metaRows.join('')}</table>
           </div>`
        : '';

    const innerHtml = `
      <p style="margin:0 0 8px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:${theme.colors.brand.main};">${escapeHtml(label)}</p>
      <h1 style="margin:0 0 16px; font-size:20px; font-weight:800; color:${theme.colors.text.core}; line-height:1.2; letter-spacing:-0.02em;">${escapeHtml(headline)}</h1>
      <div style="margin-bottom:20px;">${messageToHtml(messageText)}</div>
      ${metaTable}
      <div style="margin-top: 30px; border-top: 1px solid ${theme.colors.brand.faded}; padding-top: 20px;">
        <p style="font-size: 11px; color: ${theme.colors.text.muted}; margin: 0;">
            This is an automated operational notification from the <strong>GR Class</strong> maritime network. Please login to the portal for detailed reports.
        </p>
      </div>
    `;

    return {
        subject,
        html: wrapEmailHtml({
            title: subject,
            innerHtml
        })
    };
};

export const buildNotificationHtml = (options) => {
    // Alias for backward compatibility if needed, though service uses the long name
    const result = buildTransactionalNotificationEmail({
        data: options.data,
        fallbackSubject: options.title,
        fallbackBody: options.messageText,
        templateName: options.label || 'NOTIFICATION'
    });
    return result.html;
};
