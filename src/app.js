import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import cookieParser from 'cookie-parser';
import routes from './routes.js';
import logger from './utils/logger.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { apiLogger, errorLogger } from './middlewares/api.logger.middleware.js';
import { setupSwagger } from './middlewares/swagger.middleware.js';
import './models/index.js'; // Initialize DB

const app = express();

// Trust proxy for rate limiting behind Nginx/CloudFront
app.set('trust proxy', 1); 

// CORS
const allowedOrigins = [
    'https://grclass.com',
    'https://www.grclass.com',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Security Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "cdn.grclass.com", "https://*.s3.amazonaws.com"],
        }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

// Request Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// API Request/Response Logger - Logs every API hit with details
// API Request/Response Logger - Logs every API hit with details
app.use('/api/v1', apiLogger);


// Routes
app.use('/api/v1', routes);

// OpenAPI Swagger docs (role-specific: /api-docs, /api-docs/admin, /api-docs/gm, etc.)
setupSwagger(app);

// Error Logger - Logs detailed error information
app.use(errorLogger);

// Error Handling
app.use(errorMiddleware);

export default app;
