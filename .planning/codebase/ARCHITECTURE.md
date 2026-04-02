# ARCHITECTURE.md

## High-Level Architecture
- **Pattern**: Modular Monolith using Express.js.
- **API Style**: RESTful API answering via JSON.

## Key Layers
1. **Entry Point (`src/server.js`)**: Starts the server, connects to DB.
2. **App Setup (`src/app.js`)**: Configures Express middleware (CORS, Helmet, Rate Limits, body parsers) and mounts routing.
3. **Routing (`src/routes.js`)**: Master router that aggregates all sub-module routes via `/api/v1/`.
4. **Modules (`src/modules/*`)**: The codebase groups features vertically by domain rather than flat by layer. E.g., `clients`, `vessels`, `jobs`, `surveys`, `checklists`. Each module typically houses its own routes, controllers, and services.
5. **Data Layer (`src/models/`, `db.js`)**: Shared DB concerns. Sequelize defines the schema, relations, and migrations.

## Data Flow
Request -> Rate Limiter/Helmet/Morgan (`app.js`) -> Main Router (`routes.js`) -> Module Router (`module.routes.js`) -> Middleware (Auth/RBAC) -> Controller (`module.controller.js`) -> Service layer (Business Logic) -> Model/ORM (Sequelize).

## Security Architecture
- RBAC validation handled inside routes or custom auth middleware.
- Request validation is driven by Joi.
- Global and customized Rate Limits.
