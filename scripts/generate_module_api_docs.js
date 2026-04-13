import fs from 'fs';
import path from 'path';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PATHS_DIR = path.join(ROOT, 'src/docs/paths');
const OUT_DIR = path.join(ROOT, 'docs/api-by-module');

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

const isChangeMethod = (method) => ['post', 'put', 'patch', 'delete'].includes(method.toLowerCase());

const toTitle = (slug) =>
    slug
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (m) => m.toUpperCase());

const schemaLabel = (schema) => {
    if (!schema) return 'N/A';
    if (schema.$ref) return schema.$ref;
    if (schema.type === 'array' && schema.items?.$ref) return `array<${schema.items.$ref}>`;
    if (schema.type) return schema.type;
    return 'inline';
};

const renderParams = (params = []) => {
    if (!Array.isArray(params) || params.length === 0) return '- None';
    return params
        .map((p) => {
            const name = p?.name || 'unknown';
            const inLoc = p?.in || 'query';
            const required = p?.required ? 'required' : 'optional';
            const type = p?.schema?.type || (p?.schema?.$ref ? p.schema.$ref : 'unknown');
            return `- \`${name}\` (${inLoc}, ${required}, ${type})`;
        })
        .join('\n');
};

const renderRequestBody = (requestBody) => {
    if (!requestBody?.content) return '- None';
    const lines = [];
    for (const [ct, body] of Object.entries(requestBody.content)) {
        lines.push(`- \`${ct}\`: ${schemaLabel(body?.schema)}`);
    }
    return lines.join('\n');
};

const renderResponses = (responses = {}) => {
    const codes = Object.keys(responses);
    if (codes.length === 0) return '- None';
    return codes
        .sort((a, b) => Number(a) - Number(b))
        .map((code) => {
            const resp = responses[code] || {};
            const desc = resp.description || '';
            const content = resp.content || {};
            const contentEntries = Object.entries(content);
            if (contentEntries.length === 0) return `- \`${code}\`: ${desc || 'No schema'}`;
            const schemas = contentEntries.map(([ct, v]) => `${ct} => ${schemaLabel(v?.schema)}`).join(', ');
            return `- \`${code}\`: ${desc || 'OK'} (${schemas})`;
        })
        .join('\n');
};

const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const writeModuleFile = (moduleSlug, operations) => {
    const moduleTitle = toTitle(moduleSlug);
    const accessRoles = new Set();
    const readRoles = new Set();
    const changeRoles = new Set();

    operations.forEach((op) => {
        op.roles.forEach((r) => accessRoles.add(r));
        if (isChangeMethod(op.method)) op.roles.forEach((r) => changeRoles.add(r));
        else op.roles.forEach((r) => readRoles.add(r));
    });

    const lines = [];
    lines.push(`# ${moduleTitle} Module API`);
    lines.push('');
    lines.push(`Source: \`src/docs/paths/${moduleSlug}.yaml\``);
    lines.push('');
    lines.push('## Access Summary');
    lines.push(`- Roles with any access: ${[...accessRoles].sort().join(', ') || 'N/A'}`);
    lines.push(`- Roles with read access: ${[...readRoles].sort().join(', ') || 'N/A'}`);
    lines.push(`- Roles with change access: ${[...changeRoles].sort().join(', ') || 'N/A'}`);
    lines.push('');
    lines.push('## Role Action Matrix (Change Endpoints)');
    const changeOps = operations.filter((o) => isChangeMethod(o.method));
    if (changeOps.length === 0) {
        lines.push('- No write/change endpoint in this module.');
    } else {
        changeOps.forEach((op, i) => {
            lines.push(`${i + 1}. \`${op.method.toUpperCase()} ${op.path}\` -> ${op.roles.join(', ') || 'N/A'}`);
        });
    }
    lines.push('');
    lines.push('## Routes');

    operations.forEach((op, idx) => {
        lines.push('');
        lines.push(`### ${idx + 1}. ${op.method.toUpperCase()} ${op.path}`);
        lines.push(`- Summary: ${op.summary || 'N/A'}`);
        lines.push(`- Operation ID: \`${op.operationId || 'N/A'}\``);
        lines.push(`- Access Roles: ${op.roles.length ? op.roles.join(', ') : 'N/A'}`);
        lines.push(`- Action Type: ${isChangeMethod(op.method) ? 'CHANGE (can modify state)' : 'READ (view only)'}`);
        lines.push('- Path/Query/Header Params:');
        lines.push(renderParams(op.parameters));
        lines.push('- Request Body:');
        lines.push(renderRequestBody(op.requestBody));
        lines.push('- Responses:');
        lines.push(renderResponses(op.responses));
    });

    lines.push('');
    const outFile = path.join(OUT_DIR, `${moduleSlug}.md`);
    fs.writeFileSync(outFile, lines.join('\n'), 'utf8');
};

const main = () => {
    ensureDir(OUT_DIR);

    const files = fs
        .readdirSync(PATHS_DIR)
        .filter((f) => f.endsWith('.yaml'))
        .sort();

    const modules = [];

    files.forEach((file) => {
        const moduleSlug = file.replace(/\.yaml$/, '');
        const full = path.join(PATHS_DIR, file);
        const doc = YAML.load(full) || {};

        const operations = [];

        Object.entries(doc).forEach(([routePath, routeConfig]) => {
            if (!routeConfig || typeof routeConfig !== 'object') return;
            HTTP_METHODS.forEach((method) => {
                const op = routeConfig[method];
                if (!op || typeof op !== 'object') return;
                const roles = Array.isArray(op['x-roles']) ? op['x-roles'] : [];
                operations.push({
                    method,
                    path: routePath,
                    summary: op.summary || '',
                    operationId: op.operationId || '',
                    roles,
                    parameters: op.parameters || [],
                    requestBody: op.requestBody,
                    responses: op.responses || {}
                });
            });
        });

        writeModuleFile(moduleSlug, operations);
        modules.push({ moduleSlug, count: operations.length });
    });

    const readmeLines = [];
    readmeLines.push('# Module Wise API Docs');
    readmeLines.push('');
    readmeLines.push('Auto-generated from `src/docs/paths/*.yaml`.');
    readmeLines.push('');
    readmeLines.push('Each module file contains:');
    readmeLines.push('- All routes in that module');
    readmeLines.push('- Params and request body');
    readmeLines.push('- Response status + schema');
    readmeLines.push('- Who can access');
    readmeLines.push('- Who can change state (role-action matrix)');
    readmeLines.push('');
    readmeLines.push('## Modules');
    modules.forEach((m) => {
        readmeLines.push(`- [${m.moduleSlug}](./${m.moduleSlug}.md) (${m.count} operations)`);
    });
    readmeLines.push('');

    fs.writeFileSync(path.join(OUT_DIR, 'README.md'), readmeLines.join('\n'), 'utf8');
    console.log(`Generated ${modules.length} module files in ${OUT_DIR}`);
};

main();
