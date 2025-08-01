/**
 * Forms Module
 * Handles form validation, submission, and user feedback
 */

class FormsModule {
    constructor(app) {
        this.app = app;
        this.config = {
            validateOnInput: true,
            validateOnBlur: true,
            showSuccessMessages: true,
            autoHideMessages: true,
            messageTimeout: 5000
        };
        
        this.state = {
            submittingForms: new Set(),
            validationRules: new Map(),
            formData: new Map()
        };
        
        this.init();
    }
    
    init() {
        this.setupValidationRules();
        this.bindEvents();
        this.setupForms();
    }
    
    /**
     * Setup validation rules for different field types
     */
    setupValidationRules() {
        this.state.validationRules.set('email', {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        });
        
        this.state.validationRules.set('phone', {
            pattern: /^[\+]?[1-9][\d]{0,2}[\s\-\(\)]*[\d\s\-\(\)]{7,}$/,
            message: 'Please enter a valid phone number'
        });
        
        this.state.validationRules.set('required', {
            validate: (value) => value && value.trim().length > 0,
            message: 'This field is required'
        });
        
        this.state.validationRules.set('minLength', {
            validate: (value, minLength) => value && value.length >= minLength,
            message: (minLength) => `Minimum ${minLength} characters required`
        });
        
        this.state.validationRules.set('maxLength', {
            validate: (value, maxLength) => !value || value.length <= maxLength,
            message: (maxLength) => `Maximum ${maxLength} characters allowed`
        });
    }
    
    /**
     * Bind form events
     */
    bindEvents() {
        // Form submission events
        this.app.elements.forms.forEach(form => {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        });
        
        // Input validation events
        if (this.config.validateOnInput || this.config.validateOnBlur) {
            document.addEventListener('input', this.handleInputValidation.bind(this));
            document.addEventListener('blur', this.handleBlurValidation.bind(this), true);
        }
    }
    
    /**
     * Setup individual forms
     */
    setupForms() {
        // Newsletter form
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            this.setupNewsletterForm(newsletterForm);
        }
        
        // Consultation form
        const consultationForm = document.getElementById('consultation-form');
        if (consultationForm) {
            this.setupConsultationForm(consultationForm);
        }
        
