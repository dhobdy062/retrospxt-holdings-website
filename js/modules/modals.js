/**
 * Modals Module
 * Handles all modal functionality with accessibility features
 */

class ModalsModule {
    constructor(app) {
        this.app = app;
        this.config = {
            animationDuration: 300,
            backdropOpacity: 0.8,
            escapeKeyEnabled: true,
            focusTrap: true
        };
        
        this.state = {
            activeModal: null,
            previousFocus: null,
            isAnimating: false
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupModalTriggers();
        this.setupAccessibility();
    }
    
    bindEvents() {
        // Global escape key handler
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Click outside to close
        document.addEventListener('click', this.handleBackdropClick.bind(this));
    }
    
    /**
     * Setup modal trigger buttons
     */
    setupModalTriggers() {
        // Newsletter modal triggers
        const newsletterTriggers = document.querySelectorAll('[data-modal="newsletter"]');
        newsletterTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.open('newsletter-modal');
            });
        });
        
        // Schedule consultation modal triggers
        const consultationTriggers = document.querySelectorAll('[data-modal="consultation"]');
        consultationTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.open('consultation-modal');
            });
        });
        
        // Community modal triggers
        const communityTriggers = document.querySelectorAll('[data-modal="community"]');
        communityTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.open('community-modal');
            });
        });
        
        // Close button handlers
        const closeButtons = document.querySelectorAll('.modal-close, .close-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.close();
            });
        });
    }
    
    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        this.app.elements.modals.forEach(modal => {
            // Add ARIA attributes
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-hidden', 'true');
            
            // Add tabindex for focus management
            modal.setAttribute('tabindex', '-1');
        });
    }
    
    /**
     * Open modal by ID
     */
    async open(modalId) {
        if (this.state.isAnimating) return;
        
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal with ID '${modalId}' not found`);
            return;
        }
        
        // Close any existing modal first
        if (this.state.activeModal) {
            await this.close();
        }
        
        this.state.isAnimating = true;
        this.state.activeModal = modal;
        this.state.previousFocus = document.activeElement;
        
        // Prepare modal for animation
        this.prepareModal(modal);
        
        // Show modal with animation
        await this.animateIn(modal);
        
        // Setup focus management
        this.setupFocusTrap(modal);
        
        // Update accessibility attributes
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus the modal
        modal.focus();
        
        this.state.isAnimating = false;
        
        // Dispatch custom event
        this.dispatchModalEvent('modalOpened', { modalId, modal });
    }
    
    /**
     * Close active modal
     */
    async close() {
        if (!this.state.activeModal || this.state.isAnimating) return;
        
        this.state.isAnimating = true;
        const modal = this.state.activeModal;
        const modalId = modal.id;
        
        // Animate out
        await this.animateOut(modal);
        
        // Clean up
        this.cleanupModal(modal);
        
        // Restore focus
        if (this.state.previousFocus) {
            this.state.previousFocus.focus();
        }
        
        // Reset state
        this.state.activeModal = null;
        this.state.previousFocus = null;
        this.state.isAnimating = false;
        
        // Dispatch custom event
        this.dispatchModalEvent('modalClosed', { modalId, modal });
    }
    
    /**
     * Prepare modal for display
     */
    prepareModal(modal) {
        // Add backdrop if not exists
        if (!modal.querySelector('.modal-backdrop')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop';
            modal.appendChild(backdrop);
        }
        
        // Set initial styles
        modal.style.display = 'flex';
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.9)';
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Animate modal in
     */
    animateIn(modal) {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                modal.style.transition = `opacity ${this.config.animationDuration}ms ease, transform ${this.config.animationDuration}ms ease`;
                modal.style.opacity = '1';
                modal.style.transform = 'scale(1)';
                
                setTimeout(resolve, this.config.animationDuration);
            });
        });
    }
    
    /**
     * Animate modal out
     */
    animateOut(modal) {
        return new Promise(resolve => {
            modal.style.transition = `opacity ${this.config.animationDuration}ms ease, transform ${this.config.animationDuration}ms ease`;
            modal.style.opacity = '0';
            modal.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                modal.style.display = 'none';
                resolve();
            }, this.config.animationDuration);
        });
    }
    
    /**
     * Clean up modal after closing
     */
    cleanupModal(modal) {
        // Remove transition styles
        modal.style.transition = '';
        modal.style.transform = '';
        
        // Update accessibility
        modal.setAttribute('aria-hidden', 'true');
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
    
    /**
     * Setup focus trap for accessibility
     */
    setupFocusTrap(modal) {
        if (!this.config.focusTrap) return;
        
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Focus first element
        setTimeout(() => firstElement.focus(), 100);
        
        // Handle tab key for focus trap
        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };
        
        modal.addEventListener('keydown', handleTabKey);
        
        // Store handler for cleanup
        modal._focusTrapHandler = handleTabKey;
    }
    
    /**
     * Handle keydown events
     */
    handleKeydown(e) {
        if (!this.state.activeModal) return;
        
        // Escape key to close
        if (e.key === 'Escape' && this.config.escapeKeyEnabled) {
            e.preventDefault();
            this.close();
        }
    }
    
    /**
     * Handle backdrop clicks
     */
    handleBackdropClick(e) {
        if (!this.state.activeModal) return;
        
        // Check if click is on backdrop
        if (e.target.classList.contains('modal') || e.target.classList.contains('modal-backdrop')) {
            this.close();
        }
    }
    
    /**
     * Dispatch custom modal events
     */
    dispatchModalEvent(eventType, detail) {
        const event = new CustomEvent(eventType, {
            detail,
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * Public API methods
     */
    openNewsletter() {
        return this.open('newsletter-modal');
    }
    
    openConsultation() {
        return this.open('consultation-modal');
    }
    
    openCommunity() {
        return this.open('community-modal');
    }
    
    isOpen() {
        return this.state.activeModal !== null;
    }
    
    getActiveModal() {
        return this.state.activeModal;
    }
    
    /**
     * Configuration methods
     */
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    
    enableEscapeKey() {
        this.config.escapeKeyEnabled = true;
    }
    
    disableEscapeKey() {
        this.config.escapeKeyEnabled = false;
    }
    
    enableFocusTrap() {
        this.config.focusTrap = true;
    }
    
    disableFocusTrap() {
        this.config.focusTrap = false;
    }
}