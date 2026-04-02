# CONCERNS.md

## Technical Debt & Areas of Concern

1. **Root Directory Clutter**:
   - The project repository features an array of root-level `test_*.js` integration scripts and `.tmp-*` files. These should ideally be migrated into `/scripts` or `/tests` appropriately to keep root level isolated.

2. **Monolithic Module Scale**:
   - The application supports over 25+ domain features currently layered into a standard MVC Express setup inside `/modules`. Continuing this pattern will result in sprawling initialization times and heavily coupled internal dependencies.

3. **Performance Limits**:
   - Global Rate Limiter in `app.js` is quite lenient. More granular service-layer rate-limiting logic might be required under heavy concurrent load. 

4. **API Response Logger Scale**:
   - The `apiLogger` operates broadly over all `/api/v1` traffic. Ensuring `Winston` drops logs directly to file efficiently or using a sidecar streaming system instead to prevent I/O blocking.

5. **Security Pattern Review**:
   - Helmet acts as the main line of cross-origin defense, however CSP inline styles might need refinement based on `"styleSrc": ["'self'", "'unsafe-inline'"]` to tighten script safety rules.
