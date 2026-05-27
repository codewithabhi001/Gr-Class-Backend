/**
 * Cross-check Express authorizeRoles vs OpenAPI x-roles.
 * Run: node scripts/audit-swagger-rbac.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildFullSpec } from '../src/docs/build-openapi.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODULES_DIR = path.join(__dirname, '../src/modules');

const MOUNT_PREFIX = {
    jobs: '/api/v1/jobs',
    surveys: '/api/v1/surveys',
    certificates: '/api/v1/certificates',
    non_conformities: '/api/v1/non-conformities',
    checklists: '/api/v1/checklists',
    'checklist-templates': '/api/v1/checklist-templates',
};

function resolveMount(file) {
    const base = path.basename(file);
    if (base === 'checklist_template.routes.js') return MOUNT_PREFIX['checklist-templates'];
    const mod = path.basename(path.dirname(file));
    return MOUNT_PREFIX[mod];
}

function parseRouteRoles(content) {
    const routes = [];
    const re = /router\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]\s*,([^;]+);/gs;
    let m;
    while ((m = re.exec(content)) !== null) {
        const method = m[1].toUpperCase();
        const segment = m[2];
        const middleware = m[3];
        const roleMatch = middleware.match(/authorizeRoles\(([^)]+)\)/);
        if (!roleMatch) continue;
        const rolesExpr = roleMatch[1];
        const roles = [];
        const spread = rolesExpr.match(/\.\.\.RBAC\.(\w+)/);
        if (spread) roles.push(`RBAC.${spread[1]}`);
        const literals = rolesExpr.match(/'([A-Z_]+)'/g) || [];
        literals.forEach((r) => roles.push(r.replace(/'/g, '')));
        routes.push({ method, segment, roles });
    }
    return routes;
}

function normalizeSwaggerPath(segment, mount) {
    let p = mount + (segment === '/' ? '' : segment.startsWith('/') ? segment : `/${segment}`);
    p = p.replace(/:([a-zA-Z_]+)/g, '{$1}');
    return p.replace(/\/+$/, '') || mount;
}

function findSwaggerOp(paths, fullPath, method) {
    const m = method.toLowerCase();
    const candidates = [fullPath, `${fullPath}/`];
    for (const p of candidates) {
        if (paths[p]?.[m]) return paths[p][m];
    }
    return null;
}

function getSwaggerRoles(op) {
    if (!op) return null;
    const fromExt = op['x-roles'];
    if (Array.isArray(fromExt)) return [...fromExt].sort();
    const desc = op.description || '';
    const m = desc.match(/\*\*Roles:\*\*\s*([^\n]+)/i);
    if (m) {
        return m[1].split(/[,/]/).map((r) => r.trim().replace(/\.$/, '')).filter(Boolean).sort();
    }
    return null;
}

function walkModules(dir, list = []) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) walkModules(full, list);
        else if (ent.name.endsWith('.routes.js')) list.push(full);
    }
    return list;
}

const RBAC_MAP = {
    'RBAC.ASSIGN_JOB': ['ADMIN', 'GM'],
    'RBAC.REASSIGN_JOB': ['ADMIN', 'GM', 'TM'],
    'RBAC.AUTHORIZE_SURVEY': ['ADMIN', 'TM'],
};

function expandRoles(roles) {
    const out = new Set();
    for (const r of roles) {
        if (RBAC_MAP[r]) RBAC_MAP[r].forEach((x) => out.add(x));
        else out.add(r);
    }
    return [...out].sort();
}

const spec = buildFullSpec();
const issues = [];
const checked = [];

for (const file of walkModules(MODULES_DIR)) {
    const mount = resolveMount(file);
    if (!mount) continue;

    const content = fs.readFileSync(file, 'utf8');
    const routes = parseRouteRoles(content);

    for (const r of routes) {
        const fullPath = normalizeSwaggerPath(r.segment, mount);
        const swaggerOp = findSwaggerOp(spec.paths || {}, fullPath, r.method);
        const codeRoles = expandRoles(r.roles);
        const docRoles = getSwaggerRoles(swaggerOp);

        checked.push({ method: r.method, path: fullPath, codeRoles, docRoles });

        if (!swaggerOp) {
            issues.push({ type: 'MISSING_IN_SWAGGER', method: r.method, path: fullPath, codeRoles });
            continue;
        }
        if (!docRoles) {
            issues.push({ type: 'MISSING_X_ROLES', method: r.method, path: fullPath, codeRoles });
            continue;
        }
        const codeSet = new Set(codeRoles);
        const docSet = new Set(docRoles);
        const missingInDoc = codeRoles.filter((x) => !docSet.has(x));
        const extraInDoc = docRoles.filter((x) => !codeSet.has(x));
        if (missingInDoc.length || extraInDoc.length) {
            issues.push({
                type: 'ROLE_MISMATCH',
                method: r.method,
                path: fullPath,
                codeRoles,
                docRoles,
                missingInDoc,
                extraInDoc,
            });
        }
    }
}

console.log(`Checked ${checked.length} mounted routes (jobs/surveys/certificates/nc/checklists).`);
if (issues.length === 0) {
    console.log('OK: No RBAC mismatches found for audited modules.');
    process.exit(0);
}

console.log(`\nFound ${issues.length} issue(s):\n`);
for (const i of issues) {
    console.log(`[${i.type}] ${i.method} ${i.path}`);
    if (i.codeRoles) console.log(`  code: ${i.codeRoles.join(', ')}`);
    if (i.docRoles) console.log(`  swagger: ${i.docRoles.join(', ')}`);
    if (i.missingInDoc?.length) console.log(`  missing in swagger: ${i.missingInDoc.join(', ')}`);
    if (i.extraInDoc?.length) console.log(`  extra in swagger: ${i.extraInDoc.join(', ')}`);
}
process.exit(1);
