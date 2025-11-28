// Example API Keys Configuration for Sudrashan Misinformation Detection System
// Copy this file to api-keys.js and replace with your actual API keys

const API_KEYS = {
    // Twitter API
    TWITTER: {
        BEARER_TOKEN: 'your-twitter-bearer-token-here',
        ACCESS_TOKEN: 'your-twitter-access-token-here',
        ACCESS_TOKEN_SECRET: 'your-twitter-access-token-secret-here',
        API_KEY: 'your-twitter-api-key-here'
    },

    // OpenAI API
    OPENAI: {
        API_KEY: 'your-openai-api-key-here',
        MODEL: 'gpt-4-turbo'
    },

    // Google Gemini API
    GOOGLE: {
        API_KEY: 'your-google-gemini-api-key-here',
        PROJECT_ID: 'your-google-project-id-here'
    },

    // Perplexity API
    PERPLEXITY: {
        API_KEY: 'your-perplexity-api-key-here'
    },

    // Groq API
    GROQ: {
        API_KEY: 'your-groq-api-key-here',
        MODELS: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768']
    },

    // News API
    NEWS_API: {
        API_KEY: 'your-news-api-key-here'
    },

    // PostgreSQL Database (Optional)
    DATABASE: {
        HOST: 'localhost',
        PORT: 5432,
        DATABASE: 'sudrashan_db',
        USERNAME: 'postgres',
        PASSWORD: 'your-db-password-here'
    },

    // N8N Configuration
    N8N: {
        WEBHOOK_URL: 'https://your-n8n-instance.com/webhook/your-webhook-id',
        API_KEY: 'your-n8n-api-key-here'
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_KEYS;
}