# CONVENTIONS.md

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
