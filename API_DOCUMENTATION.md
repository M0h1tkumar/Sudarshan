# Sudrashan AI - API Documentation

## Base URL
```
Production: https://api.sudrashan.com/v1
Staging: https://staging-api.sudrashan.com/v1
Development: http://localhost:3000
```

## Authentication

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response 201:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "plan": "free"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "plan": "pro"
  }
}
```

## Content Analysis

### Analyze Text
```http
POST /api/analyze
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "content": "Breaking news: Scientists discover cure for all diseases",
  "type": "text",
  "priority": "normal",
  "language": "en"
}

Response 200:
{
  "verdict": "FALSE",
  "confidence": 92,
  "contentType": "health",
  "riskLevel": "high",
  "sources": [
    {
      "title": "No such discovery announced",
      "source": "Reuters",
      "url": "https://...",
      "relevance": 95
    }
  ],
  "processingTime": 2340,
  "timestamp": "2024-01-15T10:30:00Z",
  "modelCount": 3,
  "report": {
    "verdict": "FALSE",
    "confidence": 92,
    "processingPath": ["classify_content", "assess_risk", "parallel_analysis", "source_verification", "calculate_consensus", "generate_report"]
  }
}
```

### Analyze Image
```http
POST /api/analyze
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "content": "https://example.com/image.jpg",
  "type": "image"
}

Response 200:
{
  "verdict": "MANIPULATED",
  "confidence": 87,
  "analysis": {
    "deepfake": false,
    "edited": true,
    "indicators": ["color adjustment", "object removal"]
  },
  "extractedText": "Text found in image...",
  "processingTime": 3200
}
```

## Reports

### Weekly Intelligence Report
```http
GET /api/reports/weekly
Authorization: Bearer YOUR_TOKEN

Response 200:
{
  "period": "7 days",
  "statistics": [
    {
      "verdict": "FALSE",
      "count": 45,
      "avg_confidence": 88.5
    },
    {
      "verdict": "TRUE",
      "count": 120,
      "avg_confidence": 92.3
    }
  ],
  "generatedAt": "2024-01-15T10:30:00Z"
}
```

### Usage Statistics
```http
GET /api/usage
Authorization: Bearer YOUR_TOKEN

Response 200:
{
  "daily": {
    "used": 45,
    "limit": 1000
  },
  "monthly": {
    "used": 1250,
    "limit": 30000
  },
  "plan": "pro"
}
```

## API Keys

### Create API Key
```http
POST /api/keys
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Production API Key"
}

Response 201:
{
  "key": "sk_a1b2c3d4e5f6...",
  "name": "Production API Key",
  "created": "2024-01-15T10:30:00Z"
}
```

### List API Keys
```http
GET /api/keys
Authorization: Bearer YOUR_TOKEN

Response 200:
{
  "keys": [
    {
      "id": 1,
      "name": "Production API Key",
      "lastUsed": "2024-01-15T09:00:00Z",
      "usageCount": 1523,
      "isActive": true
    }
  ]
}
```

## Health & Monitoring

### Health Check
```http
GET /health

Response 200:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "2.0.0",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### Metrics (Authenticated)
```http
GET /metrics
Authorization: Bearer YOUR_TOKEN

Response 200:
{
  "totalAnalyses": 125430,
  "uptime": 864000
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": "Content is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Upgrade to Operator plan to access this feature"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded. Upgrade your plan for higher limits."
}
```

### 500 Internal Server Error
```json
{
  "error": "Analysis failed",
  "message": "Service temporarily unavailable"
}
```

## Rate Limits

| Plan | Requests/15min | Daily Scans |
|------|----------------|-------------|
| Free | 100 | 10 |
| Pro | 1,000 | 1,000 |
| Enterprise | 10,000 | Unlimited |

## Webhooks

### Configure Webhook
```http
POST /api/webhooks
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["high_risk_detection", "analysis_complete"],
  "secret": "your-webhook-secret"
}
```

### Webhook Payload
```json
{
  "event": "high_risk_detection",
  "userId": 123,
  "analysis": {
    "verdict": "FALSE",
    "confidence": 95,
    "riskLevel": "high"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## SDKs

### Node.js
```javascript
const Sudrashan = require('@sudrashan/sdk');

const client = new Sudrashan('YOUR_API_KEY');

const result = await client.analyze({
  content: 'Text to analyze',
  type: 'text'
});

console.log(result.verdict, result.confidence);
```

### Python
```python
from sudrashan import Client

client = Client('YOUR_API_KEY')

result = client.analyze(
    content='Text to analyze',
    type='text'
)

print(result.verdict, result.confidence)
```

### cURL
```bash
curl -X POST https://api.sudrashan.com/v1/api/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Text to analyze",
    "type": "text"
  }'
```

## Support

- Documentation: https://docs.sudrashan.com
- API Status: https://status.sudrashan.com
- Support: support@sudrashan.com
- Enterprise: enterprise@sudrashan.com
