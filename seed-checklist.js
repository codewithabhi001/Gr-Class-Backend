import fs from 'fs';
import path from 'path';
import db from './src/models/index.js';
import * as s3Service from './src/services/s3.service.js';

const run = async () => {
    try {
        const folderPath = '/Users/abhinavvishwakarma/Desktop/GIRIK_Workshop/GIRIK_BACKEND/CHECKLISTS/BOTTOM INSPECTION/CHECK LIST';
        
        // Exact names of the multiple checklist files needed for Bottom Inspection
        const fileNames = [
            'BS-01.docx',
            'BS-02.docx',
            'BS-03.docx',
            'GR CLASS Form No. UWILD-01.docx'
        ];
        
        const uploadedKeys = [];

        console.log('Starting upload of the 4 checklist documents...');
        for (const fileName of fileNames) {
            const filePath = path.join(folderPath, fileName);
            if (fs.existsSync(filePath)) {
                const fileBuffer = fs.readFileSync(filePath);
                const key = await s3Service.uploadFile(
                    fileBuffer, 
                    fileName, 
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                    'checklist-templates'
                );
                uploadedKeys.push(key);
                console.log(`✅ Uploaded ${fileName} -> ${key}`);
            } else {
                console.warn(`⚠️ Warning: ${fileName} not found at ${filePath}`);
            }
        }

        if (uploadedKeys.length === 0) {
            throw new Error("No files uploaded, aborting template creation");
        }

        const certId = '019d8fe1-c8fc-7268-a0f2-efe35fb27b60';
        
        // Deactivate old active templates
        await db.ChecklistTemplate.update(
            { status: 'INACTIVE' },
            { where: { certificate_type_id: certId, status: 'ACTIVE' } }
        );

        // Create new active template containing ALL files
        const newTemplate = await db.ChecklistTemplate.create({
            name: 'Bottom Inspection Checklist',
            code: 'BS-01_V2.0',
            description: 'Bottom Inspection Checklist containing 4 required documents',
            certificate_type_id: certId,
            sections: [
                {
                    title: "Bottom Plate Inspection",
                    items: [
                        { code: "BS_01", text: "Are all underwater parts functioning as intended?", type: "yes_no_na" },
                        { code: "BS_02", text: "Is the hull free from significant corrosion or damage?", type: "yes_no_na" }
                    ]
                }
            ],
            status: 'ACTIVE',
            template_files: uploadedKeys, // Now an array of 4 keys!
            metadata: { version: "2.0", seed: true },
        });

        console.log('🚀 Checklist Template successfully created with ID:', newTemplate.id);
        console.log(`The template is fully active and contains ${uploadedKeys.length} documents.`);
        process.exit(0);
    } catch (e) {
        console.error('❌ Error creating checklist:', e);
        process.exit(1);
    }
};

run();
