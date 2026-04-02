# INTEGRATIONS.md

## External Services & APIs

1. **AWS S3**
   - Used for file storage (document uploads, PDFs, certificates). 
   - Generates presigned URLs (`@aws-sdk/s3-request-presigner`).
   - SDK: `@aws-sdk/client-s3`

2. **AWS SES (v2)**
   - Used for transactional email delivery.
   - Configured via `@aws-sdk/client-sesv2` and likely combined with Nodemailer.

3. **Firebase Cloud Messaging (FCM)**
   - Push notifications to mobile/web clients.
   - Initialized via `firebase-admin` SDK.

4. **Redis**
   - In-memory data store for caching data, potentially tracking sessions, rate-limit buckets, or managing background job queues.
   - SDK: `redis`

## Development Integrations
- **Swagger/OpenAPI**: Built-in interactive documentation via `swagger-ui-express` and `swagger-jsdoc`. Also uses direct configuration files (e.g., `admin_swagger.json`).
- **Postman**: The `package.json` reveals a build script (`postman:build`) that converts endpoints/OpenAPI collections for Postman testing.
