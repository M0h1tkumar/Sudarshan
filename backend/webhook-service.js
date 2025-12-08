const crypto = require('crypto');

class WebhookService {
    static async sendWebhook(url, data, secret = null) {
        try {
            const payload = JSON.stringify(data);
            const headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'Sudrashan-Webhook/2.0'
            };

            if (secret) {
                const signature = crypto
                    .createHmac('sha256', secret)
                    .update(payload)
                    .digest('hex');
                headers['X-Sudrashan-Signature'] = signature;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: payload
            });

            return { success: response.ok, status: response.status };
        } catch (error) {
            console.error('Webhook delivery failed:', error);
            return { success: false, error: error.message };
        }
    }

    static async notifyHighRiskDetection(userId, analysis) {
        if (analysis.riskLevel === 'high' && analysis.confidence > 80) {
            return this.sendWebhook(process.env.ALERT_WEBHOOK_URL, {
                event: 'high_risk_detection',
                userId,
                analysis,
                timestamp: new Date().toISOString()
            });
        }
    }
}

module.exports = WebhookService;
