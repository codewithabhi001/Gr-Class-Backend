
import fs from 'fs';
import path from 'path';

const REQ_ROLES = ['GM', 'TA', 'TM', 'TO'];

async function fetchSpec(role) {
    const res = await fetch(`http://localhost:5000/api-docs/spec.json?role=${role}`);
    if (!res.ok) throw new Error(`Failed to fetch ${role}`);
    return res.json();
}

function resolveRef(ref, spec) {
    if (!ref.startsWith('#/components/schemas/')) return ref;
    const name = ref.split('/').pop();
    return spec.components.schemas[name] || {};
}

function schemaToExample(schema, spec, depth = 0) {
    if (depth > 5) return '...'; // Prevent infinite loops
    if (!schema) return null;

    if (schema.$ref) {
        const resolved = resolveRef(schema.$ref, spec);
        return schemaToExample(resolved, spec, depth + 1);
    }

    if (schema.type === 'object' || schema.properties) {
        const obj = {};
        if (schema.properties) {
            for (const [key, prop] of Object.entries(schema.properties)) {
                obj[key] = schemaToExample(prop, spec, depth + 1);
            }
        }
        return obj;
    }

    if (schema.type === 'array') {
        const items = schemaToExample(schema.items, spec, depth + 1);
        return [items];
    }

    if (schema.example !== undefined) return schema.example;

    switch (schema.type) {
        case 'string':
            if (schema.format === 'binary') return '<FILE_UPLOAD>';
            if (schema.format === 'date-time') return '2026-03-07T12:00:00Z';
            if (schema.format === 'uuid') return '123e4567-e89b-12d3-a456-426614174000';
            return 'string';
        case 'number':
        case 'integer':
            return 0;
        case 'boolean':
            return true;
        default:
            return null;
    }
}

function formatSchemaBlock(schema, title, spec, contentType = 'application/json') {
    let out = `#### ${title}\n`;
    out += `**Content-Type:** \`${contentType}\`\n\n`;

    // Special handling for multipart
    if (contentType === 'multipart/form-data' && schema) {
        const resolved = schema.$ref ? resolveRef(schema.$ref, spec) : schema;
        out += `> **Note for Frontend:** Use \`FormData\` object in JS. Append fields normally. For files, use \`formData.append('fieldName', fileObject)\`.\n\n`;
        out += `**Form Fields:**\n`;
        if (resolved.properties) {
            for (const [key, prop] of Object.entries(resolved.properties)) {
                const type = prop.type === 'string' && prop.format === 'binary' ? 'FILE' : prop.type || 'string';
                const required = resolved.required && resolved.required.includes(key) ? '(Required)' : '(Optional)';
                out += `- \`${key}\` ${required}: \`${type}\` ${prop.description ? `- ${prop.description}` : ''}\n`;
            }
        }
        out += '\n';
    }

    const example = schemaToExample(schema, spec);
    if (example) {
        out += "```json\n";
        out += JSON.stringify(example, null, 2);
        out += "\n```\n\n";
    }
    return out;
}

async function generateRoleDoc(role) {
    const spec = await fetchSpec(role);
    let md = `# Fully Detailed API Documentation: ${role} Role\n\n`;
    md += `> This documentation is generated specifically for frontend integration, depicting exact JSON structures, data types, and file upload strategies required for the **${role}** role.\n\n`;

    const tags = {};
    for (const [pathUrl, methods] of Object.entries(spec.paths)) {
        for (const [method, details] of Object.entries(methods)) {
            const tagName = (details.tags && details.tags.length > 0) ? details.tags[0] : 'Uncategorized';
            if (!tags[tagName]) tags[tagName] = [];
            tags[tagName].push({ path: pathUrl, method: method.toUpperCase(), details });
        }
    }

    for (const [tag, endpoints] of Object.entries(tags)) {
        md += `## 🚀 ${tag}\n\n---\n\n`;

        for (const ep of endpoints) {
            md += `### ${ep.method} \`${ep.path}\`\n`;
            if (ep.details.summary) md += `**Summary:** ${ep.details.summary}\n`;
            if (ep.details.description) md += `**Description:** ${ep.details.description}\n`;
            md += '\n';

            // Parameters
            if (ep.details.parameters && ep.details.parameters.length > 0) {
                md += `#### Parameters\n`;
                ep.details.parameters.forEach(p => {
                    const req = p.required ? 'Required' : 'Optional';
                    const sType = p.schema ? p.schema.type : 'string';
                    md += `- **${p.name}** (\`${p.in}\` | \`${sType}\` | *${req}*): ${p.description || ''}\n`;
                });
                md += '\n';
            }

            // Request Body
            if (ep.details.requestBody && ep.details.requestBody.content) {
                // application/json
                if (ep.details.requestBody.content['application/json']) {
                    md += formatSchemaBlock(
                        ep.details.requestBody.content['application/json'].schema,
                        'Request Body',
                        spec,
                        'application/json'
                    );
                }
                // multipart/form-data
                if (ep.details.requestBody.content['multipart/form-data']) {
                    md += formatSchemaBlock(
                        ep.details.requestBody.content['multipart/form-data'].schema,
                        'Request Body (File Upload)',
                        spec,
                        'multipart/form-data'
                    );
                }
            }

            // Responses
            md += `#### Responses\n`;
            for (const [statusCode, resDetails] of Object.entries(ep.details.responses)) {
                md += `<details><summary><strong>${statusCode}</strong> - ${resDetails.description || 'Response'}</summary>\n\n`;

                if (resDetails.content && resDetails.content['application/json']) {
                    const example = schemaToExample(resDetails.content['application/json'].schema, spec);
                    if (example) {
                        md += "```json\n";
                        md += JSON.stringify(example, null, 2);
                        md += "\n```\n";
                    } else {
                        md += "*No explicit schema defined.*\n";
                    }
                } else {
                    md += "*No content body returned.*\n";
                }
                md += "\n</details>\n\n";
            }
            md += "---\n\n";
        }
    }

    const outPath = path.join(process.cwd(), `docs/api-by-role/${role}.md`);
    fs.writeFileSync(outPath, md);
    console.log(`Generated detailed docs for ${role} -> ${outPath}`);
}

async function run() {
    for (const role of REQ_ROLES) {
        await generateRoleDoc(role);
    }
}

run().catch(console.error);
