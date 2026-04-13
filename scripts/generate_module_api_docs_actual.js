import fs from 'fs';
import path from 'path';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DOCS_PATHS_DIR = path.join(ROOT, 'src/docs/paths');
const MODULES_DIR = path.join(ROOT, 'src/modules');
const VALIDATE_FILE = path.join(ROOT, 'src/middlewares/validate.middleware.js');
const OUT_DIR = path.join(ROOT, 'docs/api-by-module');

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

const toTitle = (slug) =>
    slug
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (m) => m.toUpperCase());

const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const listFilesRecursive = (dir, predicate = () => true) => {
    const out = [];
    const walk = (curr) => {
        for (const entry of fs.readdirSync(curr, { withFileTypes: true })) {
            const full = path.join(curr, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (predicate(full)) out.push(full);
        }
    };
    walk(dir);
    return out;
};

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

const extractBlockFromIndex = (text, startIdx, openChar = '{', closeChar = '}') => {
    const openIdx = text.indexOf(openChar, startIdx);
    if (openIdx === -1) return null;
    let depth = 0;
    let inSingle = false;
    let inDouble = false;
    let inBacktick = false;
    let escaped = false;
    for (let i = openIdx; i < text.length; i++) {
        const ch = text[i];
        if (escaped) {
            escaped = false;
            continue;
        }
        if (ch === '\\') {
            escaped = true;
            continue;
        }
        if (!inDouble && !inBacktick && ch === "'" && text[i - 1] !== '\\') inSingle = !inSingle;
        else if (!inSingle && !inBacktick && ch === '"' && text[i - 1] !== '\\') inDouble = !inDouble;
        else if (!inSingle && !inDouble && ch === '`' && text[i - 1] !== '\\') inBacktick = !inBacktick;
        if (inSingle || inDouble || inBacktick) continue;
        if (ch === openChar) depth++;
        if (ch === closeChar) {
            depth--;
            if (depth === 0) return text.slice(openIdx, i + 1);
        }
    }
    return null;
};

const parseImports = (text, filePath) => {
    const imports = {};
    const importRegex = /import\s+([^;]+?)\s+from\s+['"](.+?)['"];/g;
    let m;
    while ((m = importRegex.exec(text)) !== null) {
        const left = m[1].trim();
        const src = m[2].trim();
        const abs = src.startsWith('.') ? path.resolve(path.dirname(filePath), src) : src;

        if (left.startsWith('* as ')) {
            const alias = left.replace('* as ', '').trim();
            imports[alias] = abs;
            continue;
        }
        if (left.startsWith('{') && left.endsWith('}')) {
            const names = left
                .slice(1, -1)
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            names.forEach((n) => {
                const [orig, alias] = n.split(/\s+as\s+/);
                imports[(alias || orig).trim()] = abs;
            });
        }
    }
    return imports;
};

const parseRouteCalls = (routeFile) => {
    const text = fs.readFileSync(routeFile, 'utf8');
    const imports = parseImports(text, routeFile);
    const calls = [];
    const callRegex = /router\.(get|post|put|patch|delete|options|head)\s*\(/g;
    let m;
    while ((m = callRegex.exec(text)) !== null) {
        const method = m[1].toLowerCase();
        const start = m.index + m[0].length - 1;
        const argsBlock = extractBlockFromIndex(text, start, '(', ')');
        if (!argsBlock) continue;
        const args = argsBlock.slice(1, -1);
        const pathMatch = args.match(/^\s*['"`]([^'"`]+)['"`]/);
        const routePath = pathMatch?.[1] || '';

        const roles = [];
        const authMatches = [...args.matchAll(/authorizeRoles\(([\s\S]*?)\)/g)];
        authMatches.forEach((x) => {
            const roleStr = x[1];
            const roleMatches = [...roleStr.matchAll(/['"]([A-Z_]+)['"]/g)];
            roleMatches.forEach((r) => roles.push(r[1]));
        });

        const schemaMatch = args.match(/validate\s*\(\s*schemas\.([A-Za-z0-9_]+)\s*\)/);
        const validateSchema = schemaMatch?.[1] || null;

        const handlerMatch = [...args.matchAll(/([A-Za-z0-9_]+)\.([A-Za-z0-9_]+)\s*$/gm)].pop();
        const controllerAlias = handlerMatch?.[1] || null;
        const controllerFn = handlerMatch?.[2] || null;
        const controllerFile = controllerAlias ? imports[controllerAlias] : null;
        const line = lineOf(text, m.index);

        calls.push({
            method,
            routePath,
            roles: [...new Set(roles)],
            validateSchema,
            controllerAlias,
            controllerFn,
            controllerFile,
            routeFile,
            line
        });
    }
    return calls;
};

const extractExportedFunction = (filePath, fnName) => {
    if (!filePath || !fs.existsSync(filePath)) return null;
    const text = fs.readFileSync(filePath, 'utf8');
    const patterns = [
        new RegExp(`export\\s+const\\s+${fnName}\\s*=\\s*async\\s*\\([^)]*\\)\\s*=>\\s*\\{`, 'm'),
        new RegExp(`export\\s+const\\s+${fnName}\\s*=\\s*\\([^)]*\\)\\s*=>\\s*\\{`, 'm'),
        new RegExp(`export\\s+async\\s+function\\s+${fnName}\\s*\\([^)]*\\)\\s*\\{`, 'm'),
        new RegExp(`export\\s+function\\s+${fnName}\\s*\\([^)]*\\)\\s*\\{`, 'm')
    ];
    for (const p of patterns) {
        const m = p.exec(text);
        if (!m) continue;
        const idx = m.index;
        const body = extractBlockFromIndex(text, idx, '{', '}');
        if (!body) continue;
        const startLine = lineOf(text, idx);
        return { text, body, startLine, filePath, imports: parseImports(text, filePath) };
    }
    return null;
};

const extractControllerResponseEnvelopes = (fnBody) => {
    const out = [];
    const re = /res\.(?:status\(\d+\)\.)?json\(/g;
    let m;
    while ((m = re.exec(fnBody)) !== null) {
        const start = m.index + m[0].length - 1;
        const b = extractBlockFromIndex(fnBody, start, '(', ')');
        if (!b) continue;
        out.push(b.slice(1, -1).trim());
    }
    return out;
};

const extractReqUsage = (fnBody) => {
    const params = [...new Set([...fnBody.matchAll(/req\.params\.([A-Za-z0-9_]+)/g)].map((m) => m[1]))];
    const query = [...new Set([...fnBody.matchAll(/req\.query\.([A-Za-z0-9_]+)/g)].map((m) => m[1]))];
    const body = [...new Set([...fnBody.matchAll(/req\.body\.([A-Za-z0-9_]+)/g)].map((m) => m[1]))];
    const user = [...new Set([...fnBody.matchAll(/req\.user\.([A-Za-z0-9_]+)/g)].map((m) => m[1]))];
    const file = [...new Set([...fnBody.matchAll(/req\.(file|files)/g)].map((m) => m[1]))];
    return { params, query, body, user, file };
};

const extractServiceCalls = (fnBody) => {
    return [...fnBody.matchAll(/([A-Za-z0-9_]+Service)\.([A-Za-z0-9_]+)\s*\(/g)].map((m) => ({
        alias: m[1],
        fn: m[2]
    }));
};

const extractModelUsageFromService = (serviceFn) => {
    if (!serviceFn) return { models: [], returns: [] };
    const body = serviceFn.body;
    const models = [...new Set([...body.matchAll(/\b([A-Z][A-Za-z0-9_]+)\.(findAll|findOne|findByPk|findAndCountAll|count|create|update|destroy|bulkCreate|upsert)\s*\(/g)].map((m) => `${m[1]}.${m[2]}`))];
    const returns = [...new Set([...body.matchAll(/return\s+([^;]+);/g)].map((m) => m[1].trim()).slice(0, 8))];
    return { models, returns };
};

const extractJoiSchemaBlock = (schemaName) => {
    if (!schemaName) return null;
    const text = fs.readFileSync(VALIDATE_FILE, 'utf8');
    const re = new RegExp(`${schemaName}\\s*:\\s*Joi\\.object\\s*\\(`, 'm');
    const m = re.exec(text);
    if (!m) return null;
    const start = m.index;
    const objBlock = extractBlockFromIndex(text, text.indexOf('Joi.object', start), '(', ')');
    if (!objBlock) return null;
    const line = lineOf(text, start);
    return { line, snippet: `Joi.object${objBlock}` };
};

const summarizeParams = (params = []) => {
    if (!params.length) return '- None';
    return params
        .map((p) => `- \`${p.name}\` (${p.in || 'query'}, ${p.required ? 'required' : 'optional'}, ${p.schema?.type || p.schema?.$ref || 'unknown'})`)
        .join('\n');
};

const summarizeRequestBodyFromDoc = (rb) => {
    if (!rb?.content) return '- None';
    return Object.entries(rb.content)
        .map(([ct, v]) => `- \`${ct}\`: ${v?.schema?.$ref || v?.schema?.type || 'inline'}`)
        .join('\n');
};

const summarizeResponsesFromDoc = (responses = {}) => {
    const keys = Object.keys(responses);
    if (!keys.length) return '- None';
    return keys
        .sort((a, b) => Number(a) - Number(b))
        .map((code) => {
            const r = responses[code] || {};
            const entries = Object.entries(r.content || {});
            if (!entries.length) return `- \`${code}\`: ${r.description || 'No schema'}`;
            return `- \`${code}\`: ${r.description || ''} (${entries.map(([ct, v]) => `${ct} => ${v?.schema?.$ref || v?.schema?.type || 'inline'}`).join(', ')})`;
        })
        .join('\n');
};

const operationKey = (method, opId, routePath) => `${method.toLowerCase()}::${opId || ''}::${routePath}`;

const main = () => {
    ensureDir(OUT_DIR);

    const routeFiles = listFilesRecursive(MODULES_DIR, (f) => f.endsWith('.routes.js'));
    const routeIndex = [];
    routeFiles.forEach((rf) => {
        routeIndex.push(...parseRouteCalls(rf));
    });

    const pathYamlFiles = fs.readdirSync(DOCS_PATHS_DIR).filter((f) => f.endsWith('.yaml')).sort();
    const moduleReadme = ['# Module Wise API Docs (Actual Code Backed)', '', 'Generated from `src/docs/paths/*.yaml` + actual route/controller/service/model code.', ''];

    pathYamlFiles.forEach((yamlFile) => {
        const moduleSlug = yamlFile.replace(/\.yaml$/, '');
        const moduleTitle = toTitle(moduleSlug);
        const yamlAbs = path.join(DOCS_PATHS_DIR, yamlFile);
        const doc = YAML.load(yamlAbs) || {};
        const operations = [];

        Object.entries(doc).forEach(([routePath, routeConfig]) => {
            if (!routeConfig || typeof routeConfig !== 'object') return;
            HTTP_METHODS.forEach((method) => {
                const op = routeConfig[method];
                if (!op) return;
                operations.push({
                    method,
                    routePath,
                    operationId: op.operationId || '',
                    summary: op.summary || '',
                    roles: Array.isArray(op['x-roles']) ? op['x-roles'] : [],
                    parameters: op.parameters || [],
                    requestBody: op.requestBody || null,
                    responses: op.responses || {}
                });
            });
        });

        const lines = [];
        lines.push(`# ${moduleTitle} Module API (Actual)`);
        lines.push('');
        lines.push(`Source YAML: \`src/docs/paths/${yamlFile}\``);
        lines.push('');
        lines.push('## Routes');

        operations.forEach((op, idx) => {
            const candidates = routeIndex.filter((r) => r.method === op.method && r.controllerFn);
            const byOpId = candidates.filter((r) => r.controllerFn === op.operationId);
            const routeMeta = byOpId[0] || candidates.find((r) => r.routePath === op.routePath) || null;

            let controllerMeta = null;
            let reqUsage = { params: [], query: [], body: [], user: [], file: [] };
            let envelopes = [];
            let serviceDetails = [];
            let joi = null;

            if (routeMeta?.controllerFile && routeMeta?.controllerFn) {
                controllerMeta = extractExportedFunction(routeMeta.controllerFile, routeMeta.controllerFn);
                if (controllerMeta) {
                    reqUsage = extractReqUsage(controllerMeta.body);
                    envelopes = extractControllerResponseEnvelopes(controllerMeta.body);
                    const serviceCalls = extractServiceCalls(controllerMeta.body);
                    const uniqueCalls = [...new Map(serviceCalls.map((x) => [`${x.alias}.${x.fn}`, x])).values()];
                    uniqueCalls.forEach((svc) => {
                        const svcFile = controllerMeta.imports?.[svc.alias];
                        const svcFn = extractExportedFunction(svcFile, svc.fn);
                        const modelData = extractModelUsageFromService(svcFn);
                        serviceDetails.push({
                            alias: svc.alias,
                            fn: svc.fn,
                            file: svcFile,
                            line: svcFn?.startLine || null,
                            models: modelData.models,
                            returns: modelData.returns
                        });
                    });
                }
            }

            joi = extractJoiSchemaBlock(routeMeta?.validateSchema || null);

            lines.push('');
            lines.push(`### ${idx + 1}. ${op.method.toUpperCase()} ${op.routePath}`);
            lines.push(`- Summary: ${op.summary || 'N/A'}`);
            lines.push(`- Operation ID: \`${op.operationId || 'N/A'}\``);
            lines.push(`- Access Roles: ${op.roles.join(', ') || 'N/A'}`);
            lines.push(`- Change Access: ${['post', 'put', 'patch', 'delete'].includes(op.method) ? op.roles.join(', ') || 'N/A' : 'N/A (read endpoint)'}`);
            lines.push('');
            lines.push('Request (Code + Schema)');
            lines.push(`- Route Params/Query from YAML:\n${summarizeParams(op.parameters)}`);
            lines.push(`- Request Body from YAML:\n${summarizeRequestBodyFromDoc(op.requestBody)}`);
            lines.push(`- Req usage in controller: params=[${reqUsage.params.join(', ')}], query=[${reqUsage.query.join(', ')}], body=[${reqUsage.body.join(', ')}], user=[${reqUsage.user.join(', ')}], files=[${reqUsage.file.join(', ')}]`);
            lines.push(`- Validation schema key: \`${routeMeta?.validateSchema || 'N/A'}\``);
            if (joi) {
                lines.push(`- Joi schema source: \`src/middlewares/validate.middleware.js:${joi.line}\``);
                lines.push('```js');
                lines.push(joi.snippet);
                lines.push('```');
            }
            lines.push('');
            lines.push('Response (Actual)');
            lines.push(`- YAML response map:\n${summarizeResponsesFromDoc(op.responses)}`);
            if (envelopes.length) {
                lines.push('- Controller response envelope(s):');
                envelopes.slice(0, 3).forEach((e) => {
                    lines.push('```js');
                    lines.push(e);
                    lines.push('```');
                });
            } else {
                lines.push('- Controller response envelope(s): N/A');
            }
            lines.push('');
            lines.push('Implementation Trace');
            lines.push(`- Route file: \`${routeMeta?.routeFile ? path.relative(ROOT, routeMeta.routeFile) : 'N/A'}${routeMeta?.line ? `:${routeMeta.line}` : ''}\``);
            lines.push(`- Controller: \`${controllerMeta?.filePath ? path.relative(ROOT, controllerMeta.filePath) : 'N/A'}${controllerMeta?.startLine ? `:${controllerMeta.startLine}` : ''}\``);
            if (!serviceDetails.length) {
                lines.push('- Services: N/A');
            } else {
                serviceDetails.forEach((s) => {
                    lines.push(`- Service: \`${s.file ? path.relative(ROOT, s.file) : 'N/A'}${s.line ? `:${s.line}` : ''}\` (\`${s.alias}.${s.fn}\`)`);
                    lines.push(`- Models touched: ${s.models.length ? s.models.join(', ') : 'N/A'}`);
                    lines.push(`- Service returns (detected): ${s.returns.length ? s.returns.join(' | ') : 'N/A'}`);
                });
            }
        });

        const outFile = path.join(OUT_DIR, `${moduleSlug}.md`);
        fs.writeFileSync(outFile, lines.join('\n'), 'utf8');
        moduleReadme.push(`- [${moduleSlug}](./${moduleSlug}.md) (${operations.length} operations)`);
    });

    moduleReadme.push('');
    moduleReadme.push('Regenerate with:');
    moduleReadme.push('```bash');
    moduleReadme.push('node scripts/generate_module_api_docs_actual.js');
    moduleReadme.push('```');
    moduleReadme.push('');

    fs.writeFileSync(path.join(OUT_DIR, 'README.md'), moduleReadme.join('\n'), 'utf8');
    console.log(`Generated code-backed module docs in ${OUT_DIR}`);
};

main();
