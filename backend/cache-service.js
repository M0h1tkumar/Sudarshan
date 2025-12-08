const { redisClient } = require('./database');
const crypto = require('crypto');

class CacheService {
    static generateKey(content) {
        return `analysis:${crypto.createHash('sha256').update(content).digest('hex')}`;
    }

    static async get(content) {
        try {
            const key = this.generateKey(content);
            const cached = await redisClient.get(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    static async set(content, result, ttl = 3600) {
        try {
            const key = this.generateKey(content);
            await redisClient.setEx(key, ttl, JSON.stringify(result));
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    static async invalidate(content) {
        try {
            const key = this.generateKey(content);
            await redisClient.del(key);
        } catch (error) {
            console.error('Cache invalidate error:', error);
        }
    }

    static async getUserCache(userId, key) {
        try {
            const cacheKey = `user:${userId}:${key}`;
            const cached = await redisClient.get(cacheKey);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            return null;
        }
    }

    static async setUserCache(userId, key, data, ttl = 3600) {
        try {
            const cacheKey = `user:${userId}:${key}`;
            await redisClient.setEx(cacheKey, ttl, JSON.stringify(data));
        } catch (error) {
            console.error('User cache set error:', error);
        }
    }
}

module.exports = CacheService;
