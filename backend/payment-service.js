const { pool } = require('./database');

class PaymentService {
    static async createSubscription(userId, plan) {
        const planConfig = {
            free: { dailyLimit: 10, monthlyLimit: 300, price: 0 },
            pro: { dailyLimit: 1000, monthlyLimit: 30000, price: 4099 },
            enterprise: { dailyLimit: 100000, monthlyLimit: 3000000, price: 'custom' }
        };

        const config = planConfig[plan];
        if (!config) throw new Error('Invalid plan');

        await pool.query(
            'UPDATE users SET plan = $1, daily_limit = $2, monthly_limit = $3 WHERE id = $4',
            [plan, config.dailyLimit, config.monthlyLimit, userId]
        );

        return { success: true, plan, config };
    }

    static async verifyUPIPayment(transactionId, amount) {
        // Integration with UPI payment gateway
        // This would verify the payment with actual payment provider
        return { verified: true, transactionId, amount };
    }

    static async handleWebhook(provider, payload) {
        // Handle payment webhooks from Stripe, Razorpay, etc.
        if (provider === 'stripe') {
            return this.handleStripeWebhook(payload);
        } else if (provider === 'razorpay') {
            return this.handleRazorpayWebhook(payload);
        }
    }

    static async handleStripeWebhook(payload) {
        // Stripe webhook handling
        const { type, data } = payload;
        
        if (type === 'checkout.session.completed') {
            const userId = data.object.client_reference_id;
            const plan = data.object.metadata.plan;
            await this.createSubscription(userId, plan);
        }

        return { received: true };
    }

    static async handleRazorpayWebhook(payload) {
        // Razorpay webhook handling for Indian market
        const { event, payload: data } = payload;
        
        if (event === 'payment.captured') {
            const userId = data.payment.entity.notes.user_id;
            const plan = data.payment.entity.notes.plan;
            await this.createSubscription(userId, plan);
        }

        return { received: true };
    }

    static async getUsageStats(userId) {
        const result = await pool.query(
            'SELECT daily_usage, monthly_usage, daily_limit, monthly_limit, plan FROM users WHERE id = $1',
            [userId]
        );

        const user = result.rows[0];
        return {
            daily: { used: user.daily_usage, limit: user.daily_limit },
            monthly: { used: user.monthly_usage, limit: user.monthly_limit },
            plan: user.plan
        };
    }
}

module.exports = PaymentService;
