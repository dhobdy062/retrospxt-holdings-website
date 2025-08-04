import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallTool, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import Vapi from '@vapi-ai/server-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * VAPI MCP Server Configuration
 * This server provides Model Context Protocol integration for VAPI voice AI
 */
class VapiMcpServer {
    constructor() {
        this.server = new Server(
            {
                name: 'vapi-mcp-server',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        // Initialize VAPI client
        this.vapi = new Vapi({
            token: process.env.VAPI_PRIVATE_KEY,
        });

        this.setupToolHandlers();
    }

    setupToolHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'create_voice_assistant',
                        description: 'Create a new VAPI voice assistant with custom configuration',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                    description: 'Name of the voice assistant'
                                },
                                voice: {
                                    type: 'string',
                                    description: 'Voice ID to use (e.g., "jennifer", "mark")',
                                    default: 'jennifer'
                                },
                                model: {
                                    type: 'string',
                                    description: 'AI model to use (e.g., "gpt-4", "gpt-3.5-turbo")',
                                    default: 'gpt-4'
                                },
                                firstMessage: {
                                    type: 'string',
                                    description: 'First message the assistant will say'
                                },
                                systemPrompt: {
                                    type: 'string',
                                    description: 'System prompt for the assistant behavior'
                                }
                            },
                            required: ['name', 'firstMessage', 'systemPrompt']
                        }
                    },
                    {
                        name: 'make_phone_call',
                        description: 'Initiate an outbound phone call using VAPI',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                phoneNumber: {
                                    type: 'string',
                                    description: 'Phone number to call (E.164 format)'
                                },
                                assistantId: {
                                    type: 'string',
                                    description: 'ID of the voice assistant to use'
                                },
                                customerName: {
                                    type: 'string',
                                    description: 'Name of the customer being called'
                                }
                            },
                            required: ['phoneNumber', 'assistantId']
                        }
                    },
                    {
                        name: 'get_call_analytics',
                        description: 'Retrieve analytics and transcripts for calls',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                callId: {
                                    type: 'string',
                                    description: 'Specific call ID to analyze'
                                },
                                limit: {
                                    type: 'number',
                                    description: 'Number of recent calls to retrieve',
                                    default: 10
                                }
                            }
                        }
                    },
                    {
                        name: 'update_assistant',
                        description: 'Update an existing voice assistant configuration',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                assistantId: {
                                    type: 'string',
                                    description: 'ID of the assistant to update'
                                },
                                updates: {
                                    type: 'object',
                                    description: 'Fields to update (name, voice, model, etc.)'
                                }
                            },
                            required: ['assistantId', 'updates']
                        }
                    }
                ]
            };
        });

        // Handle tool calls
        this.server.setRequestHandler(CallTool, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case 'create_voice_assistant':
                        return await this.createVoiceAssistant(args);
                    
                    case 'make_phone_call':
                        return await this.makePhoneCall(args);
                    
                    case 'get_call_analytics':
                        return await this.getCallAnalytics(args);
                    
                    case 'update_assistant':
                        return await this.updateAssistant(args);
                    
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error executing ${name}: ${error.message}`
                        }
                    ],
                    isError: true
                };
            }
        });
    }

    async createVoiceAssistant(args) {
        const assistantConfig = {
            name: args.name,
            voice: {
                provider: 'playht',
                voiceId: args.voice || 'jennifer'
            },
            model: {
                provider: 'openai',
                model: args.model || 'gpt-4',
                systemMessage: args.systemPrompt
            },
            firstMessage: args.firstMessage,
            recordingEnabled: true,
            endCallMessage: "Thank you for calling. Have a great day!",
            endCallPhrases: ["goodbye", "bye", "end call", "hang up"]
        };

        const assistant = await this.vapi.assistants.create(assistantConfig);

        return {
            content: [
                {
                    type: 'text',
                    text: `Voice assistant created successfully!\nID: ${assistant.id}\nName: ${assistant.name}\nVoice: ${assistant.voice.voiceId}`
                }
            ]
        };
    }

    async makePhoneCall(args) {
        const callConfig = {
            assistantId: args.assistantId,
            customer: {
                number: args.phoneNumber,
                name: args.customerName || 'Customer'
            }
        };

        const call = await this.vapi.calls.create(callConfig);

        return {
            content: [
                {
                    type: 'text',
                    text: `Phone call initiated successfully!\nCall ID: ${call.id}\nStatus: ${call.status}\nPhone: ${args.phoneNumber}`
                }
            ]
        };
    }

    async getCallAnalytics(args) {
        let calls;
        
        if (args.callId) {
            const call = await this.vapi.calls.get(args.callId);
            calls = [call];
        } else {
            const response = await this.vapi.calls.list({
                limit: args.limit || 10
            });
            calls = response.data;
        }

        const analytics = calls.map(call => ({
            id: call.id,
            status: call.status,
            duration: call.endedAt ? 
                Math.round((new Date(call.endedAt) - new Date(call.startedAt)) / 1000) : 
                null,
            cost: call.cost,
            transcript: call.transcript || 'No transcript available'
        }));

        return {
            content: [
                {
                    type: 'text',
                    text: `Call Analytics:\n${JSON.stringify(analytics, null, 2)}`
                }
            ]
        };
    }

    async updateAssistant(args) {
        const updatedAssistant = await this.vapi.assistants.update(
            args.assistantId,
            args.updates
        );

        return {
            content: [
                {
                    type: 'text',
                    text: `Assistant updated successfully!\nID: ${updatedAssistant.id}\nName: ${updatedAssistant.name}`
                }
            ]
        };
    }

    async start() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('VAPI MCP Server running on stdio');
    }
}

// Start the server
const server = new VapiMcpServer();
server.start().catch(console.error);