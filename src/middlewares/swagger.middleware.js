/**
 * Role-specific Swagger UI middleware.
 * Serves OpenAPI docs at:
 *   /api-docs          - Full spec (all endpoints)
 *   /api-docs/admin    - ADMIN role view
 *   /api-docs/gm       - GM role view
 *   /api-docs/tm       - TM role view
 *   /api-docs/surveyor - SURVEYOR role view
 *   /api-docs/client   - CLIENT role view
 */
import swaggerUi from 'swagger-ui-express';
import swaggerUiDist from 'swagger-ui-dist';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yamljs';
import { buildFullSpec, clearCache, getSpecForRole } from '../docs/build-openapi.js';

const ROLE_SLUGS = ['admin', 'gm', 'tm', 'to', 'surveyor', 'client', 'ta', 'flag_admin', 'public'];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODULE_SWAGGER_DIR = path.resolve(__dirname, '../../docs/swagger-by-module');
const DOCS_DIR = path.resolve(__dirname, '../docs');
const PATHS_DIR = path.join(DOCS_DIR, 'paths');

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

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

function buildModuleSpec(moduleName) {
  const moduleYamlPath = path.join(PATHS_DIR, `${moduleName}.yaml`);
  if (!fs.existsSync(moduleYamlPath)) return null;

  // Build fresh spec from disk so edits appear instantly in dev.
  clearCache();
  const fullSpec = buildFullSpec();
  const moduleDoc = yaml.load(moduleYamlPath) || {};
  const modulePaths = pickModulePaths(fullSpec, moduleDoc);
  const moduleTags = collectModuleTags(modulePaths);

  return {
    ...fullSpec,
    info: {
      ...fullSpec.info,
      title: `${fullSpec.info?.title || 'API'} - ${moduleName} module`,
    },
    tags: (fullSpec.tags || []).filter((t) => moduleTags.has(t.name)),
    paths: modulePaths,
  };
}

const ROLE_MAP = {
  admin: 'ADMIN',
  gm: 'GM',
  tm: 'TM',
  to: 'TO',
  ta: 'TA',
  surveyor: 'SURVEYOR',
  client: 'CLIENT',
  flag_admin: 'FLAG_ADMIN',
  public: 'PUBLIC',
};

/**
 * Swagger UI options - Bearer auth for "Try it out"
 */
const SWAGGER_OPTIONS = {
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    tryItOutEnabled: true,
  },
};

/**
 * Setup Swagger UI - single mount at /api-docs
 * Uses swaggerUrl to load role-specific spec from /api-docs/spec/:role.json
 */
