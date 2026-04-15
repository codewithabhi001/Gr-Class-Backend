import JSZip from 'jszip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import xpath from 'xpath';

const WORD_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

const selectWithNs = xpath.useNamespaces({ w: WORD_NS });

const setSdtText = (doc, sdtNode, value) => {
    const sdtContent = selectWithNs('w:sdtContent', sdtNode, true);
    if (!sdtContent) return;

    const textNodes = selectWithNs('.//w:t', sdtContent);
    const safeValue = value === null || value === undefined ? '' : String(value);

    if (textNodes.length === 0) {
        // Create a basic run with text if none exists
        const r = doc.createElementNS(WORD_NS, 'w:r');
        const t = doc.createElementNS(WORD_NS, 'w:t');
        t.appendChild(doc.createTextNode(safeValue));
        r.appendChild(t);
        sdtContent.appendChild(r);
        return;
    }

    // Put the entire value in the first node, clear the rest to avoid leftover text.
    textNodes[0].textContent = safeValue;
    for (let i = 1; i < textNodes.length; i += 1) {
        textNodes[i].textContent = '';
    }
};

/**
 * Fill Word content controls by Tag (w:tag/@w:val).
 * @param {Buffer} docxBuffer
 * @param {Record<string, string|number|null|undefined>} tagValues
 * @returns {Promise<Buffer>}
 */
export const fillDocxContentControls = async (docxBuffer, tagValues) => {
    const zip = await JSZip.loadAsync(docxBuffer);
    const entry = zip.file('word/document.xml');
    if (!entry) throw new Error('Invalid DOCX: missing word/document.xml');

    const xml = await entry.async('text');
    const doc = new DOMParser().parseFromString(xml, 'text/xml');

    for (const [tag, value] of Object.entries(tagValues || {})) {
        const nodes =
        selectWithNs(`//w:sdt[w:sdtPr/w:tag[@w:val="${tag}"]]`, doc);
        for (const sdtNode of nodes) {
            setSdtText(doc, sdtNode, value);
        }
    }

    const newXml = new XMLSerializer().serializeToString(doc);
    zip.file('word/document.xml', newXml);
    return await zip.generateAsync({ type: 'nodebuffer' });
};

