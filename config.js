// N8N Workflow Configuration
const CONFIG = {
    // Replace with your actual N8N instance URL and webhook ID
    N8N_WEBHOOK_URL: 'https://your-n8n-instance.com/webhook/ba331500-5b03-4b13-b8af-b2ef67f0a453',
    
    // Twitter API Configuration
    TWITTER_CONFIG: {
        BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN || 'your-twitter-bearer-token',
        ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN || 'your-twitter-access-token',
        ACCESS_TOKEN_SECRET: process.env.TWITTER_ACCESS_TOKEN_SECRET || 'your-twitter-access-token-secret',
        API_KEY: process.env.TWITTER_API_KEY || 'your-twitter-api-key'
    },
    
    // Workflow settings
    TIMEOUT: 30000,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    
    // Demo mode (set to false when N8N is configured)
    DEMO_MODE: false,
    
    // API Keys
    API_KEYS: {
        GEMINI: {
            API_KEY: process.env.GEMINI_API_KEY || 'your-gemini-api-key',
            PROJECT_ID: process.env.GOOGLE_PROJECT_ID || 'your-google-project-id',
            PROJECT_NUMBER: process.env.GOOGLE_PROJECT_NUMBER || 'your-google-project-number'
        },
        OPENAI: process.env.OPENAI_API_KEY || 'your-openai-api-key',
        PERPLEXITY: process.env.PERPLEXITY_API_KEY || 'your-perplexity-api-key',
        GROQ: process.env.GROQ_API_KEY || 'your-groq-api-key',
        NEWS_API: process.env.NEWS_API_KEY || 'your-news-api-key'
    },
    
    // Best Credible Verifiers
    CREDIBLE_SOURCES: {
        NEWS_API: 'news-api-key-for-credible-sources',
        GOOGLE_FACT_CHECK: 'google-fact-check-api-key',
        REUTERS: 'reuters-api-key',
        AP_NEWS: 'ap-news-api-key',
        BBC_API: 'bbc-api-key',
        GOOGLE_TRANSLATE: process.env.GOOGLE_TRANSLATE_API_KEY || 'your-google-translate-api-key'
    },
    
    // Translation Support
    TRANSLATION: {
        ENABLED: true,
        DEFAULT_LANGUAGE: 'en',
        SUPPORTED_LANGUAGES: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi']
    }
};

// Twitter API Direct Integration
const TWITTER_API_BASE = 'https://api.twitter.com/2';

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}