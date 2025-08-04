import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { VapiClient } from '@vapi-ai/server-sdk';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.VAPI_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize VAPI client
const vapi = new VapiClient({
    token: process.env.VAPI_PRIVATE_KEY,
});

/**
 * VAPI Server for Retrospxt Holdings
 * Handles voice assistant creation, call management, and webhooks
 */

// Health check endpoint
app.get('/api/vapi/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'VAPI Server',
        timestamp: new Date().toISOString()
    });
});

// Create a new voice assistant
app.post('/api/vapi/assistants', async (req, res) => {
    try {
        const {
            name,
            voice = 'jennifer',
            model = 'gpt-4',
            systemPrompt,
            firstMessage,
            endCallMessage = "Thank you for calling Retrospxt Holdings. Have a great day!"
        } = req.body;

        if (!name || !systemPrompt || !firstMessage) {
            return res.status(400).json({
                error: 'Missing required fields: name, systemPrompt, firstMessage'
            });
        }

        const assistantConfig = {
            name,
            voice: {
                provider: 'playht',
                voiceId: voice
            },
            model: {
                provider: 'openai',
                model,
                systemMessage: systemPrompt,
                temperature: 0.7
            },
            firstMessage,
            endCallMessage,
            recordingEnabled: true,
            endCallPhrases: ["goodbye", "bye", "end call", "hang up", "thank you"],
            maxDurationSeconds: 600, // 10 minutes max
            silenceTimeoutSeconds: 30,
            responseDelaySeconds: 0.4,
            llmRequestDelaySeconds: 0.1
        };

        const assistant = await vapi.assistants.create(assistantConfig);

        res.json({
            success: true,
            assistant: {
                id: assistant.id,
                name: assistant.name,
                voice: assistant.voice.voiceId,
                model: assistant.model.model
            }
        });

    } catch (error) {
        console.error('Error creating assistant:', error);
        res.status(500).json({
            error: 'Failed to create voice assistant',
            details: error.message
        });
    }
});

// Get all assistants
app.get('/api/vapi/assistants', async (req, res) => {
    try {
        const response = await vapi.assistants.list();
        
        res.json({
            success: true,
            assistants: response.data.map(assistant => ({
                id: assistant.id,
                name: assistant.name,
                voice: assistant.voice?.voiceId,
                model: assistant.model?.model,
                createdAt: assistant.createdAt
            }))
        });

    } catch (error) {
        console.error('Error fetching assistants:', error);
        res.status(500).json({
            error: 'Failed to fetch assistants',
            details: error.message
        });
    }
});

// Make an outbound call
app.post('/api/vapi/calls', async (req, res) => {
    try {
        const {
            phoneNumber,
            assistantId,
            customerName = 'Customer'
        } = req.body;

        if (!phoneNumber || !assistantId) {
            return res.status(400).json({
                error: 'Missing required fields: phoneNumber, assistantId'
            });
        }

        // Validate phone number format (basic E.164 check)
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({
                error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)'
            });
        }

        const callConfig = {
            assistantId,
            customer: {
                number: phoneNumber,
                name: customerName
            }
        };

        const call = await vapi.calls.create(callConfig);

        res.json({
            success: true,
            call: {
                id: call.id,
                status: call.status,
                phoneNumber,
                customerName,
                createdAt: call.createdAt
            }
        });

    } catch (error) {
        console.error('Error making call:', error);
        res.status(500).json({
            error: 'Failed to initiate call',
            details: error.message
        });
    }
});

