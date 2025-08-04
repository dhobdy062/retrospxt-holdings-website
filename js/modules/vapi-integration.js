/**
 * VAPI Web Integration for Retrospxt Holdings
 * Handles client-side voice interactions and AI voice agent calls
 */
class VapiIntegration {
    constructor() {
        this.vapi = null;
        this.isCallActive = false;
        this.assistantId = null;
        this.callButton = null;
        this.statusIndicator = null;
        this.demoMode = false;
        
        this.init();
    }

    async init() {
        try {
            // Initialize VAPI client with fallback
            if (window.Vapi && window.VAPI_PUBLIC_KEY) {
                this.vapi = new window.Vapi(window.VAPI_PUBLIC_KEY);
                this.demoMode = window.VAPI_MOCK_MODE || false;
                console.log('VAPI initialized', this.demoMode ? '(mock mode)' : '(real mode)');
                this.setupEventListeners();
            } else {
                console.log('VAPI not available, running in demo mode');
                this.demoMode = true;
            }
            
            this.createVoiceInterface();
            
            console.log('VAPI integration initialized successfully' + (this.demoMode ? ' (demo mode)' : ''));
        } catch (error) {
            console.error('Failed to initialize VAPI, falling back to demo mode:', error);
            this.demoMode = true;
            this.createVoiceInterface();
        }
    }

    setupEventListeners() {
        if (!this.vapi) return;

        // Call started
        this.vapi.on('call-start', () => {
            console.log('Call started');
            this.isCallActive = true;
            this.updateCallButton('End Call', 'active');
            this.updateStatusIndicator('Connected', 'connected');
        });

        // Call ended
        this.vapi.on('call-end', () => {
            console.log('Call ended');
            this.isCallActive = false;
            this.updateCallButton('Start Voice Chat', 'inactive');
            this.updateStatusIndicator('Disconnected', 'disconnected');
        });

        // Speech started (user speaking)
        this.vapi.on('speech-start', () => {
            console.log('User started speaking');
            this.updateStatusIndicator('Listening...', 'listening');
        });

        // Speech ended (user stopped speaking)
        this.vapi.on('speech-end', () => {
            console.log('User stopped speaking');
            this.updateStatusIndicator('Processing...', 'processing');
        });

        // Message received from assistant
        this.vapi.on('message', (message) => {
            console.log('Message from assistant:', message);
            if (message.type === 'transcript' && message.role === 'assistant') {
                this.displayAssistantMessage(message.transcript);
            }
        });

        // Error handling
        this.vapi.on('error', (error) => {
            console.error('VAPI error:', error);
            this.updateStatusIndicator('Error occurred', 'error');
            this.isCallActive = false;
            this.updateCallButton('Start Voice Chat', 'inactive');
        });
    }

    createVoiceInterface() {
        // Use the existing AI Agent Active button in the hero section
        const existingCard = document.querySelector('.floating-card');
        const existingButton = existingCard?.querySelector('.card-content');
        
        if (!existingCard || !existingButton) {
            console.warn('AI Agent Active button not found in hero section');
            return;
        }

        // Store references
        this.callButton = existingButton;
        this.statusIndicator = existingButton.querySelector('span');
        this.aiIndicator = existingButton.querySelector('.ai-indicator');
        
        // Make the existing button clickable
        existingButton.style.cursor = 'pointer';
        existingButton.style.transition = 'all 0.3s ease';
        
        // Add click handler to the existing button
        existingButton.addEventListener('click', () => this.toggleCall());
        
        // Add hover effects
        existingButton.addEventListener('mouseenter', () => {
            if (!this.isCallActive) {
                existingCard.style.transform = 'translateY(-2px) scale(1.02)';
            }
        });
        
        existingButton.addEventListener('mouseleave', () => {
            if (!this.isCallActive) {
                existingCard.style.transform = '';
            }
        });
        
        // Create a transcript container that appears when needed
        this.createTranscriptContainer();
        
        // Update initial state
        this.updateButtonState('Ready', 'ready');
    }

