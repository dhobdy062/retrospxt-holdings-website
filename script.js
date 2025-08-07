// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// Initialize all website functionality
function initializeWebsite() {
    setupNavigation();
    setupScrollEffects();
    setupAnimations();
    setupForms();
    setupModals();
    setupMobileMenu();
}

// Navigation functionality
function setupNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(10, 22, 40, 0.95)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = 'rgba(10, 22, 40, 0.8)';
            navbar.style.boxShadow = 'none';
        }
    });
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Update active nav link
                updateActiveNavLink(targetId);
                
                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });
    
    // Update active nav link on scroll
    window.addEventListener('scroll', updateActiveNavLinkOnScroll);
}

// Update active navigation link
function updateActiveNavLink(activeId) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === activeId) {
            link.classList.add('active');
        }
    });
}

// Update active nav link based on scroll position
function updateActiveNavLinkOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = '#' + section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            updateActiveNavLink(sectionId);
        }
    });
}

// Mobile menu functionality
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
}

function toggleMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.getElementById('hamburger');
    
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function closeMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.getElementById('hamburger');
    
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
}

// Scroll effects and animations
function setupScrollEffects() {
    // Parallax effect for hero background
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroBackground = document.querySelector('.hero-background');
        
        if (heroBackground) {
            const rate = scrolled * -0.5;
            heroBackground.style.transform = `translateY(${rate}px)`;
        }
    });
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .community-benefit, .stat-card, .feature-item');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Setup animations
function setupAnimations() {
    // Add CSS for fade-in animation
    const style = document.createElement('style');
    style.textContent = `
        .service-card, .community-benefit, .stat-card, .feature-item {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }
        
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        .nav-menu.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(10, 22, 40, 0.95);
            backdrop-filter: blur(20px);
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            padding: 1rem;
            gap: 1rem;
        }
        
        .hamburger.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    `;
    document.head.appendChild(style);
    
    // Stagger animation for service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
    });
}

// Modal functionality
function setupModals() {
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="block"]');
            if (openModal) {
                closeModal(openModal.id);
            }
        }
    });
}

// Open modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Focus first input in modal
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Form handling
function setupForms() {
    // Newsletter signup form
    const newsletterForm = document.getElementById('newsletter-signup');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
    
    // Schedule consultation form
    const scheduleForm = document.getElementById('schedule-form');
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', handleScheduleSubmit);
    }
    
    // Community signup form
    const communityForm = document.getElementById('community-form');
    if (communityForm) {
        communityForm.addEventListener('submit', handleCommunitySubmit);
    }
    
    // Form validation and styling
    setupFormValidation();
}

// Newsletter form submission
function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email') || document.getElementById('email').value;
    const company = formData.get('company') || document.getElementById('company').value;
    
    // Simulate form submission
    showFormSuccess('Thank you for subscribing to "The Priceless & The Pointless"! You\'ll receive our weekly insights soon.');
    
    // Reset form
    e.target.reset();
    
    // Log for demo purposes
    console.log('Newsletter Signup:', { email, company });
}

// Schedule consultation form submission
function handleScheduleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name') || document.getElementById('name').value,
        email: formData.get('email') || document.getElementById('contact-email').value,
        company: formData.get('company') || document.getElementById('company-name').value,
        phone: formData.get('phone') || document.getElementById('phone').value,
        service: formData.get('service') || document.getElementById('service-interest').value,
        message: formData.get('message') || document.getElementById('message').value
    };
    
    // Simulate form submission
    showFormSuccess('Thank you for your interest! We\'ll contact you within 24 hours to schedule your consultation.');
    
    // Close modal and reset form
    closeModal('schedule-modal');
    e.target.reset();
    
    // Log for demo purposes
    console.log('Schedule Consultation:', data);
}

// Community signup form submission
function handleCommunitySubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name') || document.getElementById('member-name').value,
        email: formData.get('email') || document.getElementById('member-email').value,
        company: formData.get('company') || document.getElementById('member-company').value,
        businessSize: formData.get('businessSize') || document.getElementById('business-size').value,
        aiExperience: formData.get('aiExperience') || document.getElementById('ai-experience').value,
        newsletterOptIn: formData.get('newsletterOptIn') || document.getElementById('newsletter-opt-in').checked
    };
    
    // Simulate form submission
    showFormSuccess('Welcome to our community! Check your email for next steps and access to our exclusive resources.');
    
    // Close modal and reset form
    closeModal('community-modal');
    e.target.reset();
    
    // Log for demo purposes
    console.log('Community Signup:', data);
}

// Show form success message
function showFormSuccess(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles for notification
    const style = document.createElement('style');
    style.textContent = `
        .success-notification {
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
            z-index: 3000;
            animation: slideInRight 0.3s ease, fadeOut 0.3s ease 4.7s;
            max-width: 400px;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Form validation setup
function setupFormValidation() {
    const inputs = document.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

// Validate individual field
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Remove existing error
    clearFieldError(e);
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Phone validation (basic)
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
    }
    
    return true;
}

// Show field error
function showFieldError(field, message) {
    field.style.borderColor = '#EF4444';
    
    // Create error message if it doesn't exist
    let errorMsg = field.parentNode.querySelector('.field-error');
    if (!errorMsg) {
        errorMsg = document.createElement('div');
        errorMsg.className = 'field-error';
        errorMsg.style.cssText = `
            color: #EF4444;
            font-size: 0.75rem;
            margin-top: 0.25rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        `;
        field.parentNode.appendChild(errorMsg);
    }
    
    errorMsg.textContent = message;
}

// Clear field error
function clearFieldError(e) {
    const field = e.target;
    field.style.borderColor = '';
    
    const errorMsg = field.parentNode.querySelector('.field-error');
    if (errorMsg) {
        errorMsg.remove();
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add scroll to top button
function addScrollToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'scroll-to-top';
    button.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #007BFF, #00D4FF);
        color: white;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
    `;
    
    button.addEventListener('click', scrollToTop);
    document.body.appendChild(button);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', debounce(() => {
        if (window.scrollY > 500) {
            button.style.opacity = '1';
            button.style.visibility = 'visible';
        } else {
            button.style.opacity = '0';
            button.style.visibility = 'hidden';
        }
    }, 100));
}

// Initialize scroll to top button
document.addEventListener('DOMContentLoaded', addScrollToTopButton);

// Performance optimization: Lazy load images
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Analytics and tracking (placeholder)
function trackEvent(eventName, eventData) {
    // Placeholder for analytics tracking
    console.log('Event tracked:', eventName, eventData);
    
    // Example: Google Analytics 4
    // gtag('event', eventName, eventData);
    
    // Example: Facebook Pixel
    // fbq('track', eventName, eventData);
}

// Track form submissions
document.addEventListener('submit', function(e) {
    const formId = e.target.id;
    trackEvent('form_submit', { form_id: formId });
});

// Track button clicks
document.addEventListener('click', function(e) {
    if (e.target.matches('.btn-primary, .btn-secondary')) {
        const buttonText = e.target.textContent.trim();
        trackEvent('button_click', { button_text: buttonText });
    }
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // You could send this to an error tracking service
});

// Service Worker registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Uncomment when you have a service worker file
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}

// Export functions for global access (browser compatible)
if (typeof window !== 'undefined') {
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.scrollToTop = scrollToTop;
}

