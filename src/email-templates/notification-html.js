import { escapeHtml, wrapGrclassEmail } from './layout.js';
import { emailTheme as theme } from './theme.js';

/**
 * Plain text → HTML paragraphs + preserved line breaks.
 * @param {string} text
 * @returns {string}
 */
const messageToHtml = (text) => {
    const escaped = escapeHtml(text);
    return escaped.split(/\r?\n/).filter(Boolean).map((line) => `<p style="margin:0 0 12px; font-size: 14px; line-height: 1.6; color: ${theme.colors.text.body};">${line}</p>`).join('')
        || `<p style="margin:0; font-size: 14px; line-height: 1.6; color: ${theme.colors.text.body};">${escaped}</p>`;
};

/**
 * Builds branded HTML for generic notification / legacy switch templates.
 * @param {{
 *   templateName: string,
 *   data: Record<string, unknown>,
 *   fallbackSubject: string,
 *   fallbackBody: string
 * }} opts
 * @returns {{ subject: string, html: string }}
 */
export const buildTransactionalNotificationEmail = ({
    templateName,
    data,
    fallbackSubject,
    fallbackBody
}) => {
    const cleanTitle = data.title ? String(data.title).replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim() : '';
    const subject = (data.subject && String(data.subject).trim())
        || (cleanTitle && data.vesselName ? `${cleanTitle} · ${data.vesselName}` : cleanTitle)
        || fallbackSubject
        || 'GR Class Notification';

    const messageText = (data.message && String(data.message).trim())
        || fallbackBody
        || '';

    const headline = (data.title && String(data.title).trim())
        || fallbackSubject
        || 'Action Required';

    const label = templateName.replace(/_/g, ' ');

    const metaRows = [];
    const metaCellStyle = `padding:8px 12px; font-size:12px; border-bottom:1px solid ${theme.colors.brand.faded};`;
    const labelStyle = `color:${theme.colors.text.muted}; width:110px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;`;
    const valueStyle = `color:${theme.colors.text.core}; font-weight:600;`;

    if (data.jobId) {
        metaRows.push(
            `<tr><td style="${metaCellStyle} ${labelStyle}">Reference</td><td style="${metaCellStyle} ${valueStyle}">${escapeHtml(String(data.jobId))}</td></tr>`
        );
    }
    if (data.status) {
        metaRows.push(
            `<tr><td style="${metaCellStyle} ${labelStyle}">Status</td><td style="${metaCellStyle} ${valueStyle} color:${theme.colors.brand.deep};">${escapeHtml(String(data.status))}</td></tr>`
        );
    }
    if (data.vesselName) {
        metaRows.push(
            `<tr><td style="${metaCellStyle} ${labelStyle}">Vessel</td><td style="${metaCellStyle} ${valueStyle}">${escapeHtml(String(data.vesselName))}</td></tr>`
        );
    }

    const metaTable = metaRows.length
        ? `<div style="background-color:${theme.colors.brand.surface}; border:1px solid ${theme.colors.brand.faded}; border-radius:${theme.radius.md}; overflow:hidden; margin-top:24px;">
             <table role="presentation" width="100%" style="border-collapse:collapse;">${metaRows.join('')}</table>
           </div>`
        : '';

    const innerHtml = `
      <p style="margin:0 0 8px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:${theme.colors.brand.main};">${escapeHtml(label)}</p>
      <h1 style="margin:0 0 16px; font-size:20px; font-weight:800; color:${theme.colors.text.core}; line-height:1.2; letter-spacing:-0.02em;">${escapeHtml(headline)}</h1>
      <div style="margin-bottom:20px;">${messageToHtml(messageText)}</div>
      ${metaTable}
    `;

    const html = wrapGrclassEmail({
        title: subject,
        preheader: messageText.slice(0, 140) || subject,
        innerHtml
    });

    return { subject, html };
};