        // Community form
        const communityForm = document.getElementById('community-form');
        if (communityForm) {
            this.setupCommunityForm(communityForm);
        }
    }
    
    /**
     * Setup newsletter form
     */
    setupNewsletterForm(form) {
        const emailInput = form.querySelector('input[type="email"]');
        
        if (emailInput) {
            emailInput.setAttribute('data-validate', 'required,email');
            emailInput.setAttribute('data-error-target', 'newsletter-error');
        }
    }
    
    /**
     * Setup consultation form
     */
    setupConsultationForm(form) {
        const nameInput = form.querySelector('input[name="name"]');
        const emailInput = form.querySelector('input[name="email"]');
        const phoneInput = form.querySelector('input[name="phone"]');
        const messageInput = form.querySelector('textarea[name="message"]');
        
        if (nameInput) {
            nameInput.setAttribute('data-validate', 'required,minLength:2');
        }
        
        if (emailInput) {
            emailInput.setAttribute('data-validate', 'required,email');
        }
        
        if (phoneInput) {
            phoneInput.setAttribute('data-validate', 'phone');
        }
        
        if (messageInput) {
            messageInput.setAttribute('data-validate', 'required,minLength:10,maxLength:1000');
        }
    }
    
    /**
     * Setup community form
     */
    setupCommunityForm(form) {
        const nameInput = form.querySelector('input[name="name"]');
        const emailInput = form.querySelector('input[name="email"]');
        
        if (nameInput) {
            nameInput.setAttribute('data-validate', 'required,minLength:2');
        }
        
        if (emailInput) {
            emailInput.setAttribute('data-validate', 'required,email');
        }
    }
    
    /**
     * Handle form submission
     */
    async handleFormSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formId = form.id;
        
        // Prevent double submission
        if (this.state.submittingForms.has(formId)) {
            return;
        }
        
        // Validate form
        const isValid = this.validateForm(form);
        if (!isValid) {
            this.showFormMessage(form, 'Please correct the errors below', 'error');
            return;
        }
        
        // Mark as submitting
        this.state.submittingForms.add(formId);
        this.setFormSubmitting(form, true);
        
        try {
            // Get form data
            const formData = this.getFormData(form);
            
            // Submit form based on type
            let result;
            switch (formId) {
                case 'newsletter-form':
                    result = await this.submitNewsletterForm(formData);
                    break;
                case 'consultation-form':
                    result = await this.submitConsultationForm(formData);
                    break;
                case 'community-form':
                    result = await this.submitCommunityForm(formData);
                    break;
                default:
                    result = await this.submitGenericForm(formData, form);
            }
            
            // Handle success
            this.handleFormSuccess(form, result);
            
        } catch (error) {
            // Handle error
            this.handleFormError(form, error);
        } finally {
            // Reset submitting state
            this.state.submittingForms.delete(formId);
            this.setFormSubmitting(form, false);
        }
    }
    
    /**
     * Validate entire form
     */
    validateForm(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        let isValid = true;
        
        inputs.forEach(input => {
            const fieldValid = this.validateField(input);
            if (!fieldValid) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    /**
     * Validate individual field
     */
    validateField(input) {
        const validateAttr = input.getAttribute('data-validate');
        if (!validateAttr) return true;
        
        const rules = validateAttr.split(',');
        const value = input.value;
        
        for (const rule of rules) {
            const [ruleName, ruleParam] = rule.split(':');
            const validationRule = this.state.validationRules.get(ruleName.trim());
            
            if (!validationRule) continue;
            
            let isValid;
            let errorMessage;
            
            if (validationRule.pattern) {
                isValid = validationRule.pattern.test(value);
                errorMessage = validationRule.message;
            } else if (validationRule.validate) {
                isValid = validationRule.validate(value, ruleParam);
                errorMessage = typeof validationRule.message === 'function' 
                    ? validationRule.message(ruleParam)
                    : validationRule.message;
            }
            
            if (!isValid) {
                this.showFieldError(input, errorMessage);
                return false;
            }
        }
        
        this.clearFieldError(input);
        return true;
    }
    
    /**
     * Handle input validation
     */
    handleInputValidation(event) {
        if (!this.config.validateOnInput) return;
        
        const input = event.target;
        if (input.hasAttribute('data-validate')) {
            // Debounce validation
            clearTimeout(input._validationTimeout);
            input._validationTimeout = setTimeout(() => {
                this.validateField(input);
            }, 300);
        }
    }
    
    /**
     * Handle blur validation
     */
    handleBlurValidation(event) {
        if (!this.config.validateOnBlur) return;
        
        const input = event.target;
        if (input.hasAttribute('data-validate')) {
            this.validateField(input);
        }
    }
    
    /**
     * Show field error
     */
    showFieldError(input, message) {
        // Add error class
        input.classList.add('error');
        
        // Find or create error element
        let errorElement = input.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            input.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Update ARIA attributes
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', errorElement.id || 'field-error');
    }
    
    /**
     * Clear field error
     */
    clearFieldError(input) {
        input.classList.remove('error');
        
        const errorElement = input.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        
        // Update ARIA attributes
        input.setAttribute('aria-invalid', 'false');
        input.removeAttribute('aria-describedby');
    }
    
    /**
     * Get form data as object
     */
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }
    
    /**
     * Submit newsletter form
     */
    async submitNewsletterForm(data) {
        // Simulate API call
        await this.delay(1000);
        
        // In a real application, this would make an API call
        console.log('Newsletter subscription:', data);
        
        return {
            success: true,
            message: 'Thank you for subscribing to our newsletter!'
        };
    }
    
    /**
     * Submit consultation form
     */
    async submitConsultationForm(data) {
        // Simulate API call
        await this.delay(1500);
        
        console.log('Consultation request:', data);
        
        return {
            success: true,
            message: 'Your consultation request has been submitted. We\'ll contact you soon!'
        };
    }
    
    /**
     * Submit community form
     */
    async submitCommunityForm(data) {
        // Simulate API call
        await this.delay(1000);
        
        console.log('Community join request:', data);
        
        return {
            success: true,
            message: 'Welcome to our community! Check your email for next steps.'
        };
    }
    
    /**
     * Submit generic form
     */
    async submitGenericForm(data, form) {
        // Default form submission logic
        await this.delay(1000);
        
        return {
            success: true,
            message: 'Form submitted successfully!'
        };
    }
    
    /**
     * Handle form success
     */
    handleFormSuccess(form, result) {
        if (this.config.showSuccessMessages) {
            this.showFormMessage(form, result.message, 'success');
        }
        
        // Reset form
        form.reset();
        
        // Clear any existing errors
        const errorElements = form.querySelectorAll('.field-error');
        errorElements.forEach(el => el.style.display = 'none');
        
        const errorInputs = form.querySelectorAll('.error');
        errorInputs.forEach(input => input.classList.remove('error'));
        
        // Close modal if form is in modal
        const modal = form.closest('.modal');
        if (modal && this.app.modals) {
            setTimeout(() => this.app.modals.close(), 2000);
        }
        
        // Dispatch success event
        this.dispatchFormEvent('formSuccess', { form, result });
    }
    
    /**
     * Handle form error
     */
    handleFormError(form, error) {
        const message = error.message || 'An error occurred. Please try again.';
        this.showFormMessage(form, message, 'error');
        
        // Dispatch error event
        this.dispatchFormEvent('formError', { form, error });
    }
    
    /**
     * Show form message
     */
    showFormMessage(form, message, type = 'info') {
        // Find or create message element
        let messageElement = form.querySelector('.form-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'form-message';
            form.insertBefore(messageElement, form.firstChild);
        }
        
        messageElement.textContent = message;
        messageElement.className = `form-message ${type}`;
        messageElement.style.display = 'block';
        
        // Auto-hide message
        if (this.config.autoHideMessages) {
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, this.config.messageTimeout);
        }
    }
    
    /**
     * Set form submitting state
     */
    setFormSubmitting(form, isSubmitting) {
        const submitButton = form.querySelector('button[type="submit"]');
        
        if (submitButton) {
            submitButton.disabled = isSubmitting;
            
            if (isSubmitting) {
                submitButton.textContent = 'Submitting...';
                submitButton.classList.add('submitting');
            } else {
                // Restore original text
                const originalText = submitButton.getAttribute('data-original-text') || 'Submit';
                submitButton.textContent = originalText;
                submitButton.classList.remove('submitting');
            }
        }
        
        // Disable all form inputs
        const inputs = form.querySelectorAll('input, textarea, select, button');
        inputs.forEach(input => {
            if (input !== submitButton) {
                input.disabled = isSubmitting;
            }
        });
    }
    
    /**
     * Dispatch form events
     */
    dispatchFormEvent(eventType, detail) {
        const event = new CustomEvent(eventType, {
            detail,
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Public API methods
     */
    validateFormById(formId) {
        const form = document.getElementById(formId);
        return form ? this.validateForm(form) : false;
    }
    
    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            this.clearFormErrors(form);
        }
    }
    
    clearFormErrors(form) {
        const errorElements = form.querySelectorAll('.field-error');
        errorElements.forEach(el => el.style.display = 'none');
        
        const errorInputs = form.querySelectorAll('.error');
        errorInputs.forEach(input => input.classList.remove('error'));
    }
}

// Make FormsModule available globally
window.FormsModule = FormsModule;