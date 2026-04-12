import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import logger from '../utils/logger.js';

/**
 * Distributed token denylist for revoked access tokens (logout).
 * Set REDIS_URL in production when running multiple app instances; otherwise an in-memory Set is used (single-node).
 */
const memoryBlacklist = new Set();

let redisPromise = null;

const sha256 = (token) => crypto.createHash('sha256').update(token).digest('hex');

const redisKey = (token) => `gr-class:token-bl:${sha256(token)}`;

async function getRedis() {
    const url = process.env.REDIS_URL;
    if (!url) return null;

    if (!redisPromise) {
        redisPromise = (async () => {
            try {
                const client = createClient({ url });
                client.on('error', (err) => {
                    logger.error('[tokenBlacklist] Redis error', { message: err.message });
                });
                await client.connect();
                logger.info('[tokenBlacklist] Redis connected for token denylist');
                return client;
            } catch (e) {
                logger.warn('[tokenBlacklist] Redis unavailable; falling back to in-memory denylist', {
                    message: e.message,
                });
                return null;
            }
        })();
    }
    return redisPromise;
}

/**
 * TTL (seconds) for a blacklisted token — matches remaining JWT lifetime when possible.
 */
function blacklistTtlSeconds(token) {
    try {
        const decoded = jwt.decode(token);
        if (decoded && typeof decoded.exp === 'number') {
            const left = decoded.exp - Math.floor(Date.now() / 1000);
            return Math.max(1, Math.min(left, 86400 * 7));
        }
    } catch {
        /* ignore */
    }
    return 15 * 60;
}

/**
 * @param {string} token — access JWT
 */
export async function blacklistToken(token) {
    if (!token || typeof token !== 'string') return;

    const client = await getRedis();
    if (client) {
        try {
            await client.set(redisKey(token), '1', { EX: blacklistTtlSeconds(token) });
            return;
        } catch (e) {
            logger.warn('[tokenBlacklist] Redis SET failed; using memory', { message: e.message });
        }
    }
    memoryBlacklist.add(token);
}

/**
 * @param {string} token — access JWT
 * @returns {Promise<boolean>}
 */
export async function isTokenBlacklisted(token) {
    if (!token || typeof token !== 'string') return false;

    const client = await getRedis();
    if (client) {
        try {
            const v = await client.get(redisKey(token));
            if (v === '1') return true;
        } catch (e) {
            logger.warn('[tokenBlacklist] Redis GET failed; checking memory', { message: e.message });
        }
    }
    return memoryBlacklist.has(token);
}