    createTranscriptContainer() {
        // Create a floating transcript container
        const transcriptContainer = document.createElement('div');
        transcriptContainer.id = 'voice-transcript-container';
        transcriptContainer.className = 'voice-transcript-container hidden';
        transcriptContainer.innerHTML = `
            <div class="transcript-header">
                <h4>AI Voice Assistant</h4>
                <button class="close-transcript" onclick="this.parentElement.parentElement.classList.add('hidden')">×</button>
            </div>
            <div class="voice-transcript" id="voice-transcript">
                <p class="transcript-placeholder">Voice conversation will appear here...</p>
            </div>
        `;
        
        document.body.appendChild(transcriptContainer);
        this.transcript = document.getElementById('voice-transcript');
    }

    async toggleCall() {
        if (this.isCallActive) {
            await this.endCall();
        } else {
            await this.startCall();
        }
    }

    async startCall() {
        try {
            this.updateStatusIndicator('Connecting...', 'connecting');
            
            // Default assistant configuration for Retrospxt Holdings
            const assistantConfig = {
                name: 'Retrospxt AI Assistant',
                voice: {
                    provider: 'playht',
                    voiceId: 'jennifer'
                },
                model: {
                    provider: 'openai',
                    model: 'gpt-4',
                    systemMessage: `You are a helpful AI assistant for Retrospxt Holdings LLC. 
                    You help potential clients learn about our AI voice agents, marketing automation, 
                    and business training programs. Be friendly, professional, and knowledgeable about 
                    AI solutions for small businesses. Keep responses concise and engaging.`
                },
                firstMessage: "Hello! I'm the AI assistant for Retrospxt Holdings. How can I help you learn about our AI solutions for your business today?",
                recordingEnabled: false
            };

            if (this.vapi) {
                await this.vapi.start(this.assistantId || assistantConfig);
            } else {
                // Pure demo mode without VAPI
                setTimeout(() => {
                    this.simulateCallStart();
                }, 1000);
            }
            
        } catch (error) {
            console.error('Failed to start call:', error);
            this.updateStatusIndicator('Failed to connect', 'error');
        }
    }

    async endCall() {
        try {
            if (this.vapi) {
                await this.vapi.stop();
            } else {
                this.simulateCallEnd();
            }
        } catch (error) {
            console.error('Failed to end call:', error);
        }
    }

    updateCallButton(text, state) {
        this.updateButtonState(text, state);
    }

    updateStatusIndicator(text, state) {
        this.updateButtonState(text, state);
    }

    updateButtonState(text, state) {
        if (!this.callButton || !this.statusIndicator) return;
        
        // Update the text
        this.statusIndicator.textContent = text;
        
        // Update the AI indicator based on state
        if (this.aiIndicator) {
            this.aiIndicator.className = `ai-indicator ${state}`;
        }
        
        // Update the card styling based on state
        const card = this.callButton.closest('.floating-card');
        if (card) {
            card.className = `floating-card ${state}`;
        }
        
        // Show/hide transcript container for active calls
        const transcriptContainer = document.getElementById('voice-transcript-container');
        if (transcriptContainer) {
            if (state === 'connected' || state === 'listening' || state === 'processing') {
                transcriptContainer.classList.remove('hidden');
            }
        }
    }

    displayAssistantMessage(message) {
        if (!this.transcript) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'transcript-message assistant';
        messageElement.innerHTML = `
            <div class="message-content">
                <strong>Assistant:</strong> ${message}
            </div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        
        this.transcript.appendChild(messageElement);
        this.transcript.scrollTop = this.transcript.scrollHeight;
    }

    // Demo mode simulation methods
    simulateCallStart() {
        this.isCallActive = true;
        this.updateCallButton('End Call', 'active');
        this.updateStatusIndicator('Connected (Demo)', 'connected');
        
        // Simulate assistant message after a delay
        setTimeout(() => {
            this.displayAssistantMessage("Hello! This is a demo of our AI voice assistant. In the full version, you would be able to have a real voice conversation with me about Retrospxt Holdings' AI solutions.");
        }, 2000);
    }
    
    simulateCallEnd() {
        this.isCallActive = false;
        this.updateCallButton('Start Voice Chat', 'inactive');
        this.updateStatusIndicator('Disconnected', 'disconnected');
    }

    // Public methods for external use
    setAssistantId(assistantId) {
        this.assistantId = assistantId;
    }

    getCallStatus() {
        return {
            isActive: this.isCallActive,
            assistantId: this.assistantId,
            demoMode: this.demoMode
        };
    }
}

// Export for use in other modules and make available globally
window.VapiIntegration = VapiIntegration;
export default VapiIntegration;