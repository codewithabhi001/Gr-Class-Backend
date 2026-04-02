# STRUCTURE.md

## Directory Map

```
/
├── src/                      # Core application source
│   ├── app.js               # Express application configuration
│   ├── server.js            # Entry point to launch HTTP server
│   ├── routes.js            # Master API router multiplexing all modules
│   ├── config/              # Server configuration, env loader
│   ├── db.js                # Database initialization logic
│   ├── docs/                # Internal code docs or temp folder
│   ├── email-templates/     # EJS/HTML templates for SES emails
│   ├── middlewares/         # Globals (auth, logger, error, swagger)
│   ├── models/              # Shared Sequelize Definitions
│   ├── modules/             # Vertical Feature Slices (Domain Modules)
│   │   ├── auth/            # E.g., User Authentication logic
│   │   ├── jobs/            # Job flows controller/service/routes
│   │   ├── surveys/         # Core Survey and Certificates 
│   │   ├── public/          # Public-facing APIs
│   │   └── ...              # (~20+ other bounded modules)
│   ├── seeders/             # DB Seed data
│   └── utils/               # Shared utilities (logging, crypto, math)
├── tests/                   # End-to-end and Unit Tests using node --test
├── scripts/                 # Utility scripting (Postman gen, tests)
├── migrations/              # Database Schema Definitions
├── .planning/               # GSD (Get Shit Done) context directory
└── ... (various root script tests & markdown documentation files)
```

## Naming Conventions
- Route aggregators: `*.routes.js`
- Controllers: `*.controller.js`
- Services: `*.service.js`
- Test files: `*.test.js` or ad-hoc custom prefixed root tests (`test_*.js`).
