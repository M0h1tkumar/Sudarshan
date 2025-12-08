# Sudrashan AI - Production Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

### Local Development

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your API keys

# Initialize database
npm run db:migrate

# Start development server
npm run dev
```

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
npm run logs

# Check health
npm run health
```

### Kubernetes Deployment

```bash
# Apply configurations
kubectl apply -f kubernetes/

# Check status
kubectl get pods -l app=sudrashan

# Scale deployment
kubectl scale deployment sudrashan-api --replicas=5
```

## 🔧 Configuration

### Environment Variables

```env
# Core
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:pass@host:5432/sudrashan
REDIS_URL=redis://host:6379

# Security
JWT_SECRET=your-secure-secret-min-32-chars

# AI Services
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
PERPLEXITY_API_KEY=...
GROQ_API_KEY=...

# Data Sources
NEWS_API_KEY=...
TWITTER_BEARER_TOKEN=...

# Monitoring
SENTRY_DSN=https://...
```

## 📊 Monitoring

### Health Checks
- Endpoint: `GET /health`
- Metrics: `GET /metrics` (authenticated)

### Logs
- Location: `./logs/`
- Format: JSON structured logging
- Levels: error, warn, info, debug

## 🔒 Security

### SSL/TLS
```bash
# Generate self-signed certificate (dev only)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem
```

### Rate Limiting
- Auth endpoints: 5 requests/15min
- API endpoints: 100-10000 requests/15min (plan-based)

### API Keys
```bash
# Generate API key (requires authentication)
curl -X POST http://localhost:3000/api/keys \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{"name": "Production Key"}'
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Integration tests
npm run test:integration

# Watch mode
npm run test:watch

# Security audit
npm run security-audit
```

## 📈 Scaling

### Horizontal Scaling
- Kubernetes HPA: Auto-scales 3-10 pods based on CPU/memory
- Load balancer: Nginx or cloud provider LB

### Database Scaling
- Read replicas for analytics queries
- Connection pooling (max 20 connections)
- Redis caching for frequent queries

### Performance Optimization
- Response caching (1 hour TTL)
- Database query optimization
- CDN for static assets

## 🔄 CI/CD

### GitHub Actions
- Automated testing on PR
- Security scanning (Snyk, npm audit)
- Docker image building
- Deployment to staging/production

### Deployment Workflow
1. Push to `develop` → Deploy to staging
2. Push to `main` → Deploy to production
3. Manual approval for production

## 📞 Support

### Monitoring Alerts
- High error rate (>5%)
- Response time >2s
- Database connection failures
- Memory usage >80%

### Incident Response
1. Check `/health` endpoint
2. Review logs in `./logs/`
3. Check Sentry for errors
4. Verify database/Redis connectivity

## 🔐 Compliance

### SOC 2 Requirements
- Audit logs enabled
- Encryption at rest and in transit
- Access control and authentication
- Regular security audits

### GDPR Compliance
- Data encryption
- User data export/deletion
- Privacy by design
- Consent management

## 📝 Maintenance

### Database Backups
```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Log Rotation
- Automatic rotation at 100MB
- Keep 14 days of logs
- Compress old logs

### Updates
```bash
# Update dependencies
npm update

# Security patches
npm audit fix

# Database migrations
npm run db:migrate
```
