<!-- GSD:project-start source:PROJECT.md -->
## Project

**GR-CLASS Backend - Maritime Certificate Generation System**

An enterprise-grade maritime certification platform designed for classification societies and recognized organizations. It digitizes the complete lifecycle of vessel inspection and certification processes, replacing manual, error-prone workflows with a reliable, scalable, and auditable digital system.

**Core Value:** Ensure the auditable, accurate, and seamless digitization of vessel inspections leading to verifiable maritime certificate generation.

### Constraints

- **Tech Stack**: Node.js, Express (v5), Sequelize (MySQL) — New additions must align with existing architectural choices.
- **Workflow Integrity**: Must maintain transactional integrity and strict lifecycle states for jobs and certificates — Maritime compliance regulations make this non-negotiable.
- **Security**: Must adhere to RBAC definitions exactly as defined by the classification society models.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages & Runtime
- **Language**: JavaScript (ES Modules / ES6+)
- **Runtime**: Node.js
## Core Framework
- **Web Framework**: Express.js (v5)
## Data & Persistence
- **Database**: MySQL (via MySQL2 driver)
- **ORM**: Sequelize
- **Caching & KV store**: Redis
## Core Libraries & Utilities
- **Validation**: Joi
- **Security**: Helmet, CORS, express-rate-limit, cookie-parser, bcrypt, jsonwebtoken
- **Logging**: Winston, Morgan
- **Document Generation**: Puppeteer (for PDFs), archiver
- **Scheduling**: node-cron
- **File Uploads**: multer
## Cloud & Third Party
- **AWS**: S3 & SES (via @aws-sdk/client-s3 and @aws-sdk/client-sesv2)
- **Notifications**: Firebase Admin (Push), Nodemailer (Email fallback config etc.)
## Project Type
- **Type**: Backend REST API (`gr-class-backend`)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Code Style
- Uses **ES Modules** natively (`import`/`export`) leveraging `"type": "module"` in Node.
- Formatting loosely relies on standard standardjs/prettier but isn't explicitly mandated in root yet.
## API & Rest Conventions
- All APIs are versioned under `/api/v1/`.
- Reponses standardize success/failure formats typically relying on express standard `.json()` handling via centralized error catching.
## Architecture Patterns
- **Controllers** act as lightweight orchestration layer. They unwrap `req`, delegate tasks to a **Service**, and wrap responses `res`.
- Validation happens pre-controller via **Joi** middleware or ad-hoc functions inside controllers.
- Cross-origin configuration securely locks endpoints down except for authorized domains (like `grclass.com`).
## Error Handling
- Handled at route level wrapping with `try/catch` block.
- Global express error middleware catches unhandled rejections via `errorMiddleware`.
- `next(err)` sends errors to central dispatcher avoiding stack trace bleeds in production.
## Environment configuration
- Defined in `.env` and accessed directly via `process.env`.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## High-Level Architecture
- **Pattern**: Modular Monolith using Express.js.
- **API Style**: RESTful API answering via JSON.
## Key Layers
## Data Flow
## Security Architecture
- RBAC validation handled inside routes or custom auth middleware.
- Request validation is driven by Joi.
- Global and customized Rate Limits.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
