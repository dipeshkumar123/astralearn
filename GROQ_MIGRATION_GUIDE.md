# Migration Guide: OpenRouter/OpenAI → Groq API

This document outlines the migration of AstraLearn's AI functionality from OpenRouter and OpenAI to Groq API.

## ✅ Migration Complete

The following changes have been implemented:

### 1. **Updated API Key Management**
- **Removed**: OpenRouter and OpenAI API key validation
- **Updated**: `apiKeyManager.js` now only manages Groq API keys
- **Format**: Groq API keys follow the pattern `gsk_[52 characters]`

### 2. **Updated AI Service**
- **Main Service**: `aiService.js` already configured to use Groq
- **Groq Integration**: `groqService.js` handles all Groq API communications
- **Removed**: OpenRouter service files (`openRouterService.js`, `openrouter.js`)

### 3. **Environment Configuration**
- **Required**: `GROQ_API_KEY` environment variable
- **Removed**: OpenRouter and OpenAI environment variables
- **File**: Updated `.env.example` with Groq setup instructions

## 🚀 Setup Instructions

### Step 1: Get Your Groq API Key
1. Visit [Groq Console](https://console.groq.com/keys)
2. Sign up or sign in to your account
3. Click "Create API Key"
4. Copy your API key (starts with `gsk_`)

### Step 2: Configure Environment
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update your `.env` file:
   ```bash
   GROQ_API_KEY=gsk_your_actual_groq_api_key_here
   ```

### Step 3: Verify Installation
1. Start the server:
   ```bash
   npm run dev
   ```

2. Test the AI health endpoint:
   ```bash
   curl http://localhost:5000/api/ai/health
   ```

## 🔧 Technical Details

### Available Models
The system uses Groq's fast inference with these models:
- **Default**: `llama-3.3-70b-versatile` (Primary model)
- **Alternative**: `mixtral-8x7b-32768` (For specific use cases)
- **Fast**: `llama-3.1-8b-instant` (For quick responses)

### API Endpoints Unchanged
All existing AI endpoints continue to work:
- `POST /api/ai/chat` - Context-aware chat
- `POST /api/ai/explain` - Concept explanations
- `POST /api/ai/feedback` - Assignment feedback
- `POST /api/ai/debug` - Debugging help
- `GET /api/ai/health` - Service health check

### Performance Benefits
- **Speed**: Groq provides much faster inference times
- **Cost**: Generally more cost-effective than OpenAI
- **Reliability**: Strong uptime and consistent performance
- **Models**: Access to latest Llama and Mixtral models

## 🧪 Testing

### Health Check
```bash
curl -X GET http://localhost:5000/api/ai/health
```

Expected response:
```json
{
  "status": "operational",
  "readiness": {
    "ready": true,
    "services": {
      "groq": {
        "configured": true,
        "valid": true
      }
    }
  }
}
```

### Chat Test
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Hello, can you help me with JavaScript?",
    "context": {
      "user": {"user_name": "Test User"},
      "course": {"course_title": "JavaScript Basics"}
    }
  }'
```

## 🔒 Security Notes

### API Key Security
- Store API keys in environment variables only
- Never commit API keys to version control
- Use different keys for development and production
- Monitor API usage on Groq Console

### Rate Limiting
- Groq has generous rate limits
- Built-in retry logic handles temporary failures
- Fallback responses when API is unavailable

## 📊 Monitoring

### Service Health
The AI service provides comprehensive health monitoring:
- API key validation
- Connection testing
- Model availability
- Response time tracking

### Error Handling
- Graceful degradation when API is unavailable
- Contextual fallback responses
- Detailed error logging
- Automatic retry mechanisms

## 🆘 Troubleshooting

### Common Issues

1. **"Groq API key not configured"**
   - Check your `.env` file has `GROQ_API_KEY`
   - Verify the key format starts with `gsk_`
   - Restart the server after updating environment

2. **"Invalid Groq API key"**
   - Verify the key is copied correctly
   - Check the key hasn't expired on Groq Console
   - Generate a new key if needed

3. **"AI services not ready"**
   - Check network connectivity
   - Verify Groq service status
   - Review server logs for detailed errors

### Debug Commands
```bash
# Check environment variables
node -e "console.log(process.env.GROQ_API_KEY?.substring(0,8) + '...')"

# Test AI service directly
curl http://localhost:5000/api/ai/test -H "Authorization: Bearer YOUR_TOKEN"

# View detailed health
curl http://localhost:5000/api/ai/health | jq
```

## 📈 Benefits of Migration

### Performance
- **Inference Speed**: 10x faster than previous providers
- **Lower Latency**: Reduced response times
- **Better Uptime**: More reliable service

### Cost Efficiency
- **Competitive Pricing**: Better cost per token
- **Free Tier**: Generous free usage limits
- **Transparent Billing**: Clear usage tracking

### Developer Experience
- **OpenAI Compatible**: Familiar API interface
- **Better Documentation**: Comprehensive guides
- **Active Support**: Responsive community

---

**Migration Status**: ✅ Complete
**Next Steps**: Configure your Groq API key and test the endpoints
**Support**: Check the troubleshooting section or review server logs
