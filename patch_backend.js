const fs = require('fs');
const path = '/Users/abhinavvishwakarma/Desktop/GIRIK_Workshop/GIRIK_BACKEND/src/modules/checklists/checklist.service.js';
let content = fs.readFileSync(path, 'utf8');

// Replace in updateSignedChecklistFiles
const oldUpdateLogic = `    // Normalized: Ensure they are objects with PENDING status if they are being updated/added
    const normalizedFiles = signedChecklistFiles.map(file => {
        if (typeof file === 'string') {
            return { url: file, status: 'PENDING', rejection_reason: null };
        }
        // If it's already an object, reset its status to PENDING as it's a re-upload/edit
        return { ...file, status: 'PENDING', rejection_reason: null };
    });

    survey.set('signed_checklist_files', normalizedFiles);
    survey.changed('signed_checklist_files', true);
    await survey.save();

    const signedFilesResolved = await resolveKeyArray(normalizedFiles, userObj);
    return { signed_checklist_files: signedFilesResolved };`;

const newUpdateLogic = `    // Normalized: Preserve existing statuses and append new files
    const existingFiles = survey.signed_checklist_files || [];
    const existingUrlMap = new Map();
    existingFiles.forEach(f => {
        const u = typeof f === 'string' ? f : f.url;
        existingUrlMap.set(u, f);
    });

    for (const file of signedChecklistFiles) {
        const url = typeof file === 'string' ? file : file.url;
        if (!existingUrlMap.has(url)) {
            existingUrlMap.set(url, {
                url,
                status: 'PENDING',
                rejection_reason: null
            });
        }
    }

    const updatedFiles = Array.from(existingUrlMap.values());
    survey.set('signed_checklist_files', updatedFiles);
    survey.changed('signed_checklist_files', true);
    await survey.save();

    const signedFilesResolved = await resolveKeyArray(updatedFiles, userObj);
    return { signed_checklist_files: signedFilesResolved };`;

content = content.replace(oldUpdateLogic, newUpdateLogic);

const oldSubmitLogic = `        // Persist the signed-checklist scan objects on the same survey row, if provided.
        if (Array.isArray(signedChecklistFiles)) {
            // If the caller sends plain strings (legacy/simple upload), wrap them into objects
            const normalizedFiles = signedChecklistFiles.map(file => {
                if (typeof file === 'string') {
                    return { url: file, status: 'PENDING', rejection_reason: null };
                }
                return { 
                    ...file, 
                    status: 'PENDING', 
                    rejection_reason: null 
                };
            });
            survey.set('signed_checklist_files', normalizedFiles);
            survey.changed('signed_checklist_files', true);
            await survey.save({ transaction: txn });
        }`;

const newSubmitLogic = `        // Persist the signed-checklist scan objects on the same survey row, if provided.
        if (Array.isArray(signedChecklistFiles)) {
            const existingFiles = survey.signed_checklist_files || [];
            const existingUrlMap = new Map();
            existingFiles.forEach(f => {
                const u = typeof f === 'string' ? f : f.url;
                existingUrlMap.set(u, f);
            });

            for (const file of signedChecklistFiles) {
                const url = typeof file === 'string' ? file : file.url;
                if (!existingUrlMap.has(url)) {
                    existingUrlMap.set(url, {
                        url,
                        status: 'PENDING',
                        rejection_reason: null
                    });
                }
            }

            survey.set('signed_checklist_files', Array.from(existingUrlMap.values()));
            survey.changed('signed_checklist_files', true);
            await survey.save({ transaction: txn });
        }`;

content = content.replace(oldSubmitLogic, newSubmitLogic);
fs.writeFileSync(path, content);
