/**
 * Retrospxt Holdings LLC Website
 * Main Application Controller
 */

class RetrospxtApp {
    constructor() {
        this.config = {
            navbarScrollThreshold: 50,
            sectionOffset: 80,
            animationDelay: 100,
            parallaxRate: -0.5
        };
        
        this.state = {
            isInitialized: false,
            isMobileMenuOpen: false,
            activeSection: 'home'
        };
        
        this.elements = {};
        this.observers = new Map();
        
        this.init();
    }
    
    /**
     * Initialize the application
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    /**
     * Setup all application components
     */
    setup() {
        try {
            this.cacheElements();
            this.initializeModules();
            this.bindEvents();
            this.state.isInitialized = true;
            
            console.log('Retrospxt App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Retrospxt App:', error);
        }
    }
    
    /**
     * Cache frequently used DOM elements
     */
    cacheElements() {
        this.elements = {
            navbar: document.getElementById('navbar'),
            navMenu: document.getElementById('nav-menu'),
            hamburger: document.getElementById('hamburger'),
            navLinks: document.querySelectorAll('.nav-link'),
            sections: document.querySelectorAll('section[id]'),
            heroBackground: document.querySelector('.hero-background'),
            modals: document.querySelectorAll('.modal'),
            forms: document.querySelectorAll('form'),
            animateElements: document.querySelectorAll('.service-card, .community-benefit, .stat-card, .feature-item')
        };
    }
    
    /**
     * Check if all required modules are loaded
     */
    checkModulesLoaded() {
        const requiredModules = [
            'NavigationModule',
            'ScrollEffectsModule', 
            'AnimationsModule',
            'ModalsModule',
            'FormsModule',
            'MobileMenuModule'
        ];
        
        return requiredModules.every(moduleName => 
            typeof window[moduleName] === 'function'
        );
    }

    /**
     * Initialize all modules
     */
    initializeModules() {
        if (!this.checkModulesLoaded()) {
            console.log('Modules not ready, retrying in 100ms...');
            setTimeout(() => this.initializeModules(), 100);
            return;
        }
        
        this.navigation = new window.NavigationModule(this);
        this.scrollEffects = new window.ScrollEffectsModule(this);
        this.animations = new window.AnimationsModule(this);
        this.modals = new window.ModalsModule(this);
        this.forms = new window.FormsModule(this);
        this.mobileMenu = new window.MobileMenuModule(this);
        
        // Initialize VAPI integration if available
        this.initializeVapi();
    }
    
    /**
     * Bind global events
     */
    bindEvents() {
        // Global error handling
        window.addEventListener('error', this.handleError.bind(this));
        
        // Performance monitoring
        window.addEventListener('load', this.onPageLoad.bind(this));
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', this.cleanup.bind(this));
    }
    
    /**
     * Handle global errors
     */
    handleError(event) {
        console.error('Global error:', event.error);
        // Could send to analytics service here
    }
    
    /**
     * Handle page load completion
     */
    onPageLoad() {
        // Add performance monitoring or analytics here
        console.log('Page fully loaded');
    }
    
    /**
     * Initialize VAPI voice integration
     */
    async initializeVapi() {
        try {
            // Check if VAPI is enabled and configured
            if (window.VAPI_PUBLIC_KEY && typeof window.VapiIntegration === 'function') {
                this.vapi = new window.VapiIntegration();
                console.log('VAPI integration initialized successfully');
            } else {
                console.log('VAPI not configured or module not loaded');
            }
        } catch (error) {
            console.warn('Failed to initialize VAPI:', error);
        }
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        // Clean up observers and event listeners
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        
        // Clean up VAPI if initialized
        if (this.vapi && typeof this.vapi.cleanup === 'function') {
            this.vapi.cleanup();
        }
    }
    
    /**
     * Utility method to safely query elements
     */
    $(selector, context = document) {
        return context.querySelector(selector);
    }
    
    /**
     * Utility method to safely query multiple elements
     */
    $$(selector, context = document) {
        return context.querySelectorAll(selector);
    }
}

// Initialize the application
const app = new RetrospxtApp();

// Export for global access
window.RetrospxtApp = app;

// Export the app instance
export default app;