# Sudrashan AI - System Architecture

## Overview
Enterprise-grade misinformation detection platform with agentic AI workflows, multi-model consensus, and real-time processing.

## Architecture Layers

### 1. Presentation Layer
- **Frontend**: Vanilla JS with Three.js
- **UI Components**: Glass morphism, cyber theme
- **Real-time Updates**: WebSocket connections
- **Responsive Design**: Mobile-first approach

### 2. API Gateway Layer
- **Express.js**: RESTful API server
- **Rate Limiting**: Plan-based throttling
- **Authentication**: JWT + API keys
- **Security**: Helmet.js, CORS, input validation

### 3. Business Logic Layer
- **LangGraph Agent**: Agentic AI orchestration
- **Multi-AI Consensus**: GPT-4, Gemini, Perplexity
- **Content Classification**: Automated routing
- **Risk Assessment**: Dynamic threat scoring

### 4. Data Layer
- **PostgreSQL**: Primary data store
- **Redis**: Caching and sessions
- **Audit Logs**: Compliance tracking
- **Analytics**: Time-series data

### 5. Integration Layer
- **News API**: 70,000+ sources
- **AI Services**: OpenAI, Google, Perplexity
- **Payment**: Stripe, Razorpay, UPI
- **Monitoring**: Sentry, Prometheus

## Data Flow

```
User Request → API Gateway → Authentication → Rate Limiting
    ↓
LangGraph Agent → Content Classification → Risk Assessment
    ↓
Parallel AI Analysis (GPT-4 + Gemini + Perplexity)
    ↓
Source Verification (News API + Fact-checkers)
    ↓
Consensus Calculation → Response Generation
    ↓
Cache Result → Log Analytics → Return to User
```

## Security Architecture

### Defense in Depth
1. **Network**: WAF, DDoS protection
2. **Application**: Input validation, XSS/CSRF protection
3. **Data**: Encryption at rest and in transit
4. **Access**: RBAC, JWT authentication
5. **Monitoring**: Real-time threat detection

### Compliance
- SOC 2 Type II controls
- GDPR data protection
- ISO 27001 standards
- OWASP Top 10 mitigation

## Scalability

### Horizontal Scaling
- Kubernetes auto-scaling (3-10 pods)
- Load balancer distribution
- Stateless application design

### Database Scaling
- Read replicas for analytics
- Connection pooling (20 max)
- Query optimization with indexes

### Caching Strategy
- Redis for hot data (1 hour TTL)
- Content-based cache keys
- Automatic invalidation

## High Availability

### Redundancy
- Multi-region deployment
- Database replication
- Redis cluster mode

### Failover
- Health check monitoring
- Automatic pod restart
- Circuit breaker pattern

### Backup
- Daily automated backups
- Point-in-time recovery
- Encrypted backup storage

## Performance Optimization

### Response Time
- Target: <2 seconds
- Parallel AI processing
- Efficient database queries
- CDN for static assets

### Throughput
- 10,000+ requests/minute
- Async processing queues
- Connection pooling

## Monitoring & Observability

### Metrics
- Request rate and latency
- Error rates by endpoint
- Database performance
- Cache hit ratio

### Logging
- Structured JSON logs
- Centralized log aggregation
- Log retention: 30 days

### Alerting
- High error rate (>5%)
- Slow response time (>2s)
- Database connection failures
- Memory/CPU thresholds

## Technology Stack

### Backend
- Node.js 18+
- Express.js 4.x
- LangGraph for AI orchestration

### Database
- PostgreSQL 15
- Redis 7

### AI/ML
- OpenAI GPT-4
- Google Gemini Pro
- Perplexity AI
- Groq Llama3

### DevOps
- Docker & Kubernetes
- GitHub Actions CI/CD
- Prometheus & Grafana
- Sentry error tracking

### Security
- Helmet.js
- bcrypt password hashing
- JWT authentication
- Rate limiting
