# TESTING.md

## Test Framework
- Testing framework is native node test-runner (`node --test`).
- Mocking and assertion handled by native module constraints (e.g. `assert`).

## Scope and Coverage
- Primary test sets exist in `tests/**/*.test.js`.
- Additional root-level ad-hoc simulation scripts (e.g., `test_e2e.js`, `test_puppeteer_dynamic.js`, `test_flow.js`, `test_notif.js`) showcase manual QA scripts that mimic e2e testing.
- Test commands available:
  - `npm test` -> Run all tests.
  - `npm run test:apis` -> Run specific API suite.

## Execution Requirements
- Environment requires local DB replica to test safely without destructing staging states.
- E2e scripts leverage `seed_e2e.js` to pre-warm the database with valid data prior to complex job flows.
