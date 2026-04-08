import { escapeHtml, wrapGrclassEmail } from './layout.js';

/**
 * Plain text → HTML paragraphs + preserved line breaks.
 * @param {string} text
 * @returns {string}
 */
const messageToHtml = (text) => {
    const escaped = escapeHtml(text);
    return escaped.split(/\r?\n/).filter(Boolean).map((line) => `<p style="margin:0 0 12px;">${line}</p>`).join('')
        || `<p style="margin:0;">${escaped}</p>`;
};

/**
 * Builds branded HTML for generic notification / legacy switch templates.
 * Prefers `data.title` and `data.message` (from notification formatter) over fallbacks.
 *
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
        || 'GR Class notification';

    const messageText = (data.message && String(data.message).trim())
        || fallbackBody
        || '';

    const headline = (data.title && String(data.title).trim())
        || fallbackSubject
        || 'Notification';

    const label = templateName.replace(/_/g, ' ');

    const metaRows = [];
    if (data.jobId) {
        metaRows.push(
            `<tr><td style="padding:6px 12px;color:#0d9488;font-size:12px;width:120px;">Job reference</td><td style="padding:6px 12px;font-size:13px;color:#134e4a;">${escapeHtml(String(data.jobId))}</td></tr>`
        );
    }
    if (data.status) {
        metaRows.push(
            `<tr><td style="padding:6px 12px;color:#0d9488;font-size:12px;">Status</td><td style="padding:6px 12px;font-size:13px;color:#0f766e;font-weight:600;">${escapeHtml(String(data.status))}</td></tr>`
        );
    }
    if (data.vesselName) {
        metaRows.push(
            `<tr><td style="padding:6px 12px;color:#0d9488;font-size:12px;">Vessel</td><td style="padding:6px 12px;font-size:13px;color:#134e4a;">${escapeHtml(String(data.vesselName))}</td></tr>`
        );
    }

    const metaTable = metaRows.length
        ? `<table role="presentation" width="100%" style="margin:20px 0 0;border-collapse:collapse;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">${metaRows.join('')}</table>`
        : '';

    const innerHtml = `
      <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#0d9488;">${escapeHtml(label)}</p>
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f766e;line-height:1.3;letter-spacing:-0.02em;">${escapeHtml(headline)}</h1>
      <div style="font-size:15px;color:#4b5563;">${messageToHtml(messageText)}</div>
      ${metaTable}
    `;

    const html = wrapGrclassEmail({
        title: subject,
        preheader: messageText.slice(0, 140) || subject,
        innerHtml
    });

    return { subject, html };
};
