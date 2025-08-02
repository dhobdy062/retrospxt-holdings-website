# Email Form Setup Guide

This guide will help you set up email functionality for the community form on your Retrospxt Holdings website.

## 🚀 Quick Start

1. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```

2. **Configure email settings in `.env`** (see options below)

3. **Start the server:**
   ```bash
   npm run server
   ```

4. **Visit your website:** `http://localhost:3000`

## 📧 Email Configuration Options

### Option 1: Gmail (Recommended)

This is the easiest option for most users.

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. **Add to `.env`:**
   ```env
   GMAIL_USER=your_gmail_address@gmail.com
   GMAIL_APP_PASSWORD=your_16_character_app_password
   NOTIFICATION_EMAIL=don@dhobdyjr.com
   ```

### Option 2: Custom SMTP Server

For other email providers (Outlook, Yahoo, custom domains):

```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@domain.com
SMTP_PASSWORD=your_email_password
NOTIFICATION_EMAIL=don@dhobdyjr.com
```

#### Common SMTP Settings:

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

**Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

**Custom Domain (cPanel/WHM):**
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Option 3: Development Mode

If you don't configure email, the system will use a test mode that logs preview URLs to the console.

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GMAIL_USER` | Your Gmail address | For Gmail option |
| `GMAIL_APP_PASSWORD` | Gmail app password | For Gmail option |
| `SMTP_HOST` | SMTP server hostname | For SMTP option |
| `SMTP_PORT` | SMTP server port (usually 587) | For SMTP option |
| `SMTP_SECURE` | Use SSL/TLS (true/false) | For SMTP option |
| `SMTP_USER` | SMTP username | For SMTP option |
| `SMTP_PASSWORD` | SMTP password | For SMTP option |
| `NOTIFICATION_EMAIL` | Where to send form submissions | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |

## 🎯 How It Works

1. **User fills out the community form** on your website
2. **Form data is validated** on the frontend
3. **Data is sent to `/api/community-join`** endpoint
4. **Server validates the data** and creates a formatted email
5. **Email is sent to your notification address** with all form details
6. **User receives confirmation message**

## 📋 Form Data Captured

The community form captures:
- **Name** (required)
- **Email** (required)
- **Company** (optional)
- **Business Size** (optional)
- **AI Experience Level** (required)
- **Newsletter Subscription** (checkbox)

## 🔍 Testing

### Test the API directly:
```bash
curl -X POST http://localhost:3000/api/community-join \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "aiExperience": "beginner",
    "newsletterOptIn": true
  }'
```

### Check server health:
```bash
curl http://localhost:3000/api/health
```

## 🚨 Troubleshooting

### Common Issues:

1. **"Email service is not configured"**
   - Check your `.env` file exists and has correct email settings
   - Restart the server after changing `.env`

2. **Gmail authentication failed**
   - Ensure 2FA is enabled on your Google account
   - Use an App Password, not your regular password
   - Check the app password is 16 characters without spaces

3. **SMTP connection failed**
   - Verify SMTP settings with your email provider
   - Check firewall/antivirus isn't blocking the connection
   - Try different ports (587, 465, 25)

4. **Form not submitting**
   - Check browser console for JavaScript errors
   - Ensure server is running on the correct port
   - Verify form field names match the API expectations

### Debug Mode:

Set `NODE_ENV=development` in your `.env` file to see detailed logs.

## 🔒 Security Notes

- **Never commit your `.env` file** - it's already in `.gitignore`
- **Use App Passwords** for Gmail, not your main password
- **Rotate credentials regularly**
- **Use environment variables** in production, not hardcoded values

## 🌐 Production Deployment

For production deployment:

1. **Set environment variables** on your hosting platform
2. **Use a process manager** like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "retrospxt-server"
   ```
3. **Set up a reverse proxy** (nginx/Apache) if needed
4. **Use HTTPS** for secure form submissions

## 📞 Support

If you need help with setup:
1. Check the server logs for error messages
2. Verify your email provider's SMTP documentation
3. Test with the development mode first
4. Contact your hosting provider for server-specific issues

## 🎉 Success!

Once configured, you'll receive beautifully formatted emails whenever someone joins your community, including all their details and preferences.

The emails include:
- Contact information
- Business details
- AI experience level
- Newsletter preferences
- Timestamp of submission