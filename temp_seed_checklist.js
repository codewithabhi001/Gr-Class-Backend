import fs from 'fs';
import db from './src/models/index.js';
import * as s3Service from './src/services/s3.service.js';

const run = async () => {
    try {
        const filePath = '/Users/abhinavvishwakarma/Desktop/GIRIK_Workshop/GIRIK_BACKEND/CHECKLISTS/BOTTOM INSPECTION/CHECK LIST/BS-01.docx';
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = 'BS-01.docx';

        // Use s3 service to upload the master template
        const key = await s3Service.uploadFile(fileBuffer, fileName, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'checklist-templates');
        
        console.log('S3 Uploaded Key:', key);

        const certId = '019d8fe1-c8fc-7268-a0f2-efe35fb27b60';
        
        // Deactivate old active templates
        await db.ChecklistTemplate.update(
            { status: 'INACTIVE' },
            { where: { certificate_type_id: certId, status: 'ACTIVE' } }
        );

        // Create new active template
        const newTemplate = await db.ChecklistTemplate.create({
            name: 'Bottom Inspection Checklist',
            code: 'BS-01_V1.0',
            description: 'Bottom Inspection Checklist uploaded via request',
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
            template_files: [key],
            metadata: { version: "1.0", seed: true },
        });

        console.log('Checklist Template created with ID:', newTemplate.id);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
