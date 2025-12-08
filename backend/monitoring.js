const winston = require('winston');
const { pool } = require('./database');

class MonitoringService {
    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ filename: 'logs/monitoring.log' })
            ]
        });
    }

    async trackMetric(metric, value, metadata = {}) {
        this.logger.info('Metric tracked', { metric, value, metadata, timestamp: new Date() });
    }

    async getSystemHealth() {
        try {
            const dbHealth = await pool.query('SELECT NOW()');
            const uptime = process.uptime();
            const memory = process.memoryUsage();

            return {
                status: 'healthy',
                database: 'connected',
                uptime: Math.floor(uptime),
                memory: {
                    heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
                    heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
                    rss: Math.round(memory.rss / 1024 / 1024)
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    }

    async getAnalyticsReport(userId, days = 7) {
        const result = await pool.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as total_scans,
                AVG(confidence) as avg_confidence,
                verdict,
                COUNT(*) FILTER (WHERE verdict = 'FALSE') as misinformation_detected
            FROM analysis_logs
            WHERE user_id = $1 AND created_at > NOW() - INTERVAL '${days} days'
            GROUP BY DATE(created_at), verdict
            ORDER BY date DESC
        `, [userId]);

        return result.rows;
    }

    async getThreatIntelligence() {
        const result = await pool.query(`
            SELECT 
                verdict,
                COUNT(*) as count,
                AVG(confidence) as avg_confidence
            FROM analysis_logs
            WHERE created_at > NOW() - INTERVAL '24 hours'
            GROUP BY verdict
        `);

        return {
            last24Hours: result.rows,
            generatedAt: new Date().toISOString()
        };
    }
}

module.exports = MonitoringService;
