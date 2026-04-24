
import path from 'path';
import ExcelJS from 'exceljs';
import db from '../src/models/index.js';

async function syncRequiredDocuments() {
  const filePath = path.resolve(process.cwd(), 'DOCUMENTS REQUIRED.xlsx');
  console.log(`📄 Loading required documents from: ${filePath}`);

  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    
    const rows = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const values = row.values;
      const rowData = {
        certName: String(values[2] || '').trim(),
        shortCode: String(values[3] || '').trim(),
        docName: String(values[4] || '').trim()
      };
      
      if (rowData.docName && rowData.certName) {
        rows.push(rowData);
      }
    });

    console.log(`✅ Found ${rows.length} valid rows in Excel`);

    await db.sequelize.authenticate();
    console.log('✅ Database connection established');

    // Fetch all existing types to avoid repeated queries
    const existingTypes = await db.CertificateType.findAll();
    const typeMap = new Map(); // Name -> Type
    const codeMap = new Map(); // Code -> Type

    existingTypes.forEach(t => {
      if (t.name) typeMap.set(t.name.toUpperCase(), t);
      if (t.short_code) codeMap.set(t.short_code.toUpperCase(), t);
    });

    let certCreated = 0;
    let docCreated = 0;

    for (const row of rows) {
      let certType = codeMap.get(row.shortCode.toUpperCase()) || typeMap.get(row.certName.toUpperCase());

      if (!certType) {
        certType = await db.CertificateType.create({
          name: row.certName,
          short_code: row.shortCode,
          issuing_authority: 'CLASS',
          validity_years: 5,
          status: 'ACTIVE',
          requires_survey: true
        });
        certCreated++;
        // Update maps
        if (certType.name) typeMap.set(certType.name.toUpperCase(), certType);
        if (certType.short_code) codeMap.set(certType.short_code.toUpperCase(), certType);
      }

      // Check if document already exists for this type
      const existingDoc = await db.CertificateRequiredDocument.findOne({
        where: {
          certificate_type_id: certType.id,
          document_name: row.docName
        }
      });

      if (!existingDoc) {
        await db.CertificateRequiredDocument.create({
          certificate_type_id: certType.id,
          document_name: row.docName,
          is_mandatory: true
        });
        docCreated++;
      }
    }

    console.log(`\n📊 Sync Summary:`);
    console.log(`   Certificate Types Created: ${certCreated}`);
    console.log(`   Required Documents Created: ${docCreated}`);
    console.log(`\n✨ Done.\n`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
     process.exit(1);
  }
}

syncRequiredDocuments();
