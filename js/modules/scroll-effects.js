/**
 * Scroll Effects Module
 * Handles parallax effects and scroll-triggered animations
 */

class ScrollEffectsModule {
    constructor(app) {
        this.app = app;
        this.config = {
            parallaxRate: app.config.parallaxRate,
            animationDelay: app.config.animationDelay
        };
        
        this.state = {
            isParallaxEnabled: true,
            lastScrollY: 0,
            ticking: false
        };
        
        this.init();
    }
    
    init() {
        this.setupParallax();
        this.setupScrollAnimations();
        this.bindEvents();
    }
    
    bindEvents() {
        // Use requestAnimationFrame for smooth animations
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        // Disable parallax on mobile for better performance
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Check initial state
        this.handleResize();
    }
    
    /**
     * Handle scroll events with RAF optimization
     */
    handleScroll() {
        this.state.lastScrollY = window.scrollY;
        
        if (!this.state.ticking) {
            requestAnimationFrame(this.updateScrollEffects.bind(this));
            this.state.ticking = true;
        }
    }
    
    /**
     * Update all scroll effects
     */
    updateScrollEffects() {
        if (this.state.isParallaxEnabled) {
            this.updateParallax();
        }
        
        this.state.ticking = false;
    }
    
    /**
     * Setup parallax effect
     */
    setupParallax() {
        const { heroBackground } = this.app.elements;
        
        if (heroBackground) {
            this.parallaxElement = heroBackground;
        }
    }
    
    /**
     * Update parallax position
     */
    updateParallax() {
        if (!this.parallaxElement) return;
        
        const scrolled = this.state.lastScrollY;
        const parallaxValue = scrolled * this.config.parallaxRate;
        
        this.parallaxElement.style.transform = `translate3d(0, ${parallaxValue}px, 0)`;
    }
    
    /**
     * Setup scroll-triggered animations using Intersection Observer
     */
    setupScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '-10% 0px -10% 0px',
            threshold: [0, 0.1, 0.5, 1]
        };
        
        this.animationObserver = new IntersectionObserver(
            this.handleIntersection.bind(this),
            observerOptions
        );
        
        // Observe elements that should animate on scroll
        this.app.elements.animateElements.forEach(element => {
            this.animationObserver.observe(element);
            
            // Add initial state
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });
        
        // Store observer for cleanup
        this.app.observers.set('scrollAnimations', this.animationObserver);
    }
    
    /**
     * Handle intersection observer entries
     */
    handleIntersection(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add staggered animation delay
                const delay = index * this.config.animationDelay;
                
                setTimeout(() => {
                    this.animateElement(entry.target);
                }, delay);
                
                // Stop observing once animated
                this.animationObserver.unobserve(entry.target);
            }
        });
    }
    
    /**
     * Animate element into view
     */
    animateElement(element) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        
        // Add animated class for additional CSS animations
        element.classList.add('animated');
        
        // Trigger custom animation event
        element.dispatchEvent(new CustomEvent('elementAnimated', {
            detail: { element }
        }));
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Disable parallax on mobile devices for better performance
        const isMobile = window.innerWidth <= 768;
        this.state.isParallaxEnabled = !isMobile;
        
        if (isMobile && this.parallaxElement) {
            // Reset parallax transform on mobile
            this.parallaxElement.style.transform = 'none';
        }
    }
    
    /**
     * Scroll to top functionality
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    /**
     * Get current scroll progress (0-1)
     */
    getScrollProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        return Math.min(scrollTop / docHeight, 1);
    }
    
    /**
     * Check if element is in viewport
     */
    isElementInViewport(element, threshold = 0) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        return (
            rect.top <= windowHeight * (1 - threshold) &&
            rect.bottom >= windowHeight * threshold
        );
    }
    
    /**
     * Public API methods
     */
    enableParallax() {
        this.state.isParallaxEnabled = true;
    }
    
    disableParallax() {
        this.state.isParallaxEnabled = false;
        if (this.parallaxElement) {
            this.parallaxElement.style.transform = 'none';
        }
    }
    
    /**
     * Cleanup
     */
    destroy() {
        if (this.animationObserver) {
            this.animationObserver.disconnect();
        }
        
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    }
}

// Make ScrollEffectsModule available globally
window.ScrollEffectsModule = ScrollEffectsModule;