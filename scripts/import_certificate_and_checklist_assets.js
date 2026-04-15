import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import db from '../src/models/index.js';
import * as s3Service from '../src/services/s3.service.js';

const PROJECT_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CERTIFICATE_ROOT = path.join(PROJECT_ROOT, 'CERTIFICATE');
const CHECKLIST_ROOT = path.join(PROJECT_ROOT, 'CHECKLISTS');

const ADMIN_EMAIL = process.env.IMPORT_ADMIN_EMAIL || 'admin@grclass.com';
const ADMIN_PASSWORD = process.env.IMPORT_ADMIN_PASSWORD || 'Password@123';
const ADMIN_NAME = process.env.IMPORT_ADMIN_NAME || 'System Admin';

const CERTIFICATE_DOC_TYPE = 'CERTIFICATE_TYPE_TEMPLATE';
const CHECKLIST_TEMPLATE_PREFIX = 'AUTO-FILES';
const IGNORE_FILE_NAMES = new Set(['.DS_Store', 'Thumbs.db']);

const CERTIFICATE_TYPE_ALIASES = {
    AFS: 'AFS',
    ANTIFOULINGSYSTEMCERTIFICATE: 'AFS',
    BALLASTWATERMANAGEMENTCERTIFICATE: 'BWM',
    BOTTOMINSPECTION: 'BOTTOM INSPECTION',
    CARGOSHIPSAFETYCERTIFICATE: 'CARGO SHIP SAFETY CERTIFICATE',
    CARGOSHIPSAFETYCONSTRUCTIONCERTIFICATE: 'CARGO SHIP SAFETY CONSTRUCTION CERTIFICATE',
    CARGOSHIPSAFETYEQUIPMENTCERTIFICATE: 'CARGO SHIP SAFETY EQUIPMENT CERTIFICATE',
    CARGOSHIPSAFETYRADIOCERTIFICATE: 'CARGO SHIP SAFETY RADIO CERTIFICATE',
    CARGOSHIPSAFETYRADIOTELEPHONYCERTIFICATE: 'CARGO SHIP SAFETY RADIOTELEPHONY CERTIFICATE',
    CARIBBEANCARGOSHIPSAFETYCERTIFICATE: 'CARIBBEAN CARGO SHIP SAFETY CERTIFICATE',
    CICA: 'CICA',
    CERTIFICATEOFCOMPLIANCEWITHTHEINTERNATIONALMARITIMESOLIDBULKCARGOESCODE: 'IMBSC',
    CERTIFICATEOFFITNESSFORCARRIAGEOFDANGEROUSCHEMICALSINBULK: 'IBC',
    CERTIFICATEOFFITNESSFORCARRIAGEOFLIQUEFIEDGASESINBULK: 'IGC',
    DOC: 'DOC',
    DOCUMENTOFAUTHORIZATIONFORTHECARRIAGEOFGRAIN: 'GRALO',
    DOCUMENTOFCOMPLIANCEWITHTHESPECIALREQUIREMENTSFORSHIPSCARRYINGDANGEROUSGOODS: 'CDG',
    DOCKINGSURVEY: 'DOCKING SURVEY',
    EIAPP: 'EIAPP',
    FISHINGVESSELSAFETYCERTIFICATE: 'FISHING VESSEL SAFETY CERTIFICATE',
    HIGHSPEEDCRAFTSAFETYCERTIFICATE: 'HSC',
    IAPP: 'IAPP',
    INTERNATIONALCERTIFICATEOFFITNESSFORCARRIAGEOFDANGEROUSCHEMICALSINBULK: 'BCH',
    INTERNATIONALOILPOLLUTIONPREVENTIONCERTIFICATE: 'IOPPC',
    INTERNATIONALPOLLUTIONPREVENTIONCERTIFICATEFORTHECARRIAGEOFNOXIOUSLIQUIDSUBSTANCESINBULK: 'NLS',
    INTERNATIONALSEWAGEPOLLUTIONPREVENTIONCERTIFICATE: 'INTERNATIONAL SEWAGE POLLUTION PREVENTION CERTIFICATE',
    ISSC: 'ISSC',
    LL: 'LL',
    MLC: 'MLC',
    MODU: 'MODU',
    PLEASURECRAFTSAFETYCERTIFICATE: 'PLECE',
    SEAWORTHINESSCERTIFICATE: 'SEA WORTHINESS CERTIFICATE',
    SPS: 'SPS',
};

