# VAPI MCP Setup Guide

This guide will help you set up VAPI (Voice AI Platform) with Model Context Protocol (MCP) integration for your Retrospxt Holdings website.

## 🎯 What is VAPI MCP?

VAPI MCP combines:
- **VAPI**: A powerful voice AI platform for phone calls and voice interactions
- **MCP**: Model Context Protocol for seamless AI model integration
- **Voice Agents**: AI assistants that can handle phone calls, web voice chats, and customer interactions

## 📋 Prerequisites

1. **VAPI Account**: Sign up at [https://dashboard.vapi.ai/](https://dashboard.vapi.ai/)
2. **Node.js**: Version 16 or higher
3. **OpenAI API Key**: For AI model integration
4. **Phone Number**: For testing voice calls (optional)

## 🚀 Quick Setup

### 1. Get Your VAPI API Keys

1. Go to [VAPI Dashboard](https://dashboard.vapi.ai/)
2. Navigate to **Settings** → **API Keys**
3. Copy your:
   - **Private Key** (for server-side operations)
   - **Public Key** (for client-side web integration)

### 2. Configure Environment Variables

Create a `.env` file in your project root:

```bash
# Copy from .env.example and add your VAPI keys
cp .env.example .env
```

Edit `.env` and add your VAPI credentials:

```env
# VAPI Configuration
VAPI_PRIVATE_KEY=your_actual_vapi_private_key_here
VAPI_PUBLIC_KEY=your_actual_vapi_public_key_here
VAPI_PORT=3001

# OpenAI (required for VAPI)
OPENAI_API_KEY=your_actual_openai_api_key_here
```

### 3. Update HTML Configuration

Edit `index.html` and replace the placeholder with your actual public key:

```javascript
// Find this line in index.html
window.VAPI_PUBLIC_KEY = 'your-vapi-public-key-here';

// Replace with your actual public key
window.VAPI_PUBLIC_KEY = 'your_actual_vapi_public_key_here';
```

## 🏃‍♂️ Running the Application

### Option 1: Run with VAPI Integration

```bash
# Start both main server and VAPI server
npm run dev-with-vapi
```

This will start:
- Main website server on `http://localhost:3000`
- VAPI server on `http://localhost:3001`

### Option 2: Run Servers Separately

```bash
# Terminal 1: Main website
npm run server

# Terminal 2: VAPI server
npm run vapi-server

# Terminal 3: VAPI MCP server (optional)
npm run vapi-mcp
```

## 🎤 Features Included

### 1. Web Voice Chat
- Floating voice interface on your website
- Real-time voice conversations with AI
- Visual status indicators and transcripts

### 2. Phone Call Integration
- Outbound phone calls via API
- Inbound call handling (with webhook setup)
- Call analytics and transcripts

### 3. MCP Integration
- Model Context Protocol server
- Tool-based AI interactions
- Extensible function calling

## 🔧 API Endpoints

### VAPI Server Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/vapi/health` | GET | Health check |
| `/api/vapi/assistants` | GET | List all assistants |
| `/api/vapi/assistants` | POST | Create new assistant |
| `/api/vapi/calls` | POST | Make outbound call |
| `/api/vapi/calls/:id?` | GET | Get call analytics |
| `/api/vapi/webhook` | POST | VAPI webhook endpoint |
| `/api/vapi/setup-default-assistant` | POST | Create default assistant |

### Example: Create Voice Assistant

```bash
curl -X POST http://localhost:3001/api/vapi/assistants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Service Bot",
    "voice": "jennifer",
    "model": "gpt-4",
    "systemPrompt": "You are a helpful customer service representative for Retrospxt Holdings.",
    "firstMessage": "Hello! How can I help you today?"
  }'
```

### Example: Make Phone Call

```bash
curl -X POST http://localhost:3001/api/vapi/calls \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "assistantId": "your-assistant-id",
    "customerName": "John Doe"
  }'
```

## 🎨 Customization

### Voice Interface Styling

The voice interface uses CSS classes in `css/vapi-styles.css`:

- `.voice-interface` - Main container
- `.voice-chat-container` - Chat interface
- `.voice-btn` - Call button
- `.status-indicator` - Status display

### Assistant Configuration

Modify the default assistant in `vapi-server.js`:

```javascript
const defaultAssistant = {
    name: 'Your Custom Assistant',
    voice: 'jennifer', // or 'mark', 'sarah', etc.
    model: 'gpt-4',
    systemPrompt: 'Your custom system prompt...',
    firstMessage: 'Your custom greeting...'
};
```

## 🔗 Webhook Setup

### 1. Configure Webhook URL

In your VAPI dashboard:
1. Go to **Settings** → **Webhooks**
2. Set webhook URL: `https://yourdomain.com/api/vapi/webhook`
3. Enable events: `call-start`, `call-end`, `transcript`

### 2. Handle Webhook Events

The webhook handler in `vapi-server.js` processes:
- **call-start**: Call initiated
- **call-end**: Call completed
- **transcript**: Real-time transcription
- **function-call**: Custom function execution

## 🧪 Testing

### 1. Test Web Voice Interface

1. Open `http://localhost:3000`
2. Look for the floating voice interface (bottom-right)
3. Click "Start Voice Chat"
4. Allow microphone permissions
5. Start talking!

### 2. Test API Endpoints

```bash
# Health check
curl http://localhost:3001/api/vapi/health

# Create default assistant
curl -X POST http://localhost:3001/api/vapi/setup-default-assistant

# List assistants
curl http://localhost:3001/api/vapi/assistants
```

### 3. Test Phone Calls

**Note**: Phone calls require a valid phone number and will incur charges.

```bash
curl -X POST http://localhost:3001/api/vapi/calls \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "assistantId": "your-assistant-id"
  }'
```

## 📊 Analytics & Monitoring

### Call Analytics

Get detailed call information:

```bash
# Get recent calls
curl http://localhost:3001/api/vapi/calls

# Get specific call
curl http://localhost:3001/api/vapi/calls/call-id-here
```

### Logs

Monitor server logs for:
- Call events
- Webhook notifications
- Error messages
- Performance metrics

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Rotate keys regularly
3. **Webhooks**: Validate webhook signatures
4. **HTTPS**: Use HTTPS in production
5. **Rate Limiting**: Implement API rate limits

## 🚀 Production Deployment

### 1. Environment Setup

```bash
# Production environment variables
NODE_ENV=production
VAPI_PRIVATE_KEY=your_production_private_key
VAPI_PUBLIC_KEY=your_production_public_key
```

### 2. Process Management

```bash
# Using PM2
npm install -g pm2
pm2 start vapi-server.js --name "vapi-server"
pm2 start server.js --name "main-server"
```

### 3. Reverse Proxy (Nginx)

```nginx
# VAPI server proxy
location /api/vapi/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## 🆘 Troubleshooting

### Common Issues

1. **"VAPI not configured"**
   - Check your `.env` file has correct API keys
   - Verify public key in `index.html`

2. **"Failed to start call"**
   - Check microphone permissions
   - Verify VAPI public key is valid
   - Check browser console for errors

3. **"Webhook not receiving events"**
   - Verify webhook URL in VAPI dashboard
   - Check server is accessible from internet
   - Validate webhook endpoint responds with 200

4. **"Phone calls not working"**
   - Verify phone number format (E.164)
   - Check VAPI account has sufficient credits
   - Ensure assistant ID is valid

### Debug Mode

Enable debug logging:

```javascript
// In vapi-integration.js
console.log('VAPI Debug:', {
    publicKey: window.VAPI_PUBLIC_KEY,
    isInitialized: !!this.vapi,
    callStatus: this.isCallActive
});
```

## 📚 Additional Resources

- [VAPI Documentation](https://docs.vapi.ai/)
- [MCP Specification](https://modelcontextprotocol.io/)
- [OpenAI API Reference](https://platform.openai.com/docs/)
- [Voice Interface Best Practices](https://docs.vapi.ai/best-practices)

## 🤝 Support

For issues specific to this integration:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Test API endpoints individually
4. Verify environment configuration

For VAPI-specific issues:
- [VAPI Discord Community](https://discord.gg/vapi)
- [VAPI Support](https://docs.vapi.ai/support)

---

**Ready to enable voice AI for your business? Start with the Quick Setup section above!** 🎉