// List all calls
app.get('/api/vapi/calls', async (req, res) => {
    try {
        const calls = await vapi.calls.list();
        res.json({
            success: true,
            calls: calls.map(call => ({
                id: call.id,
                status: call.status,
                createdAt: call.createdAt,
                endedAt: call.endedAt,
                phoneNumber: call.customer?.number,
                customerName: call.customer?.name,
                duration: call.endedAt ?
                    Math.round((new Date(call.endedAt) - new Date(call.createdAt)) / 1000) : null
            }))
        });
    } catch (error) {
        console.error('Error fetching calls:', error);
        res.status(500).json({
            error: 'Failed to fetch calls',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get specific call details
app.get('/api/vapi/calls/:callId', async (req, res) => {
    try {
        const { callId } = req.params;
        const call = await vapi.calls.get(callId);
        
        res.json({
            success: true,
            call: {
                id: call.id,
                status: call.status,
                createdAt: call.createdAt,
                endedAt: call.endedAt,
                phoneNumber: call.customer?.number,
                customerName: call.customer?.name,
                duration: call.endedAt ?
                    Math.round((new Date(call.endedAt) - new Date(call.createdAt)) / 1000) : null,
                transcript: call.transcript,
                summary: call.summary,
                cost: call.cost
            }
        });
    } catch (error) {
        console.error('Error fetching call details:', error);
        res.status(500).json({
            error: 'Failed to fetch call details',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// VAPI webhook endpoint for call events
app.post('/api/vapi/webhook', (req, res) => {
    try {
        const event = req.body;
        
        console.log('VAPI Webhook received:', {
            type: event.type,
            callId: event.call?.id,
            timestamp: new Date().toISOString()
        });

        // Handle different webhook events
        switch (event.type) {
            case 'call-start':
                handleCallStart(event);
                break;
            case 'call-end':
                handleCallEnd(event);
                break;
            case 'transcript':
                handleTranscript(event);
                break;
            case 'function-call':
                handleFunctionCall(event);
                break;
            default:
                console.log('Unhandled webhook event type:', event.type);
        }

        res.status(200).json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Webhook event handlers
function handleCallStart(event) {
    console.log(`Call started: ${event.call.id}`);
    // Add your custom logic here (e.g., logging, notifications)
}

function handleCallEnd(event) {
    console.log(`Call ended: ${event.call.id}`, {
        duration: event.call.duration,
        cost: event.call.cost,
        endReason: event.call.endReason
    });
    // Add your custom logic here (e.g., save to database, send notifications)
}

function handleTranscript(event) {
    console.log(`Transcript: ${event.transcript.text}`);
    // Add your custom logic here (e.g., save transcript, analyze sentiment)
}

function handleFunctionCall(event) {
    console.log(`Function called: ${event.functionCall.name}`);
    // Add your custom logic here (e.g., execute business logic, update CRM)
}

// Create default Retrospxt Holdings assistant
app.post('/api/vapi/setup-default-assistant', async (req, res) => {
    try {
        const defaultAssistant = {
            name: 'Retrospxt Holdings AI Assistant',
            voice: 'jennifer',
            model: 'gpt-4',
            systemPrompt: `You are a professional AI assistant for Retrospxt Holdings LLC, a company that specializes in AI-powered business solutions.

Your role is to:
1. Help potential clients understand our services: AI Voice Agents, Marketing Automation, and Business Training
2. Answer questions about AI implementation for small businesses
3. Schedule consultations and collect contact information
4. Provide helpful information about AI trends and best practices

Key services to highlight:
- AI Voice Agents: 24/7 customer service, lead qualification, appointment scheduling
- Marketing Automation: Email campaigns, social media management, customer journey optimization
- Training Programs: Hands-on AI workshops, team training, implementation support

Be friendly, professional, and knowledgeable. Keep responses concise but informative. Always offer to schedule a consultation for detailed discussions.`,
            firstMessage: "Hello! I'm the AI assistant for Retrospxt Holdings. We help small businesses implement AI solutions to grow their customer base and streamline operations. How can I help you learn about our AI voice agents, marketing automation, or training programs today?"
        };

        const assistant = await vapi.assistants.create({
            name: defaultAssistant.name,
            voice: {
                provider: 'playht',
                voiceId: defaultAssistant.voice
            },
            model: {
                provider: 'openai',
                model: defaultAssistant.model,
                systemMessage: defaultAssistant.systemPrompt,
                temperature: 0.7
            },
            firstMessage: defaultAssistant.firstMessage,
            endCallMessage: "Thank you for your interest in Retrospxt Holdings! We look forward to helping you implement AI solutions for your business. Have a great day!",
            recordingEnabled: true,
            endCallPhrases: ["goodbye", "bye", "end call", "hang up", "thank you"],
            maxDurationSeconds: 900, // 15 minutes
            silenceTimeoutSeconds: 30
        });

        res.json({
            success: true,
            message: 'Default Retrospxt Holdings assistant created successfully',
            assistant: {
                id: assistant.id,
                name: assistant.name,
                publicKey: process.env.VAPI_PUBLIC_KEY // Include for frontend use
            }
        });

    } catch (error) {
        console.error('Error creating default assistant:', error);
        res.status(500).json({
            error: 'Failed to create default assistant',
            details: error.message
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`VAPI Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/vapi/health`);
    console.log(`Webhook endpoint: http://localhost:${PORT}/api/vapi/webhook`);
});

export default app;