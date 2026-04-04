import db from '../../models/index.js';

const SiteStaticContent = db.SiteStaticContent;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const normalizeSlug = (slug) => String(slug || '').trim().toLowerCase();

const assertSlug = (slug) => {
    const s = normalizeSlug(slug);
    if (!s || s.length > 64 || !SLUG_PATTERN.test(s)) {
        throw { statusCode: 400, message: 'Invalid slug. Use lowercase letters, numbers, and hyphens only.' };
    }
    return s;
};

const validatePayload = (content_type, body_html, faq_items, is_published) => {
    if (content_type === 'PAGE' || content_type === 'NEWS') {
        if (is_published && (!body_html || String(body_html).trim() === '')) {
            throw { statusCode: 400, message: `body_html is required for a published ${content_type}.` };
        }
        return;
    }
    if (content_type === 'FAQ') {
        if (!Array.isArray(faq_items) || faq_items.length === 0) {
            throw { statusCode: 400, message: 'faq_items must be a non-empty array for FAQ content.' };
        }
        if (is_published) {
            for (const item of faq_items) {
                if (!item || typeof item.question !== 'string' || !item.question.trim()) {
                    throw { statusCode: 400, message: 'Each FAQ item must have a question.' };
                }
                if (typeof item.answer !== 'string' || !item.answer.trim()) {
                    throw { statusCode: 400, message: 'Each FAQ item must have an answer.' };
                }
            }
        }
        return;
    }
    throw { statusCode: 400, message: 'content_type must be PAGE, FAQ or NEWS.' };
};

const mapFaqItems = (items) => {
    if (!Array.isArray(items)) return null;
    return items.map((item, index) => ({
        question: String(item.question || '').trim(),
        answer: String(item.answer || '').trim(),
        sort_order: typeof item.sort_order === 'number' ? item.sort_order : index
    }));
};

const toPublicRow = (row) => {
    if (!row) return null;
    const out = {
        id: row.id,
        slug: row.slug,
        title: row.title,
        content_type: row.content_type,
        body_html: row.body_html,
        thumbnail_url: row.thumbnail_url,
        faq_items: row.faq_items,
        published_at: row.published_at,
        updated_at: row.updated_at
    };
    return out;
};

const toAdminRow = (row) => {
    if (!row) return null;
    return {
        ...toPublicRow(row),
        is_published: row.is_published,
        updated_by: row.updated_by,
        created_at: row.created_at
    };
};

/**
 * @param {{ forAdmin?: boolean }} opts
 */
export const list = async (opts = {}) => {
    const { forAdmin = false } = opts;
    const where = forAdmin ? {} : { is_published: true };
    const rows = await SiteStaticContent.findAll({
        where,
        attributes: ['id', 'slug', 'title', 'content_type', 'is_published', 'thumbnail_url', 'published_at', 'updated_at'],
        order: [['published_at', 'DESC'], ['slug', 'ASC']]
    });
    return rows.map((r) => {
        const base = {
            id: r.id,
            slug: r.slug,
            title: r.title,
            content_type: r.content_type,
            thumbnail_url: r.thumbnail_url,
            published_at: r.published_at,
            updated_at: r.updated_at
        };
        if (forAdmin) base.is_published = r.is_published;
        return base;
    });
};

/**
 * @param {string} slug
 * @param {{ forAdmin?: boolean }} opts
 */
export const getBySlug = async (slug, opts = {}) => {
    const { forAdmin = false } = opts;
    const s = assertSlug(slug);
    const row = await SiteStaticContent.findOne({ where: { slug: s } });
    if (!row) return null;
    if (!forAdmin && !row.is_published) return null;
    return forAdmin ? toAdminRow(row) : toPublicRow(row);
};

export const create = async (payload, userId) => {
    const slug = assertSlug(payload.slug);
    const existing = await SiteStaticContent.findOne({ where: { slug } });
    if (existing) {
        throw { statusCode: 409, message: `Content with slug "${slug}" already exists. Use PUT to update.` };
    }

    const content_type = payload.content_type;
    const is_published = payload.is_published !== false;
    const body_html = payload.body_html != null ? String(payload.body_html) : null;
    const faq_items = content_type === 'FAQ' ? mapFaqItems(payload.faq_items) : null;

    validatePayload(content_type, body_html, faq_items, is_published);

    const row = await SiteStaticContent.create({
        slug,
        title: String(payload.title).trim(),
        content_type,
        body_html: (content_type === 'PAGE' || content_type === 'NEWS') ? body_html : null,
        thumbnail_url: payload.thumbnail_url || null,
        faq_items: content_type === 'FAQ' ? faq_items : null,
        is_published,
        published_at: payload.published_at || (is_published ? new Date() : null),
        updated_by: userId || null
    });

    return toAdminRow(row);
};

export const updateBySlug = async (slug, payload, userId) => {
    const s = assertSlug(slug);
    const row = await SiteStaticContent.findOne({ where: { slug: s } });
    if (!row) {
        throw { statusCode: 404, message: 'Static content not found.' };
    }

    const content_type = payload.content_type ?? row.content_type;
    const is_published = payload.is_published !== undefined ? payload.is_published : row.is_published;
    const body_html = payload.body_html !== undefined ? (payload.body_html != null ? String(payload.body_html) : null) : row.body_html;
    const faq_items =
        payload.faq_items !== undefined
            ? content_type === 'FAQ'
                ? mapFaqItems(payload.faq_items)
                : null
            : row.faq_items;

    validatePayload(content_type, body_html, faq_items, is_published);

    await row.update({
        title: payload.title !== undefined ? String(payload.title).trim() : row.title,
        content_type,
        body_html: (content_type === 'PAGE' || content_type === 'NEWS') ? body_html : null,
        faq_items: content_type === 'FAQ' ? faq_items : null,
        thumbnail_url: payload.thumbnail_url !== undefined ? payload.thumbnail_url : row.thumbnail_url,
        is_published,
        published_at: payload.published_at || (is_published ? new Date() : null),
        updated_by: userId || null
    });

    return toAdminRow(row);
};

export const removeBySlug = async (slug) => {
    const s = assertSlug(slug);
    const row = await SiteStaticContent.findOne({ where: { slug: s } });
    if (!row) {
        throw { statusCode: 404, message: 'Static content not found.' };
    }
    await row.destroy();
    return true;
};
