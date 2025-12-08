# Sudrashan AI - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/M0h1tkumar/Sudarshan.git
cd Sudarshan
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
OPENAI_API_KEY=sk-your-key-here
GEMINI_API_KEY=your-key-here
NEWS_API_KEY=your-key-here
JWT_SECRET=your-secure-secret-min-32-chars
```

### Step 4: Initialize Database
```bash
npm run db:migrate
```

### Step 5: Start Server
```bash
npm run dev
```

Visit: http://localhost:3000

## 🐳 Docker Quick Start

```bash
docker-compose up -d
```

That's it! Server running on http://localhost:3000

## 📝 First API Call

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'
```

### Analyze Content
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Breaking news text here","type":"text"}'
```

## 🧪 Run Tests
```bash
npm test
```

## 📚 Next Steps

- Read [API Documentation](API_DOCUMENTATION.md)
- Review [Architecture](ARCHITECTURE.md)
- Check [Deployment Guide](DEPLOYMENT.md)
- Explore [Performance Tips](PERFORMANCE.md)

## 🆘 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
docker-compose ps

# Restart services
docker-compose restart
```

### Redis Connection Error
```bash
# Check Redis status
docker-compose logs redis
```

### Port Already in Use
```bash
# Change PORT in .env
PORT=3001
```

## 🔑 Get API Keys

- OpenAI: https://platform.openai.com/api-keys
- Gemini: https://makersuite.google.com/app/apikey
- News API: https://newsapi.org/register
- Perplexity: https://www.perplexity.ai/settings/api

## 💬 Support

- Issues: https://github.com/M0h1tkumar/Sudarshan/issues
- Email: support@sudrashan.com
- Docs: https://docs.sudrashan.com
