const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { pool } = require('./database');

class AuthService {
    static generateToken(user) {
        return jwt.sign(
            { id: user.id, email: user.email, plan: user.plan },
            process.env.JWT_SECRET || 'dev-secret-change-in-production',
            { expiresIn: '24h', issuer: 'sudrashan.com', algorithm: 'HS256' }
        );
    }

    static verifyToken(token) {
        return jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-in-production');
    }

    static async hashPassword(password) {
        if (password.length < 8) throw new Error('Password must be at least 8 characters');
        return bcrypt.hash(password, 12);
    }

    static async verifyPassword(password, hash) {
        return bcrypt.compare(password, hash);
    }

    static async createAPIKey(userId, name) {
        const key = `sk_${require('crypto').randomBytes(32).toString('hex')}`;
        const keyHash = await bcrypt.hash(key, 10);
        await pool.query(
            'INSERT INTO api_keys (user_id, key_hash, name) VALUES ($1, $2, $3)',
            [userId, keyHash, name]
        );
        return key;
    }

    static async validateAPIKey(key) {
        const result = await pool.query('SELECT * FROM api_keys WHERE is_active = true');
        for (const row of result.rows) {
            if (await bcrypt.compare(key, row.key_hash)) {
                await pool.query(
                    'UPDATE api_keys SET last_used = NOW(), usage_count = usage_count + 1 WHERE id = $1',
                    [row.id]
                );
                return row.user_id;
            }
        }
        return null;
    }
}

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many authentication attempts. Try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: async (req) => {
        if (req.user?.plan === 'enterprise') return 10000;
        if (req.user?.plan === 'pro') return 1000;
        return 100;
    },
    message: { error: 'Rate limit exceeded. Upgrade your plan for higher limits.' },
    keyGenerator: (req) => req.user?.id || req.ip
});

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No authorization header' });

        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        
        if (token.startsWith('sk_')) {
            const userId = await AuthService.validateAPIKey(token);
            if (!userId) return res.status(401).json({ error: 'Invalid API key' });
            const result = await pool.query('SELECT id, email, plan FROM users WHERE id = $1', [userId]);
            req.user = result.rows[0];
        } else {
            const decoded = AuthService.verifyToken(token);
            req.user = decoded;
        }
        
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = { AuthService, authLimiter, apiLimiter, authenticate };