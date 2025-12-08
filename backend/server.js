const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const winston = require('winston');
const Sentry = require('@sentry/node');
const Joi = require('joi');
const path = require('path');
const { AuthService, authLimiter, apiLimiter, authenticate } = require('./auth');
const { pool, redisClient, initDB } = require('./database');
const AIService = require('./ai-service');
const MisinformationAgent = require('./langgraph-agent');

Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV });

const app = express();
const aiService = new AIService();
const agent = new MisinformationAgent();

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({ format: winston.format.simple() })
    ]
});

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.sudrashan.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"]
        }
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
}));

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://sudrashan.com', 'https://app.sudrashan.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..')));

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, { ip: req.ip, userAgent: req.get('user-agent') });
    next();
});

app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        const redisStatus = redisClient.isOpen ? 'connected' : 'disconnected';
        res.status(200).json({ 
            status: 'healthy', 
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            services: { database: 'connected', redis: redisStatus }
        });
    } catch (error) {
        res.status(503).json({ status: 'unhealthy', error: error.message });
    }
});

app.get('/metrics', authenticate, async (req, res) => {
    const result = await pool.query('SELECT COUNT(*) as total_analyses FROM analysis_logs');
    res.json({ totalAnalyses: result.rows[0].total_analyses, uptime: process.uptime() });
});

const analyzeSchema = Joi.object({
    content: Joi.string().required().max(50000),
    type: Joi.string().valid('text', 'image', 'url').default('text'),
    priority: Joi.string().valid('normal', 'high').default('normal'),
    language: Joi.string().optional()
});

app.post('/api/analyze', apiLimiter, authenticate, async (req, res) => {
    try {
        const { error, value } = analyzeSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const startTime = Date.now();
        const result = await agent.analyze(value.content);
        const processingTime = Date.now() - startTime;

        await pool.query(
            'INSERT INTO analysis_logs (user_id, content_hash, verdict, confidence, processing_time, sources) VALUES ($1, $2, $3, $4, $5, $6)',
            [req.user.id, require('crypto').createHash('sha256').update(value.content).digest('hex'), 
             result.verdict, result.confidence, processingTime, JSON.stringify(result.sources)]
        );

        await pool.query(
            'UPDATE users SET daily_usage = daily_usage + 1, monthly_usage = monthly_usage + 1 WHERE id = $1',
            [req.user.id]
        );

        logger.info('Analysis completed', { userId: req.user.id, verdict: result.verdict, processingTime });
        res.json({ ...result, processingTime });
    } catch (error) {
        logger.error('Analysis failed', { error: error.message, userId: req.user?.id });
        Sentry.captureException(error);
        res.status(500).json({ error: 'Analysis failed', message: error.message });
    }
});

app.post('/api/auth/register', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const passwordHash = await AuthService.hashPassword(password);
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, plan) VALUES ($1, $2, $3) RETURNING id, email, plan',
            [email, passwordHash, 'free']
        );

        const token = AuthService.generateToken(result.rows[0]);
        logger.info('User registered', { email });
        res.status(201).json({ token, user: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') return res.status(409).json({ error: 'Email already exists' });
        logger.error('Registration failed', { error: error.message });
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        
        const user = result.rows[0];
        const valid = await AuthService.verifyPassword(password, user.password_hash);
        
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
        
        const token = AuthService.generateToken(user);
        logger.info('User logged in', { email });
        res.json({ token, user: { id: user.id, email: user.email, plan: user.plan } });
    } catch (error) {
        logger.error('Login failed', { error: error.message });
        res.status(500).json({ error: 'Login failed' });
    }
});

app.get('/api/reports/weekly', authenticate, async (req, res) => {
    if (req.user.plan === 'free') return res.status(403).json({ error: 'Upgrade to Operator plan' });
    
    const result = await pool.query(
        `SELECT verdict, COUNT(*) as count, AVG(confidence) as avg_confidence 
         FROM analysis_logs WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days' 
         GROUP BY verdict`,
        [req.user.id]
    );
    
    res.json({ period: '7 days', statistics: result.rows, generatedAt: new Date().toISOString() });
});

app.use(Sentry.Handlers.errorHandler());
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await initDB();
        await redisClient.connect();
        logger.info('Database and Redis connected');
        
        app.listen(PORT, () => {
            logger.info(`Sudrashan API server running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Startup failed', { error: error.message });
        process.exit(1);
    }
})();

module.exports = app;