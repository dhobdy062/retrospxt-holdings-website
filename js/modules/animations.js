/**
 * Animations Module
 * Handles general animations and transitions
 */

class AnimationsModule {
    constructor(app) {
        this.app = app;
        this.config = {
            defaultDuration: 300,
            defaultEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            staggerDelay: 100
        };
        
        this.animationQueue = [];
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        this.setupAnimationClasses();
        this.bindEvents();
    }
    
    bindEvents() {
        // Listen for custom animation events
        document.addEventListener('triggerAnimation', this.handleAnimationTrigger.bind(this));
        
        // Handle reduced motion preference
        this.handleReducedMotion();
    }
    
    /**
     * Setup CSS animation classes
     */
    setupAnimationClasses() {
        const style = document.createElement('style');
        style.textContent = `
            .fade-in {
                opacity: 0;
                transition: opacity ${this.config.defaultDuration}ms ${this.config.defaultEasing};
            }
            
            .fade-in.active {
                opacity: 1;
            }
            
            .slide-up {
                transform: translateY(30px);
                opacity: 0;
                transition: transform ${this.config.defaultDuration}ms ${this.config.defaultEasing}, 
                           opacity ${this.config.defaultDuration}ms ${this.config.defaultEasing};
            }
            
            .slide-up.active {
                transform: translateY(0);
                opacity: 1;
            }
            
            .slide-in-left {
                transform: translateX(-30px);
                opacity: 0;
                transition: transform ${this.config.defaultDuration}ms ${this.config.defaultEasing}, 
                           opacity ${this.config.defaultDuration}ms ${this.config.defaultEasing};
            }
            
            .slide-in-left.active {
                transform: translateX(0);
                opacity: 1;
            }
            
            .slide-in-right {
                transform: translateX(30px);
                opacity: 0;
                transition: transform ${this.config.defaultDuration}ms ${this.config.defaultEasing}, 
                           opacity ${this.config.defaultDuration}ms ${this.config.defaultEasing};
            }
            
            .slide-in-right.active {
                transform: translateX(0);
                opacity: 1;
            }
            
            .scale-in {
                transform: scale(0.9);
                opacity: 0;
                transition: transform ${this.config.defaultDuration}ms ${this.config.defaultEasing}, 
                           opacity ${this.config.defaultDuration}ms ${this.config.defaultEasing};
            }
            
            .scale-in.active {
                transform: scale(1);
                opacity: 1;
            }
            
            .bounce-in {
                transform: scale(0.3);
                opacity: 0;
                transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55), 
                           opacity 0.6s ease;
            }
            
            .bounce-in.active {
                transform: scale(1);
                opacity: 1;
            }
            
            @media (prefers-reduced-motion: reduce) {
                .fade-in, .slide-up, .slide-in-left, .slide-in-right, .scale-in, .bounce-in {
                    transition: none !important;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Handle animation trigger events
     */
    handleAnimationTrigger(event) {
        const { element, type, delay = 0 } = event.detail;
        
        if (delay > 0) {
            setTimeout(() => this.animate(element, type), delay);
        } else {
            this.animate(element, type);
        }
    }
    
    /**
     * Animate element with specified type
     */
    animate(element, type = 'fade-in') {
        if (!element) return;
        
        // Add animation class
        element.classList.add(type);
        
        // Trigger animation
        requestAnimationFrame(() => {
            element.classList.add('active');
        });
        
        return new Promise(resolve => {
            const handleTransitionEnd = () => {
                element.removeEventListener('transitionend', handleTransitionEnd);
                resolve(element);
            };
            
            element.addEventListener('transitionend', handleTransitionEnd);
        });
    }
    
    /**
     * Animate multiple elements with stagger effect
     */
    staggerAnimate(elements, type = 'fade-in', delay = this.config.staggerDelay) {
        const promises = [];
        
        elements.forEach((element, index) => {
            const staggerDelay = index * delay;
            
            const promise = new Promise(resolve => {
                setTimeout(() => {
                    this.animate(element, type).then(resolve);
                }, staggerDelay);
            });
            
            promises.push(promise);
        });
        
        return Promise.all(promises);
    }
    
    /**
     * Fade transition between elements
     */
    fadeTransition(fromElement, toElement, duration = this.config.defaultDuration) {
        return new Promise(resolve => {
            // Fade out current element
            fromElement.style.transition = `opacity ${duration}ms ${this.config.defaultEasing}`;
            fromElement.style.opacity = '0';
            
            setTimeout(() => {
                // Hide current and show new
                fromElement.style.display = 'none';
                toElement.style.display = 'block';
                toElement.style.opacity = '0';
                
                // Fade in new element
                requestAnimationFrame(() => {
                    toElement.style.transition = `opacity ${duration}ms ${this.config.defaultEasing}`;
                    toElement.style.opacity = '1';
                    
                    setTimeout(resolve, duration);
                });
            }, duration);
        });
    }
    
    /**
     * Slide transition between elements
     */
    slideTransition(fromElement, toElement, direction = 'left', duration = this.config.defaultDuration) {
        const slideDistance = direction === 'left' ? '-100%' : '100%';
        
        return new Promise(resolve => {
            // Setup initial states
            toElement.style.transform = `translateX(${direction === 'left' ? '100%' : '-100%'})`;
            toElement.style.display = 'block';
            
            // Animate out current element
            fromElement.style.transition = `transform ${duration}ms ${this.config.defaultEasing}`;
            fromElement.style.transform = `translateX(${slideDistance})`;
            
            // Animate in new element
            toElement.style.transition = `transform ${duration}ms ${this.config.defaultEasing}`;
            
            requestAnimationFrame(() => {
                toElement.style.transform = 'translateX(0)';
            });
            
            setTimeout(() => {
                fromElement.style.display = 'none';
                fromElement.style.transform = 'translateX(0)';
                resolve();
            }, duration);
        });
    }
    
    /**
     * Pulse animation for attention
     */
    pulse(element, intensity = 1.1, duration = 600) {
        const originalTransform = element.style.transform;
        
        element.style.transition = `transform ${duration / 2}ms ease-out`;
        element.style.transform = `${originalTransform} scale(${intensity})`;
        
        setTimeout(() => {
            element.style.transform = originalTransform;
        }, duration / 2);
    }
    
    /**
     * Shake animation for errors
     */
    shake(element, intensity = 10, duration = 600) {
        const originalTransform = element.style.transform;
        let startTime = null;
        
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                const displacement = Math.sin(progress * Math.PI * 4) * intensity * (1 - progress);
                element.style.transform = `${originalTransform} translateX(${displacement}px)`;
                requestAnimationFrame(animate);
            } else {
                element.style.transform = originalTransform;
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * Handle reduced motion preference
     */
    handleReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            this.config.defaultDuration = 0;
            this.config.staggerDelay = 0;
        }
    }
    
    /**
     * Queue animation for sequential execution
     */
    queueAnimation(animationFn) {
        this.animationQueue.push(animationFn);
        
        if (!this.isAnimating) {
            this.processQueue();
        }
    }
    
    /**
     * Process animation queue
     */
    async processQueue() {
        if (this.animationQueue.length === 0) {
            this.isAnimating = false;
            return;
        }
        
        this.isAnimating = true;
        const nextAnimation = this.animationQueue.shift();
        
        try {
            await nextAnimation();
        } catch (error) {
            console.error('Animation error:', error);
        }
        
        this.processQueue();
    }
    
    /**
     * Public API methods
     */
    fadeIn(element, duration) {
        return this.animate(element, 'fade-in');
    }
    
    slideUp(element, duration) {
        return this.animate(element, 'slide-up');
    }
    
    slideInLeft(element, duration) {
        return this.animate(element, 'slide-in-left');
    }
    
    slideInRight(element, duration) {
        return this.animate(element, 'slide-in-right');
    }
    
    scaleIn(element, duration) {
        return this.animate(element, 'scale-in');
    }
    
    bounceIn(element, duration) {
        return this.animate(element, 'bounce-in');
    }
}

// Make AnimationsModule available globally
window.AnimationsModule = AnimationsModule;