export function setupSwagger(app) {
  // Serve Swagger UI static assets for module pages from a dedicated path
  // so we never load default swagger-initializer.js (petstore URL).
  app.use('/api-docs/module-assets', express.static(swaggerUiDist.getAbsoluteFSPath()));

  // Spec endpoints - must be before the catch-all to avoid static file conflict
  app.get('/api-docs/spec.json', (req, res) => {
    // Rebuild on each request so docs edits appear instantly in dev.
    clearCache();
    const role = req.query.role || 'all';
    const spec = getSpecForRole(role);
    res.json(spec);
  });

  const roleUrls = [
    { url: '/api-docs/spec.json?role=all', name: 'ALL' },
    { url: '/api-docs/spec.json?role=ADMIN', name: 'ADMIN' },
    { url: '/api-docs/spec.json?role=GM', name: 'GM' },
    { url: '/api-docs/spec.json?role=TM', name: 'TM' },
    { url: '/api-docs/spec.json?role=TO', name: 'TO' },
    { url: '/api-docs/spec.json?role=TA', name: 'TA' },
    { url: '/api-docs/spec.json?role=SURVEYOR', name: 'SURVEYOR' },
    { url: '/api-docs/spec.json?role=CLIENT', name: 'CLIENT' },
    { url: '/api-docs/spec.json?role=FLAG_ADMIN', name: 'FLAG_ADMIN' },
    { url: '/api-docs/spec.json?role=PUBLIC', name: 'PUBLIC' },
  ];

  // Swagger UI: serve static first, then custom HTML for index paths
  const customHandler = (req, res, next) => {
    // Let dedicated module swagger endpoints handle /api-docs/module/*
    if (req.path.startsWith('/module')) {
      return next();
    }

    // If it's a static file request (.css, .js, .png, etc.), let swaggerUi.serve handle it
    if (req.path.includes('.') || req.path.endsWith('.css') || req.path.endsWith('.js')) {
      return next();
    }

    // Determine role from path: /api-docs/admin -> admin, /api-docs -> all
    const pathParts = req.path.replace(/^\//, '').split('/').filter(Boolean);
    const roleSlug = pathParts[0] && ROLE_SLUGS.includes(pathParts[0].toLowerCase())
      ? pathParts[0].toLowerCase()
      : null;

    const role = roleSlug ? ROLE_MAP[roleSlug] : 'all';
    
    // Check if we are at the root or a role-specific root
    const isRootDocs = req.path === '/' || req.path === '' || (roleSlug && pathParts.length === 1);

    const html = isRootDocs
      ? swaggerUi.generateHTML(null, {
          ...SWAGGER_OPTIONS,
          swaggerOptions: {
            ...SWAGGER_OPTIONS.swaggerOptions,
            urls: roleUrls,
            'urls.primaryName': role,
          },
        })
      : swaggerUi.generateHTML(null, {
          ...SWAGGER_OPTIONS,
          swaggerUrl: `/api-docs/spec.json?role=${role}`,
        });

    res.send(html);
  };

  app.use('/api-docs', swaggerUi.serve, customHandler);

  // Module-wise Swagger UI (interactive)
  app.get('/api-docs/module', (req, res) => {
    if (!fs.existsSync(MODULE_SWAGGER_DIR)) {
      return res.status(404).json({ success: false, message: 'Module swagger directory not found.' });
    }
    const modules = fs
      .readdirSync(MODULE_SWAGGER_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, ''))
      .sort();

    if (String(req.query.format || '').toLowerCase() === 'json') {
      return res.json({
        success: true,
        count: modules.length,
        modules,
        open_url_pattern: '/api-docs/module/{moduleName}',
      });
    }

    const moduleLinks = modules
      .map((m) => `
        <a class="card" href="/api-docs/module/${m}">
          <span class="name">${m}</span>
          <span class="hint">Open Swagger</span>
        </a>
      `)
      .join('\n');

    const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Module Swagger Index</title>
    <style>
      :root { color-scheme: light dark; }
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background: #0b1020;
        color: #e7eaf3;
      }
      .wrap {
        max-width: 1100px;
        margin: 0 auto;
        padding: 24px;
      }
      .title {
        font-size: 28px;
        margin: 0 0 8px;
      }
      .sub {
        margin: 0 0 18px;
        opacity: 0.85;
      }
      .tools {
        margin-bottom: 20px;
      }
      .tools a {
        color: #99c2ff;
        text-decoration: none;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 12px;
      }
      .card {
        display: block;
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 10px;
        padding: 14px;
        text-decoration: none;
        color: inherit;
        background: rgba(255,255,255,0.02);
      }
      .card:hover {
        border-color: #7cb1ff;
        background: rgba(124,177,255,0.08);
      }
      .name {
        display: block;
        font-weight: 700;
        margin-bottom: 6px;
      }
      .hint {
        display: block;
        font-size: 12px;
        opacity: 0.75;
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <h1 class="title">Module Swagger</h1>
      <p class="sub">Total modules: <strong>${modules.length}</strong></p>
      <div class="tools">
        <a href="/api-docs">Open Full Role-Based Swagger</a> |
        <a href="/api-docs/module?format=json">View modules JSON</a>
      </div>
      <div class="grid">
        ${moduleLinks}
      </div>
    </div>
  </body>
</html>
    `;

    return res.type('html').send(html);
  });

  app.get('/api-docs/module/spec/:module', (req, res) => {
    const moduleName = String(req.params.module || '').trim();
    const dynamic = buildModuleSpec(moduleName);
    if (dynamic) return res.json(dynamic);

    // Fallback: serve pre-generated module json (if present)
    const filePath = path.join(MODULE_SWAGGER_DIR, `${moduleName}.json`);
    if (fs.existsSync(filePath)) return res.sendFile(filePath);

    return res.status(404).json({ success: false, message: `Module '${moduleName}' not found.` });
  });

  app.get('/api-docs/module/:module', (req, res) => {
    const moduleName = String(req.params.module || '').trim();
    // Allow module UI even if we haven't generated docs/swagger-by-module yet,
    // as long as a matching src/docs/paths/<module>.yaml exists.
    const dynamic = buildModuleSpec(moduleName);
    const filePath = path.join(MODULE_SWAGGER_DIR, `${moduleName}.json`);
    if (!dynamic && !fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: `Module '${moduleName}' not found. Use /api-docs/module to list available modules.`,
      });
    }

    const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Swagger - ${moduleName} module</title>
    <link rel="stylesheet" type="text/css" href="/api-docs/module-assets/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/api-docs/module-assets/swagger-ui-bundle.js"></script>
    <script src="/api-docs/module-assets/swagger-ui-standalone-preset.js"></script>
    <script src="/api-docs/module/init/${moduleName}.js"></script>
  </body>
</html>
    `;
    return res.type('html').send(html);
  });

  app.get('/api-docs/module/init/:module.js', (req, res) => {
    const moduleName = String(req.params.module || '').trim();
    const dynamic = buildModuleSpec(moduleName);
    const filePath = path.join(MODULE_SWAGGER_DIR, `${moduleName}.json`);
    if (!dynamic && !fs.existsSync(filePath)) {
      return res.status(404).type('application/javascript').send('console.error("Module swagger not found.");');
    }

    const specUrl = `/api-docs/module/spec/${moduleName}`;
    const js = `
window.onload = function () {
  SwaggerUIBundle({
    url: ${JSON.stringify(specUrl)},
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: 'BaseLayout',
    docExpansion: 'list',
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
    validatorUrl: null
  });
};
`.trim();

    return res.type('application/javascript').send(js);
  });
}
