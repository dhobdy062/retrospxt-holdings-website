/**
 * Mobile Menu Module
 * Handles mobile navigation functionality
 */

class MobileMenuModule {
    constructor(app) {
        this.app = app;
        this.config = {
            breakpoint: 768,
            animationDuration: 300,
            overlayOpacity: 0.5,
            swipeThreshold: 50
        };
        
        this.state = {
            isOpen: false,
            isAnimating: false,
            isMobile: false,
            touchStartX: 0,
            touchStartY: 0
        };
        
        this.init();
    }
    
    init() {
        this.checkMobileState();
        this.bindEvents();
        this.setupAccessibility();
    }
    
    /**
     * Check if we're in mobile view
     */
    checkMobileState() {
        this.state.isMobile = window.innerWidth <= this.config.breakpoint;
        
        if (!this.state.isMobile && this.state.isOpen) {
            this.close(false); // Close without animation on desktop
        }
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Hamburger button click
        if (this.app.elements.hamburger) {
            this.app.elements.hamburger.addEventListener('click', this.toggle.bind(this));
        }
        
        // Navigation link clicks
        this.app.elements.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.state.isMobile && this.state.isOpen) {
                    this.close();
                }
            });
        });
        
        // Window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Escape key
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Touch events for swipe gestures
        if (this.app.elements.navMenu) {
            this.app.elements.navMenu.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
            this.app.elements.navMenu.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
            this.app.elements.navMenu.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        }
        
        // Click outside to close
        document.addEventListener('click', this.handleOutsideClick.bind(this));
    }
    
    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        if (this.app.elements.hamburger) {
            this.app.elements.hamburger.setAttribute('aria-label', 'Toggle navigation menu');
            this.app.elements.hamburger.setAttribute('aria-expanded', 'false');
            this.app.elements.hamburger.setAttribute('aria-controls', 'nav-menu');
        }
        
        if (this.app.elements.navMenu) {
            this.app.elements.navMenu.setAttribute('aria-hidden', 'true');
        }
    }
    
    /**
     * Toggle menu open/close
     */
    toggle() {
        if (this.state.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    /**
     * Open mobile menu
     */
    async open() {
        if (this.state.isOpen || this.state.isAnimating || !this.state.isMobile) {
            return;
        }
        
        this.state.isAnimating = true;
        this.state.isOpen = true;
        
        // Update app state
        this.app.state.isMobileMenuOpen = true;
        
        // Prepare menu for animation
        this.prepareMenuOpen();
        
        // Animate menu in
        await this.animateMenuIn();
        
        // Setup focus management
        this.setupMenuFocus();
        
        // Update accessibility attributes
        this.updateAccessibilityOpen();
        
        this.state.isAnimating = false;
        
        // Dispatch event
        this.dispatchMenuEvent('mobileMenuOpened');
    }
    
    /**
     * Close mobile menu
     */
    async close(animate = true) {
        if (!this.state.isOpen || this.state.isAnimating) {
            return;
        }
        
        this.state.isAnimating = true;
        this.state.isOpen = false;
        
        // Update app state
        this.app.state.isMobileMenuOpen = false;
        
        if (animate) {
            // Animate menu out
            await this.animateMenuOut();
        }
        
        // Clean up menu
        this.cleanupMenuClose();
        
        // Update accessibility attributes
        this.updateAccessibilityClosed();
        
        this.state.isAnimating = false;
        
        // Dispatch event
        this.dispatchMenuEvent('mobileMenuClosed');
    }
    
    /**
     * Prepare menu for opening animation
     */
    prepareMenuOpen() {
        const { navMenu, hamburger } = this.app.elements;
        
        // Show menu
        navMenu.style.display = 'flex';
        navMenu.style.transform = 'translateX(-100%)';
        navMenu.style.opacity = '0';
        
        // Animate hamburger to X
        hamburger.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Add overlay
        this.createOverlay();
    }
    
    /**
     * Animate menu in
     */
    animateMenuIn() {
        return new Promise(resolve => {
            const { navMenu } = this.app.elements;
            
            requestAnimationFrame(() => {
                navMenu.style.transition = `transform ${this.config.animationDuration}ms ease, opacity ${this.config.animationDuration}ms ease`;
                navMenu.style.transform = 'translateX(0)';
                navMenu.style.opacity = '1';
                
                setTimeout(resolve, this.config.animationDuration);
            });
        });
    }
    
    /**
     * Animate menu out
     */
    animateMenuOut() {
        return new Promise(resolve => {
            const { navMenu } = this.app.elements;
            
            navMenu.style.transition = `transform ${this.config.animationDuration}ms ease, opacity ${this.config.animationDuration}ms ease`;
            navMenu.style.transform = 'translateX(-100%)';
            navMenu.style.opacity = '0';
            
            setTimeout(() => {
                navMenu.style.display = 'none';
                resolve();
            }, this.config.animationDuration);
        });
    }
    
    /**
     * Clean up after closing
     */
    cleanupMenuClose() {
        const { navMenu, hamburger } = this.app.elements;
        
        // Reset menu styles
        navMenu.style.transition = '';
        navMenu.style.transform = '';
        navMenu.style.opacity = '';
        
        // Reset hamburger
        hamburger.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Remove overlay
        this.removeOverlay();
    }
    
    /**
     * Create overlay
     */
    createOverlay() {
        if (document.querySelector('.mobile-menu-overlay')) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, ${this.config.overlayOpacity});
            z-index: 998;
            opacity: 0;
            transition: opacity ${this.config.animationDuration}ms ease;
        `;
        
        document.body.appendChild(overlay);
        
        // Animate in
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });
        
        // Click to close
        overlay.addEventListener('click', this.close.bind(this));
    }
    
    /**
     * Remove overlay
     */
    removeOverlay() {
        const overlay = document.querySelector('.mobile-menu-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, this.config.animationDuration);
        }
    }
    
    /**
     * Setup focus management for open menu
     */
    setupMenuFocus() {
        const firstLink = this.app.elements.navMenu.querySelector('.nav-link');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
    }
    
    /**
     * Update accessibility attributes for open state
     */
    updateAccessibilityOpen() {
        const { hamburger, navMenu } = this.app.elements;
        
        if (hamburger) {
            hamburger.setAttribute('aria-expanded', 'true');
            hamburger.setAttribute('aria-label', 'Close navigation menu');
        }
        
        if (navMenu) {
            navMenu.setAttribute('aria-hidden', 'false');
        }
    }
    
    /**
     * Update accessibility attributes for closed state
     */
    updateAccessibilityClosed() {
        const { hamburger, navMenu } = this.app.elements;
        
        if (hamburger) {
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.setAttribute('aria-label', 'Open navigation menu');
        }
        
        if (navMenu) {
            navMenu.setAttribute('aria-hidden', 'true');
        }
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Debounce resize events
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.checkMobileState();
        }, 100);
    }
    
    /**
     * Handle keydown events
     */
    handleKeydown(event) {
        if (!this.state.isOpen) return;
        
        switch (event.key) {
            case 'Escape':
                event.preventDefault();
                this.close();
                break;
                
            case 'Tab':
                this.handleTabNavigation(event);
                break;
        }
    }
    
    /**
     * Handle tab navigation within menu
     */
    handleTabNavigation(event) {
        const focusableElements = this.app.elements.navMenu.querySelectorAll(
            'a, button, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }
    
    /**
     * Handle outside clicks
     */
    handleOutsideClick(event) {
        if (!this.state.isOpen || !this.state.isMobile) return;
        
        const { navMenu, hamburger } = this.app.elements;
        
        if (!navMenu.contains(event.target) && !hamburger.contains(event.target)) {
            this.close();
        }
    }
    
    /**
     * Handle touch start for swipe gestures
     */
    handleTouchStart(event) {
        this.state.touchStartX = event.touches[0].clientX;
        this.state.touchStartY = event.touches[0].clientY;
    }
    
    /**
     * Handle touch move for swipe gestures
     */
    handleTouchMove(event) {
        if (!this.state.isOpen) return;
        
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;
        
        const deltaX = touchX - this.state.touchStartX;
        const deltaY = Math.abs(touchY - this.state.touchStartY);
        
        // If horizontal swipe is more significant than vertical
        if (Math.abs(deltaX) > deltaY) {
            // Prevent default scrolling
            event.preventDefault();
            
            // Apply transform based on swipe
            if (deltaX < 0) {
                const progress = Math.min(Math.abs(deltaX) / 200, 1);
                this.app.elements.navMenu.style.transform = `translateX(${deltaX}px)`;
                this.app.elements.navMenu.style.opacity = 1 - (progress * 0.5);
            }
        }
    }
    
    /**
     * Handle touch end for swipe gestures
     */
    handleTouchEnd(event) {
        if (!this.state.isOpen) return;
        
        const touchX = event.changedTouches[0].clientX;
        const deltaX = touchX - this.state.touchStartX;
        
        // Reset transform
        this.app.elements.navMenu.style.transform = '';
        this.app.elements.navMenu.style.opacity = '';
        
        // Close if swiped left enough
        if (deltaX < -this.config.swipeThreshold) {
            this.close();
        }
    }
    
    /**
     * Dispatch menu events
     */
    dispatchMenuEvent(eventType) {
        const event = new CustomEvent(eventType, {
            detail: { isOpen: this.state.isOpen },
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * Public API methods
     */
    isOpen() {
        return this.state.isOpen;
    }
    
    isMobile() {
        return this.state.isMobile;
    }
    
    setBreakpoint(breakpoint) {
        this.config.breakpoint = breakpoint;
        this.checkMobileState();
    }
}