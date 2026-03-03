import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve, isAbsolute, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import config from './env.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '../../');

let firebaseApp;

try {
    const rawPath = config.firebase.serviceAccountPath;
    let fullPath;

    if (isAbsolute(rawPath)) {
        fullPath = rawPath;
    } else if (rawPath.startsWith('./')) {
        // Resolve relative to project root /var/www/Girik-Class-Backend
        fullPath = join(projectRoot, rawPath);
    } else {
        fullPath = resolve(rawPath);
    }

    console.log('Attempting to load Firebase service account from:', fullPath);

    if (!existsSync(fullPath)) {
        throw new Error(`File not found at: ${fullPath}`);
    }

    const serviceAccount = JSON.parse(readFileSync(fullPath, 'utf8'));

    firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    console.log('Firebase Admin SDK initialized successfully');
    logger.info('Firebase Admin SDK initialized successfully');
} catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
    logger.error('Failed to initialize Firebase Admin SDK:', error);
}

export default firebaseApp;
