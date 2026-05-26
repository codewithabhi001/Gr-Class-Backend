import db from '../../models/index.js';
import { fillDocxContentControls } from '../../utils/docxFill.util.js';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import JSZip from 'jszip';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Certificate, NonConformity, Payment, Survey, JobRequest } = db;

// Helper to fetch raw certificate data
const fetchCertificates = async (filters = {}) => {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.from_date && filters.to_date) {
        where.issue_date = {
            [Op.between]: [filters.from_date, filters.to_date]
        };
    }
    const certificates = await Certificate.findAll({
        where,
        include: [
            { model: db.Vessel, attributes: ['vessel_name', 'imo_number'] },
            { model: db.CertificateType, attributes: ['name'] },
            { model: db.User, as: 'issuer', attributes: ['name', 'email'] }
        ],
        useReplica: true
    });
    return certificates;
};

export const getCertificateReport = async (filters = {}) => {
    const certificates = await fetchCertificates(filters);
    const stats = {
        total: certificates.length,
        by_status: {},
        by_type: {},
        expiring_soon: 0
    };
    certificates.forEach(cert => {
        stats.by_status[cert.status] = (stats.by_status[cert.status] || 0) + 1;
        const typeName = cert.CertificateType?.name || 'Unknown';
        stats.by_type[typeName] = (stats.by_type[typeName] || 0) + 1;
        const daysToExpiry = Math.floor((new Date(cert.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysToExpiry <= 30 && daysToExpiry >= 0) stats.expiring_soon++;
    });
    return { certificates, stats };
};


// Helper to fetch raw survey data
const fetchSurveys = async (filters = {}) => {
    const where = {};
    if (filters.from_date && filters.to_date) {
        where.createdAt = {
            [Op.between]: [filters.from_date, filters.to_date]
        };
    }
    const surveys = await Survey.findAll({
        where,
        include: [
            { model: db.User, attributes: ['id', 'name', 'email'] },
            {
                model: db.JobCertificate,
                required: true,
                include: [{ model: JobRequest, attributes: ['id', 'job_status'] }]
            }
        ],
        useReplica: true
    });
    return surveys;
};

export const getSurveyorPerformanceReport = async (filters = {}) => {
    const surveys = await fetchSurveys(filters);
    const performance = {};
    surveys.forEach(survey => {
        const surveyorId = survey.surveyor_id;
        if (!performance[surveyorId]) {
            performance[surveyorId] = {
                surveyor: survey.User,
                total_surveys: 0,
                avg_completion_time: 0
            };
        }
        performance[surveyorId].total_surveys++;
    });
    return { performance: Object.values(performance) };
};

// Helper to fetch raw non‑conformity data
const fetchNonConformities = async (filters = {}) => {

    const where = {};
    if (filters.severity) where.severity = filters.severity;
    if (filters.status) where.status = filters.status;

    const ncs = await NonConformity.findAll({
        where,
        include: [{ model: JobRequest, attributes: ['id', 'job_status', 'vessel_id'] }],
        useReplica: true
    });

    const stats = {
        total: ncs.length,
        by_severity: {},
        by_status: {},
        open_count: 0
    };

    ncs.forEach(nc => {
        stats.by_severity[nc.severity] = (stats.by_severity[nc.severity] || 0) + 1;
        stats.by_status[nc.status] = (stats.by_status[nc.status] || 0) + 1;
        if (nc.status === 'OPEN') stats.open_count++;
    });

    return { non_conformities: ncs, stats };
};

export const getNonConformityReport = async (filters = {}) => {
    // Reuse the existing fetchNonConformities helper to retrieve data and stats.
    return await fetchNonConformities(filters);
};

// Helper to fetch raw payment data
export const getFinancialReport = async (filters = {}) => {
    const where = {};
    if (filters.from_date && filters.to_date) {
        where.payment_date = {
            [Op.between]: [filters.from_date, filters.to_date]
        };
    }

    const payments = await Payment.findAll({
        where,
        include: [{ model: JobRequest, attributes: ['id', 'job_status', 'vessel_id'] }],
        useReplica: true
    });

    const stats = {
        total_invoiced: 0,
        total_paid: 0,
        total_pending: 0,
        by_status: {}
    };

    payments.forEach(payment => {
        const amount = parseFloat(payment.amount) || 0;
        stats.total_invoiced += amount;

        if (payment.payment_status === 'PAID') {
            stats.total_paid += amount;
        } else {
            stats.total_pending += amount;
        }

        stats.by_status[payment.payment_status] =
            (stats.by_status[payment.payment_status] || 0) + amount;
    });

    return { payments, stats };
};

// ---------- DOCX Export Functions ----------

const generateDocx = async (templatePath, tagValues) => {
    try {
        const templateBuffer = fs.readFileSync(templatePath);
        return await fillDocxContentControls(templateBuffer, tagValues);
    } catch (err) {
        // Fallback: generate minimal DOCX using JSZip
        const docx = new JSZip();
        // [Content_Types].xml
        docx.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n    <Default Extension="xml" ContentType="application/xml"/>\n    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>\n</Types>`);
        // _rels/.rels
        docx.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>\n</Relationships>`);
        // word/_rels/document.xml.rels (empty)
        docx.folder('word').folder('_rels').file('document.xml.rels', `<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`);
        // word/document.xml with generic content
        const docXml = `<?xml version="1.0" encoding="UTF-8"?>\n<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n  <w:body>\n    <w:p><w:r><w:t>Report</w:t></w:r></w:p>\n    ${Object.entries(tagValues).map(([k, v]) => `<w:p><w:r><w:t>${k}: ${v}</w:t></w:r></w:p>`).join('\n    ')}\n    <w:sectPr/>\n  </w:body>\n</w:document>`;
        docx.folder('word').file('document.xml', docXml);
        return await docx.generateAsync({ type: 'nodebuffer' });
    }
};

export const generateCertificateDocx = async (filters = {}) => {
    const { certificates } = await getCertificateReport(filters);
    // For demonstration, we map the first certificate's fields to tags.
    const first = certificates[0] || {};
    const tagValues = {
        vessel_name: first.Vessel?.vessel_name || '',
        imo_number: first.Vessel?.imo_number || '',
        certificate_type: first.CertificateType?.name || '',
        issue_date: first.issue_date ? new Date(first.issue_date).toLocaleDateString() : '',
        expiry_date: first.expiry_date ? new Date(first.expiry_date).toLocaleDateString() : ''
    };
    const templatePath = path.resolve(__dirname, '../../../templates/certificate_report_template.docx');
    return await generateDocx(templatePath, tagValues);
};

export const generateSurveyorDocx = async (filters = {}) => {
    const { performance } = await getSurveyorPerformanceReport(filters);
    const first = performance[0] || {};
    const tagValues = {
        surveyor_name: first.surveyor?.name || '',
        total_surveys: first.total_surveys?.toString() || '0'
    };
    const templatePath = path.resolve(__dirname, '../../../templates/surveyor_report_template.docx');
    return await generateDocx(templatePath, tagValues);
};

export const generateNonConformityDocx = async (filters = {}) => {
    const { non_conformities } = await getNonConformityReport(filters);
    const first = non_conformities[0] || {};
    const tagValues = {
        vessel_id: first.vessel_id?.toString() || '',
        severity: first.severity || '',
        status: first.status || ''
    };
    const templatePath = path.resolve(__dirname, '../../../templates/nonconformity_report_template.docx');
    return await generateDocx(templatePath, tagValues);
};

export const generateFinancialDocx = async (filters = {}) => {
    const { payments } = await getFinancialReport(filters);
    const first = payments[0] || {};
    const tagValues = {
        amount: first.amount?.toString() || '',
        status: first.payment_status || '',
        date: first.payment_date ? new Date(first.payment_date).toLocaleDateString() : ''
    };
    const templatePath = path.resolve(__dirname, '../../../templates/financial_report_template.docx');
    try {
        // Try using the provided template
        return await generateDocx(templatePath, tagValues);
    } catch (err) {
        // Fallback: generate minimal valid DOCX using JSZip
        const docx = new JSZip();
        // [Content_Types].xml
        docx.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);
        // _rels/.rels
        docx.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);
        // word/_rels/document.xml.rels (empty)
        docx.folder('word').folder('_rels').file('document.xml.rels', `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`);
        // word/document.xml with report content
        const docXml = `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>Financial Report</w:t></w:r></w:p>
    <w:p><w:r><w:t>Amount: ${tagValues.amount}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Status: ${tagValues.status}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Date: ${tagValues.date}</w:t></w:r></w:p>
    <w:sectPr/>
  </w:body>
</w:document>`;
        docx.folder('word').file('document.xml', docXml);
        // Return DOCX buffer
        return await docx.generateAsync({ type: 'nodebuffer' });
    }
};
