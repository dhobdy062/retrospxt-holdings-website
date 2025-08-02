import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));

// Email configuration
const createTransporter = () => {
    // Check if we have Gmail credentials
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });
    }
    
    // Fallback to SMTP configuration
    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }
    
    // Development mode - use Ethereal Email (test account)
    console.log('⚠️  No email configuration found. Using test mode.');
    return null;
};

// Initialize email transporter
let transporter = createTransporter();

// Create test account for development if no real email config
if (!transporter) {
    nodemailer.createTestAccount((err, account) => {
        if (err) {
            console.error('Failed to create test account:', err);
            return;
        }
        
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: account.user,
                pass: account.pass
            }
        });
        
        console.log('📧 Test email account created:');
        console.log('   User:', account.user);
        console.log('   Pass:', account.pass);
        console.log('   Preview URLs will be logged to console');
    });
}

// Email templates
const createCommunityJoinEmail = (formData) => {
    const { name, email, company, businessSize, aiExperience, newsletterOptIn } = formData;
    
    return {
        subject: 'New Community Member - Retrospxt Holdings',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">New Community Member Registration</h2>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #1e293b;">Contact Information</h3>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
                </div>
                
                <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #1e293b;">Business Details</h3>
                    ${businessSize ? `<p><strong>Business Size:</strong> ${businessSize}</p>` : ''}
                    <p><strong>AI Experience Level:</strong> ${aiExperience}</p>
                </div>
                
                <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #1e293b;">Preferences</h3>
                    <p><strong>Newsletter Subscription:</strong> ${newsletterOptIn ? 'Yes' : 'No'}</p>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #64748b; font-size: 14px;">
                        This email was sent from the Retrospxt Holdings website community form.
                        <br>
                        Timestamp: ${new Date().toLocaleString()}
                    </p>
                </div>
            </div>
        `,
        text: `
New Community Member Registration

Contact Information:
- Name: ${name}
- Email: ${email}
${company ? `- Company: ${company}` : ''}

Business Details:
${businessSize ? `- Business Size: ${businessSize}` : ''}
- AI Experience Level: ${aiExperience}

Preferences:
- Newsletter Subscription: ${newsletterOptIn ? 'Yes' : 'No'}

Timestamp: ${new Date().toLocaleString()}
        `
    };
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        emailConfigured: !!transporter
    });
});

// Community form submission endpoint
app.post('/api/community-join', async (req, res) => {
    try {
        const formData = req.body;
        
        // Validate required fields
        if (!formData.name || !formData.email || !formData.aiExperience) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, email, and AI experience level are required.'
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }
        
        if (!transporter) {
            return res.status(500).json({
                success: false,
                message: 'Email service is not configured. Please contact support.'
            });
        }
        
        // Create email content
        const emailContent = createCommunityJoinEmail(formData);
        
        // Email options
        const mailOptions = {
            from: process.env.GMAIL_USER || process.env.SMTP_USER || 'noreply@retrospxt.com',
            to: process.env.NOTIFICATION_EMAIL || 'don@dhobdyjr.com',
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text
        };
        
        // Send email
        const info = await transporter.sendMail(mailOptions);
        
        // Log success
        console.log('✅ Community join email sent successfully');
        console.log('   To:', mailOptions.to);
        console.log('   From:', formData.email);
        console.log('   Name:', formData.name);
        
        // If using test account, log preview URL
        if (info.messageId && process.env.NODE_ENV !== 'production') {
            const previewUrl = nodemailer.getTestMessageUrl(info);
            if (previewUrl) {
                console.log('📧 Preview URL:', previewUrl);
            }
        }
        
        res.json({
            success: true,
            message: 'Thank you for joining our community! We\'ll be in touch soon.'
        });
        
    } catch (error) {
        console.error('❌ Error sending community join email:', error);
        
        res.status(500).json({
            success: false,
            message: 'There was an error processing your request. Please try again later.'
        });
    }
});

// Newsletter subscription endpoint
app.post('/api/newsletter-subscribe', async (req, res) => {
    try {
        const { email, name } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required.'
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }
        
        if (!transporter) {
            return res.status(500).json({
                success: false,
                message: 'Email service is not configured. Please contact support.'
            });
        }
        
        // Create email content
        const mailOptions = {
            from: process.env.GMAIL_USER || process.env.SMTP_USER || 'noreply@retrospxt.com',
            to: process.env.NOTIFICATION_EMAIL || 'don@dhobdyjr.com',
            subject: 'New Newsletter Subscription - Retrospxt Holdings',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">New Newsletter Subscription</h2>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
                        <p><strong>Email:</strong> ${email}</p>
                        ${name ? `<p><strong>Name:</strong> ${name}</p>` : ''}
                        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                </div>
            `,
            text: `
New Newsletter Subscription

Email: ${email}
${name ? `Name: ${name}` : ''}
Timestamp: ${new Date().toLocaleString()}
            `
        };
        
        // Send email
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Newsletter subscription email sent successfully');
        console.log('   Email:', email);
        
        res.json({
            success: true,
            message: 'Thank you for subscribing to our newsletter!'
        });
        
    } catch (error) {
        console.error('❌ Error sending newsletter subscription email:', error);
        
        res.status(500).json({
            success: false,
            message: 'There was an error processing your subscription. Please try again later.'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📧 Email service: ${transporter ? 'Configured' : 'Not configured'}`);
    
    if (!process.env.GMAIL_USER && !process.env.SMTP_HOST) {
        console.log('');
        console.log('⚠️  Email Configuration Needed:');
        console.log('   Add email credentials to your .env file:');
        console.log('   - For Gmail: GMAIL_USER and GMAIL_APP_PASSWORD');
        console.log('   - For SMTP: SMTP_HOST, SMTP_USER, SMTP_PASSWORD');
        console.log('   - Set NOTIFICATION_EMAIL for where to send form submissions');
        console.log('');
    }
});

export default app;