const normalize = (value) =>
    String(value || '')
        .normalize('NFKD')
        .replace(/[^\w\s]/g, '')
        .replace(/_/g, ' ')
        .replace(/\s+/g, '')
        .toUpperCase();

const isIgnoredFile = (fileName) =>
    fileName.startsWith('~$') || IGNORE_FILE_NAMES.has(fileName);

const getMimeType = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (ext === '.doc') return 'application/msword';
    if (ext === '.pdf') return 'application/pdf';
    if (ext === '.xlsx') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    return 'application/octet-stream';
};

const collectFiles = (rootDir, mode) => {
    const results = new Map();

    if (!fs.existsSync(rootDir)) return results;

    for (const folderName of fs.readdirSync(rootDir)) {
        const folderPath = path.join(rootDir, folderName);
        if (!fs.statSync(folderPath).isDirectory()) continue;

        const files = [];
        const walk = (currentDir, relativeDir = '') => {
            for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
                const absolutePath = path.join(currentDir, entry.name);
                const relativePath = relativeDir ? path.join(relativeDir, entry.name) : entry.name;

                if (entry.isDirectory()) {
                    walk(absolutePath, relativePath);
                    continue;
                }

                if (isIgnoredFile(entry.name)) continue;

                const normalizedRel = normalize(relativePath);
                const isChecklistFile = normalizedRel.includes('CHECKLIST') || normalizedRel.includes('CHECKLIST') || normalize(path.dirname(relativePath)).includes('CHECKLIST');

                if (mode === 'certificate' && isChecklistFile) continue;
                if (mode === 'checklist' && !isChecklistFile) continue;

                files.push({
                    absolutePath,
                    relativePath,
                    fileName: entry.name,
                });
            }
        };

        walk(folderPath);

        if (files.length > 0) {
            results.set(folderName, files);
        }
    }

    return results;
};

const buildCertificateTypeMaps = async () => {
    const types = await db.CertificateType.findAll({
        attributes: ['id', 'name', 'short_code'],
        order: [['name', 'ASC']],
    });

    const byNormalizedName = new Map();
    const byShortCode = new Map();

    for (const type of types) {
        const plain = type.get({ plain: true });
        byNormalizedName.set(normalize(plain.name), plain);
        if (plain.short_code) {
            byShortCode.set(normalize(plain.short_code), plain);
        }
    }

    return { types: types.map((t) => t.get({ plain: true })), byNormalizedName, byShortCode };
};

const matchCertificateType = (folderName, maps) => {
    const normalizedFolder = normalize(folderName);
    const alias = CERTIFICATE_TYPE_ALIASES[normalizedFolder];

    if (alias) {
        const normalizedAlias = normalize(alias);
        return maps.byShortCode.get(normalizedAlias) || maps.byNormalizedName.get(normalizedAlias) || null;
    }

    return maps.byNormalizedName.get(normalizedFolder) || maps.byShortCode.get(normalizedFolder) || null;
};

const ensureAdminUser = async () => {
    let admin = await db.User.findOne({ where: { email: ADMIN_EMAIL } });
    if (admin) return admin;

    const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    admin = await db.User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password_hash,
        role: 'ADMIN',
        status: 'ACTIVE',
    });

    return admin;
};

const ensureChecklistTemplate = async (certificateType, adminUserId) => {
    const templateCode = `${CHECKLIST_TEMPLATE_PREFIX}-${certificateType.short_code || certificateType.id}`;

    let template = await db.ChecklistTemplate.findOne({
        where: { code: templateCode },
    });

    if (!template) {
        template = await db.ChecklistTemplate.create({
            name: `${certificateType.name} Imported Checklist Files`,
            code: templateCode,
            description: `Imported checklist files for ${certificateType.name}`,
            certificate_type_id: certificateType.id,
            sections: [],
            status: 'ACTIVE',
            metadata: {
                source: 'filesystem-import',
                imported_for_certificate_type: certificateType.name,
            },
            template_files: [],
            created_by: adminUserId,
            updated_by: adminUserId,
        });
    }

    return template;
};

