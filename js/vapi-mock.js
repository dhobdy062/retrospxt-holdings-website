/**
 * Mock VAPI SDK for demonstration purposes
 * This provides a fallback when the real VAPI SDK cannot be loaded
 */

// Mock Vapi class
class MockVapi {
    constructor(publicKey) {
        this.publicKey = publicKey;
        this.isConnected = false;
        this.eventListeners = {};
        console.log('Mock VAPI initialized with key:', publicKey);
    }

    // Event listener methods
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    off(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
        }
    }

    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }

    // Mock call methods
    async start(assistantConfig) {
        console.log('Mock VAPI: Starting call with config:', assistantConfig);
        
        // Simulate connection process
        setTimeout(() => {
            this.emit('call-start', { callId: 'mock-call-' + Date.now() });
            this.isConnected = true;
        }, 500);

        setTimeout(() => {
            this.emit('speech-start');
        }, 1000);

        setTimeout(() => {
            this.emit('speech-end');
            this.emit('message', {
                type: 'assistant',
                content: assistantConfig.firstMessage || "Hello! This is a demo of our AI voice assistant."
            });
        }, 2000);

        return Promise.resolve();
    }

    async stop() {
        console.log('Mock VAPI: Stopping call');
        
        setTimeout(() => {
            this.emit('call-end');
            this.isConnected = false;
        }, 500);

        return Promise.resolve();
    }

    // Mock status methods
    isMuted() {
        return false;
    }

    mute() {
        console.log('Mock VAPI: Muted');
    }

    unmute() {
        console.log('Mock VAPI: Unmuted');
    }
}

// Initialize mock if real VAPI is not available
if (typeof window !== 'undefined') {
    // Check if real VAPI is already loaded
    if (!window.Vapi) {
        console.log('Real VAPI not available, using mock implementation');
        window.Vapi = MockVapi;
        window.VAPI_MOCK_MODE = true;
    }
}