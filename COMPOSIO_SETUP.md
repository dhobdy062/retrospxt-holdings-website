# Composio Integration Setup

This project includes integration with Composio for AI-powered automation and OpenAI for language processing.

## Prerequisites

1. **Node.js** (version 14 or higher)
2. **OpenAI API Key** - Get from [OpenAI Platform](https://platform.openai.com/api-keys)
3. **Composio API Key** - Get from [Composio Dashboard](https://app.composio.dev/settings)

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed, but if you need to reinstall:

```bash
npm install
```

### 2. Environment Variables

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your API keys:
   ```env
   OPENAI_API_KEY=your_actual_openai_api_key_here
   COMPOSIO_API_KEY=your_actual_composio_api_key_here
   ```

### 3. Run the Integration

Execute the Composio Gmail authorization script:

```bash
npm run composio
```

## What the Script Does

The `composio-integration.js` script:

1. **Initializes** OpenAI and Composio clients with your API keys
2. **Authorizes Gmail access** for the user email `don@dhobdyjr.com`
3. **Provides a redirect URL** for OAuth flow
4. **Waits for connection** to be established
5. **Confirms successful connection**

## Usage Flow

1. Run the script with `npm run composio`
2. The script will output a redirect URL
3. Open the redirect URL in your browser
4. Complete the OAuth authorization for Gmail
5. The script will detect the successful connection
6. You can now use Composio to interact with Gmail programmatically

## Files Created

- `composio-integration.js` - Main integration script
- `.env.example` - Environment variables template
- `COMPOSIO_SETUP.md` - This setup guide

## Security Notes

- Never commit your `.env` file with actual API keys
- The `.env` file is already included in `.gitignore`
- Keep your API keys secure and rotate them regularly

## Troubleshooting

### Common Issues

1. **"OPENAI_API_KEY environment variable is not set"**
   - Make sure you created a `.env` file with your OpenAI API key

2. **"COMPOSIO_API_KEY environment variable is not set"**
   - Make sure you added your Composio API key to the `.env` file

3. **Import errors**
   - The project is configured to use ES modules (`"type": "module"` in package.json)
   - Make sure you're using Node.js version 14 or higher

## Next Steps

After successful Gmail authorization, you can:

1. Use Composio to read emails
2. Send emails programmatically
3. Create automated workflows
4. Integrate with other services through Composio

For more advanced usage, refer to the [Composio Documentation](https://docs.composio.dev/).