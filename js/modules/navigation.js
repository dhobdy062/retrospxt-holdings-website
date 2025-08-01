/**
 * Navigation Module
 * Handles all navigation-related functionality
 */

class NavigationModule {
    constructor(app) {
        this.app = app;
        this.config = {
            scrollThreshold: app.config.navbarScrollThreshold,
            sectionOffset: app.config.sectionOffset
        };
        
        this.state = {
            isScrolled: false,
            activeSection: 'home'
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupScrollSpy();
    }
    
    bindEvents() {
        // Navbar scroll effect
        window.addEventListener('scroll', this.handleNavbarScroll.bind(this));
        
        // Navigation link clicks
        this.app.elements.navLinks.forEach(link => {
            link.addEventListener('click', this.handleNavClick.bind(this));
        });
        
        // Scroll spy for active section highlighting
        window.addEventListener('scroll', this.updateActiveSection.bind(this));
    }
    
    /**
     * Handle navbar appearance on scroll
     */
    handleNavbarScroll() {
        const scrollY = window.scrollY;
        const shouldBeScrolled = scrollY > this.config.scrollThreshold;
        
        if (shouldBeScrolled !== this.state.isScrolled) {
            this.state.isScrolled = shouldBeScrolled;
            this.updateNavbarAppearance();
        }
    }
    
    /**
     * Update navbar visual state
     */
    updateNavbarAppearance() {
        const { navbar } = this.app.elements;
        
        if (this.state.isScrolled) {
            navbar.style.background = 'rgba(10, 22, 40, 0.95)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
            navbar.classList.add('scrolled');
        } else {
            navbar.style.background = 'rgba(10, 22, 40, 0.8)';
            navbar.style.boxShadow = 'none';
            navbar.classList.remove('scrolled');
        }
    }
    
    /**
     * Handle navigation link clicks
     */
    handleNavClick(event) {
        event.preventDefault();
        
        const targetId = event.currentTarget.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            this.scrollToSection(targetSection, targetId);
        }
    }
    
    /**
     * Smooth scroll to section
     */
    scrollToSection(targetSection, targetId) {
        const offsetTop = targetSection.offsetTop - this.config.sectionOffset;
        
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
        
        // Update active state immediately for better UX
        this.setActiveNavLink(targetId);
        
        // Close mobile menu if open
        if (this.app.mobileMenu) {
            this.app.mobileMenu.close();
        }
        
        // Track navigation event
        this.trackNavigation(targetId);
    }
    
    /**
     * Setup scroll spy functionality
     */
    setupScrollSpy() {
        // Throttle scroll events for better performance
        this.throttledScrollSpy = this.throttle(this.updateActiveSection.bind(this), 100);
        window.addEventListener('scroll', this.throttledScrollSpy);
    }
    
    /**
     * Update active section based on scroll position
     */
    updateActiveSection() {
        const scrollPos = window.scrollY + this.config.sectionOffset + 50;
        let activeSection = 'home';
        
        this.app.elements.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                activeSection = sectionId;
            }
        });
        
        if (activeSection !== this.state.activeSection) {
            this.state.activeSection = activeSection;
            this.setActiveNavLink(`#${activeSection}`);
        }
    }
    
    /**
     * Set active navigation link
     */
    setActiveNavLink(activeId) {
        this.app.elements.navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === activeId;
            link.classList.toggle('active', isActive);
            
            // Update ARIA attributes for accessibility
            link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });
    }
    
    /**
     * Track navigation events
     */
    trackNavigation(targetId) {
        // Analytics tracking could go here
        console.log(`Navigation to: ${targetId}`);
    }
    
    /**
     * Throttle function for performance
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    /**
     * Public API methods
     */
    navigateTo(sectionId) {
        const targetSection = document.querySelector(sectionId);
        if (targetSection) {
            this.scrollToSection(targetSection, sectionId);
        }
    }
    
    getCurrentSection() {
        return this.state.activeSection;
    }
    
    isNavbarScrolled() {
        return this.state.isScrolled;
    }
}

// Make NavigationModule available globally
window.NavigationModule = NavigationModule;