import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yamljs';
import { buildFullSpec } from './build-openapi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = __dirname;
const PATHS_DIR = path.join(DOCS_DIR, 'paths');
const OUT_DIR = path.join(path.resolve(DOCS_DIR, '..', '..'), 'docs', 'swagger-by-module');

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const titleCase = (s) =>
    s
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (m) => m.toUpperCase());

const pickModulePaths = (fullSpec, moduleDoc) => {
    const paths = {};
    for (const [p, cfg] of Object.entries(moduleDoc || {})) {
        const fullPathCfg = fullSpec.paths?.[p];
        if (!fullPathCfg) continue;
        const onlyModuleMethods = {};
        for (const [k, v] of Object.entries(cfg || {})) {
            if (HTTP_METHODS.includes(k.toLowerCase())) {
                onlyModuleMethods[k] = fullPathCfg[k];
            } else {
                onlyModuleMethods[k] = fullPathCfg[k] ?? v;
            }
        }
        paths[p] = onlyModuleMethods;
    }
    return paths;
};

const collectModuleTags = (pathsObj) => {
    const tags = new Set();
    for (const pathCfg of Object.values(pathsObj || {})) {
        for (const [method, op] of Object.entries(pathCfg || {})) {
            if (!HTTP_METHODS.includes(method.toLowerCase())) continue;
            (op?.tags || []).forEach((t) => tags.add(t));
        }
    }
    return tags;
};

const main = () => {
    ensureDir(OUT_DIR);

    const fullSpec = buildFullSpec();
    const pathFiles = fs.readdirSync(PATHS_DIR).filter((f) => f.endsWith('.yaml')).sort();

    const readme = [];
    readme.push('# Module Wise Swagger');
    readme.push('');
    readme.push('Generated from `src/docs/paths/*.yaml` and merged OpenAPI components.');
    readme.push('');
    readme.push('## Files');

    for (const file of pathFiles) {
        const moduleSlug = file.replace(/\.yaml$/, '');
        const moduleTitle = titleCase(moduleSlug);
        const moduleDoc = yaml.load(path.join(PATHS_DIR, file)) || {};
        const modulePaths = pickModulePaths(fullSpec, moduleDoc);
        const moduleTags = collectModuleTags(modulePaths);

        const spec = {
            ...fullSpec,
            info: {
                ...fullSpec.info,
                title: `${fullSpec.info?.title || 'API'} - ${moduleTitle} Module`,
            },
            tags: (fullSpec.tags || []).filter((t) => moduleTags.has(t.name)),
            paths: modulePaths
        };

        const jsonFile = path.join(OUT_DIR, `${moduleSlug}.json`);
        const yamlFile = path.join(OUT_DIR, `${moduleSlug}.yaml`);
        fs.writeFileSync(jsonFile, JSON.stringify(spec, null, 2), 'utf8');
        fs.writeFileSync(yamlFile, yaml.stringify(spec, 10, 2), 'utf8');

        readme.push(`- \`${moduleSlug}\`: [${moduleSlug}.yaml](./${moduleSlug}.yaml), [${moduleSlug}.json](./${moduleSlug}.json)`);
    }

    readme.push('');
    readme.push('Regenerate:');
    readme.push('```bash');
    readme.push('node src/docs/generate-module-swagger.js');
    readme.push('```');
    readme.push('');

    fs.writeFileSync(path.join(OUT_DIR, 'README.md'), readme.join('\n'), 'utf8');
    console.log(`Generated ${pathFiles.length} module swagger files in ${OUT_DIR}`);
};

main();
