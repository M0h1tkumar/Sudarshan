const request = require('supertest');
const app = require('../backend/server');

describe('Sudrashan API Integration Tests', () => {
    let authToken;
    let userId;

    beforeAll(async () => {
        // Register test user
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: `test${Date.now()}@sudrashan.com`,
                password: 'TestPassword123!'
            });
        
        authToken = response.body.token;
        userId = response.body.user.id;
    });

    describe('Authentication', () => {
        test('should register new user', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: `newuser${Date.now()}@sudrashan.com`,
                    password: 'SecurePass123!'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('email');
        });

        test('should login existing user', async () => {
            const email = `login${Date.now()}@sudrashan.com`;
            
            await request(app)
                .post('/api/auth/register')
                .send({ email, password: 'Password123!' });

            const response = await request(app)
                .post('/api/auth/login')
                .send({ email, password: 'Password123!' });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
        });

        test('should reject invalid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@sudrashan.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
        });
    });

    describe('Content Analysis', () => {
        test('should analyze text content', async () => {
            const response = await request(app)
                .post('/api/analyze')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    content: 'Breaking: Scientists discover cure for all diseases',
                    type: 'text'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('verdict');
            expect(response.body).toHaveProperty('confidence');
            expect(response.body).toHaveProperty('processingTime');
        });

        test('should reject unauthorized requests', async () => {
            const response = await request(app)
                .post('/api/analyze')
                .send({
                    content: 'Test content',
                    type: 'text'
                });

            expect(response.status).toBe(401);
        });

        test('should validate input', async () => {
            const response = await request(app)
                .post('/api/analyze')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    content: '',
                    type: 'text'
                });

            expect(response.status).toBe(400);
        });
    });

    describe('Health Check', () => {
        test('should return healthy status', async () => {
            const response = await request(app).get('/health');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('healthy');
            expect(response.body).toHaveProperty('timestamp');
        });
    });

    describe('Reports', () => {
        test('should generate weekly report for pro users', async () => {
            // Upgrade to pro plan
            await request(app)
                .post('/api/subscription/upgrade')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ plan: 'pro' });

            const response = await request(app)
                .get('/api/reports/weekly')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('statistics');
        });
    });
});
