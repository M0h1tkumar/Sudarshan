# Sudrashan API Keys Setup Instructions

## Required API Keys

### 1. OpenAI API Key (GPT-4)
- Go to: https://platform.openai.com/api-keys
- Create new API key
- Replace `sk-proj-demo-key-replace-with-actual-openai-key` in `api-keys.js`

### 2. Google Gemini API Key
- Go to: https://makersuite.google.com/app/apikey
- Create new API key
- Replace `AIzaSyDemo-Replace-With-Actual-Gemini-API-Key` in `api-keys.js`

### 3. Perplexity API Key
- Go to: https://www.perplexity.ai/settings/api
- Generate API key
- Replace `pplx-demo-key-replace-with-actual-perplexity-key` in `api-keys.js`

### 4. Twitter API (Already Configured)
✅ Bearer Token: Already added
✅ Access Token: Already added

## Setup Steps

1. **Get API Keys**: Obtain all required API keys from the providers above
2. **Update api-keys.js**: Replace demo keys with actual keys
3. **Configure N8N**: Set up N8N instance and update webhook URL in `config.js`
4. **Set Demo Mode**: Change `DEMO_MODE: false` in `config.js` when ready
5. **Test**: Upload text/images to test the misinformation detection workflow

## Files to Update
- `api-keys.js` - Add your actual API keys
- `config.js` - Update N8N webhook URL and set demo mode
- N8N workflow - Import the JSON file and configure credentials

## Security Note
Never commit actual API keys to version control. Use environment variables in production.