const uploadAsset = async (file, folderPath) => {
    const buffer = fs.readFileSync(file.absolutePath);
    return s3Service.uploadFile(buffer, file.fileName, getMimeType(file.absolutePath), folderPath);
};

const importCertificateDocuments = async (certificateType, files, adminUserId) => {
    const existingDocs = await db.Document.findAll({
        where: {
            entity_type: 'CERTIFICATE_TYPE',
            entity_id: certificateType.id,
            document_type: CERTIFICATE_DOC_TYPE,
        },
        raw: true,
    });

    const existingByDescription = new Map(existingDocs.map((doc) => [doc.description, doc]));
    let imported = 0;

    for (const file of files) {
        const description = file.relativePath;
        if (existingByDescription.has(description)) continue;

        const key = await uploadAsset(file, `documents/certificate-types/${certificateType.short_code || certificateType.id}/certificate-docs`);
        await db.Document.create({
            entity_type: 'CERTIFICATE_TYPE',
            entity_id: certificateType.id,
            file_url: key,
            file_type: getMimeType(file.absolutePath),
            document_type: CERTIFICATE_DOC_TYPE,
            description,
            uploaded_by: adminUserId,
        });
        imported += 1;
    }

    return imported;
};

const importChecklistDocuments = async (certificateType, files, adminUserId) => {
    const template = await ensureChecklistTemplate(certificateType, adminUserId);
    const existingKeys = Array.isArray(template.template_files) ? [...template.template_files] : [];
    const existingDescriptions = new Set((template.metadata?.imported_checklist_files || []).map((entry) => entry.relativePath));

    let imported = 0;
    const importedChecklistFiles = Array.isArray(template.metadata?.imported_checklist_files)
        ? [...template.metadata.imported_checklist_files]
        : [];

    for (const file of files) {
        if (existingDescriptions.has(file.relativePath)) continue;

        const key = await uploadAsset(file, `checklist-templates/${certificateType.short_code || certificateType.id}`);
        existingKeys.push(key);
        importedChecklistFiles.push({
            fileName: file.fileName,
            relativePath: file.relativePath,
            key,
        });
        imported += 1;
    }

    if (imported > 0) {
        await template.update({
            template_files: existingKeys,
            metadata: {
                ...(template.metadata || {}),
                source: 'filesystem-import',
                imported_for_certificate_type: certificateType.name,
                imported_checklist_files: importedChecklistFiles,
            },
            updated_by: adminUserId,
        });
    }

    return imported;
};

const main = async () => {
    const admin = await ensureAdminUser();
    const certificateMaps = await buildCertificateTypeMaps();
    const certificateFilesByFolder = collectFiles(CERTIFICATE_ROOT, 'certificate');
    const checklistFilesByFolder = collectFiles(CHECKLIST_ROOT, 'checklist');

    const allFolders = new Set([
        ...certificateFilesByFolder.keys(),
        ...checklistFilesByFolder.keys(),
    ]);

    const summary = {
        admin: { id: admin.id, email: admin.email },
        matched: [],
        unmatched: [],
        totals: {
            certificateDocumentsImported: 0,
            checklistFilesImported: 0,
        },
    };

    for (const folderName of [...allFolders].sort()) {
        const certificateType = matchCertificateType(folderName, certificateMaps);
        const certificateFiles = certificateFilesByFolder.get(folderName) || [];
        const checklistFiles = checklistFilesByFolder.get(folderName) || [];

        if (!certificateType) {
            summary.unmatched.push({
                folderName,
                certificateFileCount: certificateFiles.length,
                checklistFileCount: checklistFiles.length,
            });
            continue;
        }

        const certificateDocumentsImported = await importCertificateDocuments(certificateType, certificateFiles, admin.id);
        const checklistFilesImported = await importChecklistDocuments(certificateType, checklistFiles, admin.id);

        summary.totals.certificateDocumentsImported += certificateDocumentsImported;
        summary.totals.checklistFilesImported += checklistFilesImported;
        summary.matched.push({
            folderName,
            certificateType: certificateType.name,
            shortCode: certificateType.short_code,
            certificateFilesFound: certificateFiles.length,
            checklistFilesFound: checklistFiles.length,
            certificateDocumentsImported,
            checklistFilesImported,
        });
    }

    console.log(JSON.stringify(summary, null, 2));
};

main()
    .catch(async (error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await db.sequelize.close().catch(() => {});
    });
