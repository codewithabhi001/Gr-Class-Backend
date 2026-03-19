import multer from 'multer';
import path from 'path';

/**
 * Standalone validation for images
 */
export const validateImage = (fileName, mimeType) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

    const mimeTypeOk = allowedMimeTypes.includes(mimeType);
    const extensionOk = allowedExtensions.includes(path.extname(fileName).toLowerCase());

    return mimeTypeOk && extensionOk;
};

/**
 * Standalone validation for documents (PDF + Images)
 */
export const validateDoc = (fileName, mimeType) => {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

    const mimeTypeOk = allowedMimeTypes.includes(mimeType);
    const extensionOk = allowedExtensions.includes(path.extname(fileName).toLowerCase());

    return mimeTypeOk && extensionOk;
};

/**
 * Standalone validation for videos
 */
export const validateVideo = (fileName, mimeType) => {
    const allowedMimeTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'image/jpeg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.mp4', '.mpeg', '.mov', '.avi', '.mkv', '.jpg', '.jpeg', '.png', '.webp'];

    const mimeTypeOk = allowedMimeTypes.includes(mimeType);
    const extensionOk = allowedExtensions.includes(path.extname(fileName).toLowerCase());

    return mimeTypeOk && extensionOk;
};

/**
 * Common file filter for images
 */
export const imageFileFilter = (req, file, cb) => {
    if (validateImage(file.originalname, file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file format. Only JPEG, PNG and WEBP images are allowed.`), false);
    }
};

/**
 * Common file filter for documents (PDF + Images)
 */
export const docFileFilter = (req, file, cb) => {
    if (validateDoc(file.originalname, file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file format. Only PDF, JPEG, PNG and WEBP files are allowed.`), false);
    }
};

/**
 * Common file filter for videos
 */
export const videoFileFilter = (req, file, cb) => {
    if (validateVideo(file.originalname, file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file format. Supported: MP4/MOV videos and JPEG/PNG/WEBP images.`), false);
    }
};

// Default limits (20MB)
const defaultLimits = {
    fileSize: 20 * 1024 * 1024
};

// Multer instances
export const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: defaultLimits,
    fileFilter: imageFileFilter
});

export const docUpload = multer({
    storage: multer.memoryStorage(),
    limits: defaultLimits,
    fileFilter: docFileFilter
});

export const videoUpload = multer({
    storage: multer.memoryStorage(),
    limits: defaultLimits,
    fileFilter: videoFileFilter
});
