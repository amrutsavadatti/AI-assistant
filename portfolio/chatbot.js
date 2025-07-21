// AI Chatbot JavaScript
class Chatbot {
    constructor() {
        this.isOpen = false;
        this.isTyping = false;
        this.messageHistory = [];
        this.apiEndpoint = 'YOUR_API_ENDPOINT_HERE'; // Replace with your actual API endpoint
        this.contactFormShown = false;
        this.userData = {};        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.showWelcomeNotification();
        this.addEntranceAnimation();
        this.bindContactFormEvents();
        this.contactFormShown = true; // Form is already in HTML
        this.initBubble();
    }
    
    bindEvents() {
        // Chat toggle
        const chatToggle = document.getElementById('chat-toggle');
        const chatClose = document.getElementById('chat-close');
        const chatContainer = document.getElementById('chat-container');
        
        chatToggle.addEventListener('click', () => {
            this.toggleChat();
        });
        
        // Add touch events for better mobile interaction
        chatToggle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            chatToggle.style.transform = 'scale(0.95)';
        });
        
        chatToggle.addEventListener('touchend', (e) => {
            e.preventDefault();
            chatToggle.style.transform = '';
            this.toggleChat();
        });
        
        chatClose.addEventListener('click', () => {
            this.closeChat();
        });
        
        // Send message
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');
        
        chatSend.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Add touch events for send button
        chatSend.addEventListener('touchstart', (e) => {
            e.preventDefault();
            chatSend.style.transform = 'scale(0.95)';
        });
        
        chatSend.addEventListener('touchend', (e) => {
            e.preventDefault();
            chatSend.style.transform = '';
            this.sendMessage();
        });
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize input
        chatInput.addEventListener('input', () => {
            this.autoResizeInput(chatInput);
        });
        
        // Handle input focus on mobile
        chatInput.addEventListener('focus', () => {
            if (window.innerWidth <= 768) {
                // Scroll to input on mobile
                setTimeout(() => {
                    chatInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });
        
        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.chat-widget') && this.isOpen) {
                this.closeChat();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.isOpen && window.innerWidth > 768) {
                document.body.classList.remove('chat-open');
            }
        });
        
        // Prevent zoom on double tap for mobile
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
    
    toggleChat() {
        const chatContainer = document.getElementById('chat-container');
        const notificationDot = document.getElementById('notification-dot');
        
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
            notificationDot.style.display = 'none';
        }
    }
    
    openChat() {
        const chatContainer = document.getElementById('chat-container');
        chatContainer.classList.add('active');
        this.isOpen = true;
        
        // Hide the bubble when chat opens
        this.hideBubble();
        
        // Prevent body scroll on mobile when chat is open
        if (window.innerWidth <= 768) {
            document.body.classList.add('chat-open');
        }
        
        // Focus on input
        setTimeout(() => {
            const chatInput = document.getElementById('chat-input');
            if (chatInput) {
                chatInput.focus();
            }
        }, 300);
        
        // Scroll to bottom
        this.scrollToBottom();
    }
    
    closeChat() {
        const chatContainer = document.getElementById('chat-container');
        chatContainer.classList.remove('active');
        this.isOpen = false;
        
        // Show the bubble again after a delay
        this.showBubbleAfterDelay(3000);
        
        // Re-enable body scroll on mobile
        if (window.innerWidth <= 768) {
            document.body.classList.remove('chat-open');
        }
    }
    
    async sendMessage() {
        console.log('🔵 sendMessage called');
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        console.log('📝 Message content:', message);
        console.log('⏳ isTyping:', this.isTyping);
        
        if (!message || this.isTyping) {
            console.log('❌ Returning early - no message or typing');
            return;
        }
        
        // Check if user is registered
        console.log('👤 User data:', this.userData);
        console.log('✅ User registered?', this.userData.isRegistered);
        
        if (!this.userData.isRegistered) {
            console.log('⚠️ User not registered, showing error message');
            this.addMessage('Please register first by providing your email address in the form above.', 'bot');
            return;
        }
        
        console.log('➡️ Proceeding with API call...');
        
        // Add user message to chat
        this.addMessage(message, 'user');
        chatInput.value = '';
        this.autoResizeInput(chatInput);
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Test if callAPI method exists
            console.log('🚀 About to call callAPI with message:', message);
            console.log('🔍 this.callAPI exists?', typeof this.callAPI);
            console.log('🔍 this object:', this);
            
            // Test method call first
            console.log('🧪 Testing simple method call...');
            
            // Call your API
            console.log('🔥 Calling this.callAPI now...');
            
            // Make API call to /api/chat?question={message} endpoint  
            console.log('🔥 Making API call to same-origin /api...');
            const url = `/api/chat?question=${encodeURIComponent(message)}`;
            console.log('🔥 Full URL:', url);
            console.log('🔥 Endpoint: /api/chat?question=' + encodeURIComponent(message));
            
            const apiResponse = await fetch(url, { 
                method: 'GET',
                credentials: 'include',  // Send cookies for authentication
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('🔥 API Response Status:', apiResponse.status);
            console.log('🔥 API Response OK?', apiResponse.ok);
            
            if (!apiResponse.ok) {
                throw new Error(`API request failed with status: ${apiResponse.status}`);
            }
            
            const apiData = await apiResponse.json();
            console.log('🔥 Full API Response:', apiData);
            
            // Extract the response field as per your expected format
            const response = apiData.response || 'No response field found';
            console.log('🎉 Extracted Response:', response);
            console.log('✅ API call completed, response:', response);
            this.hideTypingIndicator();
            
            // Add bot response
            this.addMessage(response, 'bot');
            
        } catch (error) {
            console.log('❌ API call failed:', error);
            console.log('❌ Error details:', error.message);
            console.log('❌ Error stack:', error.stack);
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again later.', 'bot');
            console.error('Chatbot API error:', error);
        }
    }
    
    
    addMessage(content, sender) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        if (sender === 'bot') {
            const img = document.createElement('img');
            img.src = 'clarity.JPG';
            img.alt = 'Clarity AI Assistant';
            img.className = 'bot-avatar-image';
            avatar.appendChild(img);
        } else {
            const icon = document.createElement('i');
            icon.className = 'bx bx-user';
            avatar.appendChild(icon);
        }
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Check if message contains Calendly link
        const calendlyLinkPattern = /https:\/\/calendly\.com\/amrutsavadatticareers\/30min/;
        const hasCalendlyLink = calendlyLinkPattern.test(content);
        
        if (hasCalendlyLink) {
            // Create message with button for Calendly
            this.createMessageWithCalendlyButton(messageContent, content);
        } else {
            // Regular message
            const messageText = document.createElement('p');
            messageText.textContent = content;
            messageContent.appendChild(messageText);
        }
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        chatMessages.appendChild(messageDiv);
        
        // Store in history
        this.messageHistory.push({
            role: sender,
            content: content,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 20 messages for context
        if (this.messageHistory.length > 20) {
            this.messageHistory = this.messageHistory.slice(-20);
        }
        
        // Scroll to bottom
        this.scrollToBottom();
    }
    
    createMessageWithCalendlyButton(messageContent, content) {
        // Split the content to separate the main message from the Calendly section
        const parts = content.split('📅 **For more in-depth discussion, let\'s meet!**');
        
        // Add the main message text
        if (parts[0]) {
            const mainText = document.createElement('p');
            mainText.textContent = parts[0].trim();
            messageContent.appendChild(mainText);
        }
        
        // Create the call-to-action section
        const ctaSection = document.createElement('div');
        ctaSection.className = 'calendly-cta-section';
        
        // Add the header
        const ctaHeader = document.createElement('h4');
        ctaHeader.className = 'calendly-cta-header';
        ctaHeader.innerHTML = '📅 <strong>For more in-depth discussion, let\'s meet!</strong>';
        ctaSection.appendChild(ctaHeader);
        
        // Add description
        const ctaDescription = document.createElement('p');
        ctaDescription.className = 'calendly-cta-description';
        ctaDescription.textContent = 'Schedule a 30-minute conversation with Amrut directly:';
        ctaSection.appendChild(ctaDescription);
        
        // Create the interactive button
        const calendlyButton = document.createElement('button');
        calendlyButton.className = 'calendly-button';
        calendlyButton.innerHTML = '📅 Schedule Meeting with Amrut';
        
        // Add click event to open Calendly
        calendlyButton.addEventListener('click', () => {
            window.open('https://calendly.com/amrutsavadatticareers/30min', '_blank');
        });
        
        ctaSection.appendChild(calendlyButton);
        
        // Add final message
        const finalMessage = document.createElement('p');
        finalMessage.className = 'calendly-final-message';
        finalMessage.textContent = 'Looking forward to connecting!';
        ctaSection.appendChild(finalMessage);
        
        messageContent.appendChild(ctaSection);
    }
    
    bindContactFormEvents() {
        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactFormSubmit();
            });
        }
    }
    
    showContactForm() {
        if (this.contactFormShown) return;
        
        // Form is already in HTML, just mark as shown
        this.contactFormShown = true;
        this.scrollToBottom();
    }
    
    async handleContactFormSubmit() {
        const nameInput = document.getElementById('contact-name');
        const emailInput = document.getElementById('contact-email');
        const companyInput = document.getElementById('contact-company');
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const company = companyInput.value.trim();
        
        if (!name || !email) {
            this.showFormError('Please fill in both name and email fields.');
            return;
        }
        
        if (!this.isValidEmail(email)) {
            this.showFormError('Please enter a valid email address.');
            return;
        }
        
        // Store user data
        this.userData = { name, email, company, isRegistered: false };
        
        // Make registration API call
        try {
            console.log('Starting registration process...');
            const registrationResult = await this.registerUser();
            console.log('Registration API call succeeded:', registrationResult);
            
            this.userData.isRegistered = true;
                    console.log('User data updated:', this.userData);
        
        // Hide form and show success message
        console.log('Hiding contact form...');
        
        // Safari debugging
        if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
            console.log('Safari detected - using enhanced OTP form handling');
        }
            this.hideContactForm();
            
            console.log('Adding success message...');
            
            // Check if verification is required
            if (registrationResult && registrationResult.verification_required) {
                // Show OTP verification form
                this.showOTPVerificationForm(registrationResult.message);
            } else {
                // Verification not required - returning user
                
                // Mark user as registered immediately for returning users
                this.userData.isRegistered = true;
                
                // Use the message from the server response
                let successMessage = registrationResult.message || `Thank you, ${name}! You're now registered and ready to chat. How can I help you today?`;
                
                this.addMessage(successMessage, 'bot');
                
                console.log('Registration completed - verification not required for returning user');
            }
            
            console.log('Registration process completed successfully');
        } catch (error) {
            console.error('Registration process failed at step:', error);
            console.error('Full error details:', error.stack);
            this.showFormError('Registration failed. Please try again.');
        }
    }
    
    async registerUser() {
        const { email, company, name } = this.userData;
        let url = `/api/register?email=${encodeURIComponent(email)}`;
        
        if (company) {
            url += `&company=${encodeURIComponent(company)}`;
        }
        
        if (name) {
            url += `&name=${encodeURIComponent(name)}`;
        }
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include'  // Enable cookies for registration
            });
            
            console.log('Registration response status:', response.status);
            
            if (!response.ok) {
                // For 429 errors, get the error message from response
                if (response.status === 429) {
                    const errorData = await response.json();
                    throw new Error(`429: ${errorData.detail}`);
                }
                throw new Error(`Registration failed with status: ${response.status}`);
            }
            
            // Try to parse as JSON, but handle if it's not JSON
            let data;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // If not JSON, get text response
                data = await response.text();
            }
            
            console.log('Registration successful:', data);
            return data;
        } catch (error) {
            console.error('Registration error details:', error);
            // Re-throw the error to be caught by handleContactFormSubmit
            throw error;
        }
    }

    showOTPVerificationForm(message) {
        console.log('Showing OTP verification form...');
        
        // Safari detection and debugging
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        console.log('Browser detected:', navigator.userAgent);
        console.log('Is Safari:', isSafari);
        
        // Hide contact form
        this.hideContactForm();
        
        // Create bot message with OTP form using DOM methods (Safari compatible)
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        // Create message avatar
        const messageAvatar = document.createElement('div');
        messageAvatar.className = 'message-avatar';
        const avatarImg = document.createElement('img');
        avatarImg.src = 'clarity.JPG';
        avatarImg.alt = 'Clarity AI Assistant';
        avatarImg.className = 'bot-avatar-image';
        messageAvatar.appendChild(avatarImg);
        
        // Create message content
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Create OTP verification container
        const otpContainer = document.createElement('div');
        otpContainer.className = 'otp-verification-container';
        
        // Create message paragraph
        const messagePara = document.createElement('p');
        messagePara.textContent = message;
        otpContainer.appendChild(messagePara);
        
        // Create OTP form
        const otpForm = document.createElement('form');
        otpForm.id = 'otp-form';
        otpForm.className = 'otp-form';
        
        // Create form group
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        // Create label
        const label = document.createElement('label');
        label.setAttribute('for', 'otp-input');
        label.textContent = 'Enter 6-digit verification code:';
        formGroup.appendChild(label);
        
        // Create OTP input
        const otpInput = document.createElement('input');
        otpInput.type = 'text';
        otpInput.id = 'otp-input';
        otpInput.placeholder = '123456';
        otpInput.maxLength = 6;
        otpInput.pattern = '[0-9]{6}';
        otpInput.required = true;
        formGroup.appendChild(otpInput);
        
        otpForm.appendChild(formGroup);
        
        // Create form actions
        const formActions = document.createElement('div');
        formActions.className = 'form-actions';
        
        // Create submit button
        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = 'btn-submit';
        submitBtn.textContent = 'Verify Code';
        formActions.appendChild(submitBtn);
        
        // Create resend button
        const resendBtn = document.createElement('button');
        resendBtn.type = 'button';
        resendBtn.className = 'btn-resend';
        resendBtn.textContent = 'Resend Code';
        formActions.appendChild(resendBtn);
        
        otpForm.appendChild(formActions);
        otpContainer.appendChild(otpForm);
        
        // Create error div
        const errorDiv = document.createElement('div');
        errorDiv.id = 'otp-error';
        errorDiv.className = 'error-message';
        errorDiv.style.display = 'none';
        otpContainer.appendChild(errorDiv);
        
        // Assemble the complete message
        messageContent.appendChild(otpContainer);
        messageDiv.appendChild(messageAvatar);
        messageDiv.appendChild(messageContent);
        
        // Add to chat messages
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        console.log('OTP form DOM elements created and added to chat');
        
        // Use setTimeout to ensure DOM is ready before adding event listeners (Safari fix)
        const timeoutDelay = isSafari ? 100 : 50; // Longer delay for Safari
        console.log(`Using timeout delay of ${timeoutDelay}ms for event listeners`);
        
        setTimeout(() => {
            try {
                // Add event listeners
                otpForm.addEventListener('submit', (e) => this.handleOTPSubmit(e));
                resendBtn.addEventListener('click', () => this.resendOTP());
                
                // Start initial 40-second cooldown for the resend button
                this.startResendCooldown(resendBtn);
                
                // Focus on OTP input with additional delay for Safari
                const focusDelay = isSafari ? 300 : 100; // Longer delay for Safari
                setTimeout(() => {
                    try {
                        if (document.getElementById('otp-input')) {
                            otpInput.focus();
                            console.log('OTP input focused successfully');
                        } else {
                            console.error('OTP input element not found in DOM');
                        }
                    } catch (error) {
                        console.warn('Could not focus OTP input:', error);
                    }
                }, focusDelay);
                
                console.log('OTP form event listeners attached successfully');
            } catch (error) {
                console.error('Error setting up OTP form:', error);
                // Safari fallback - try again with longer delay
                if (isSafari) {
                    console.log('Retrying OTP form setup for Safari...');
                    setTimeout(() => {
                        try {
                            otpForm.addEventListener('submit', (e) => this.handleOTPSubmit(e));
                            resendBtn.addEventListener('click', () => this.resendOTP());
                            this.startResendCooldown(resendBtn);
                            console.log('Safari OTP form setup retry successful');
                        } catch (retryError) {
                            console.error('Safari OTP form setup retry failed:', retryError);
                        }
                    }, 500);
                }
            }
        }, timeoutDelay);
    }
    
    async handleOTPSubmit(event) {
        event.preventDefault();
        
        const otpInput = document.getElementById('otp-input');
        const otp = otpInput.value.trim();
        
        if (!otp || otp.length !== 6) {
            this.showOTPError('Please enter a valid 6-digit code.');
            return;
        }
        
        try {
            console.log('Verifying OTP...');
            const verificationResult = await this.verifyOTP(otp);
            console.log('OTP verification successful:', verificationResult);
            
            // Mark user as registered
            this.userData.isRegistered = true;
            
            // Hide OTP form and show success message
            this.hideOTPForm();
            this.addMessage(verificationResult.message, 'bot');
            
            console.log('OTP verification process completed successfully');
        } catch (error) {
            console.error('OTP verification failed:', error);
            this.showOTPError('Invalid or expired code. Please try again.');
        }
    }
    
    async verifyOTP(otp) {
        const { email } = this.userData;
        let url = `/api/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                credentials: 'include'  // Enable cookies for verification
            });
            
            console.log('OTP verification response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Verification failed with status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('OTP verification successful:', data);
            return data;
        } catch (error) {
            console.error('OTP verification error details:', error);
            throw error;
        }
    }
    
    async resendOTP() {
        const resendBtn = document.querySelector('.btn-resend');
        
        try {
            console.log('Resending OTP...');
            
            // Disable button temporarily
            resendBtn.disabled = true;
            resendBtn.textContent = 'Sending...';
            
            const registrationResult = await this.registerUser();
            console.log('OTP resent successfully:', registrationResult);
            
            // Update the message in the form
            const otpContainer = document.querySelector('.otp-verification-container p');
            if (otpContainer) {
                otpContainer.textContent = registrationResult.message || 'New verification code sent to your email.';
            }
            
            // Clear the input field
            const otpInput = document.getElementById('otp-input');
            if (otpInput) {
                otpInput.value = '';
                otpInput.focus();
            }
            
            // Start 40-second cooldown
            this.startResendCooldown(resendBtn);
            
        } catch (error) {
            console.error('Failed to resend OTP:', error);
            
            // Check if it's a cooldown error (429)
            if (error.message && error.message.includes('429')) {
                // Extract remaining time from error message
                const timeMatch = error.message.match(/wait (\d+) seconds/);
                const remainingTime = timeMatch ? parseInt(timeMatch[1]) : 40;
                
                this.startResendCooldown(resendBtn, remainingTime);
                this.showOTPError(`Please wait ${remainingTime} seconds before requesting another code.`);
            } else {
                // Re-enable button for other errors
                resendBtn.disabled = false;
                resendBtn.textContent = 'Resend Code';
                this.showOTPError('Failed to resend code. Please try again.');
            }
        }
    }
    
    startResendCooldown(resendBtn, initialTime = 40) {
        let timeLeft = initialTime;
        resendBtn.disabled = true;
        
        const updateButton = () => {
            if (timeLeft > 0) {
                resendBtn.textContent = `Resend Code (${timeLeft}s)`;
                timeLeft--;
                setTimeout(updateButton, 1000);
            } else {
                resendBtn.disabled = false;
                resendBtn.textContent = 'Resend Code';
            }
        };
        
        updateButton();
    }
    
    showOTPError(message) {
        const errorDiv = document.getElementById('otp-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            
            // Hide error after 5 seconds
            setTimeout(() => {
                if (errorDiv) {
                    errorDiv.style.display = 'none';
                }
            }, 5000);
        } else {
            // Fallback for Safari - create error message if element not found
            console.error('OTP error div not found, creating fallback');
            this.addMessage(`⚠️ ${message}`, 'bot');
        }
    }
    
    hideOTPForm() {
        const otpForm = document.getElementById('otp-form');
        if (otpForm) {
            const messageElement = otpForm.closest('.message');
            if (messageElement) {
                messageElement.style.display = 'none';
            } else {
                // Safari fallback - try different approach
                const otpContainer = document.querySelector('.otp-verification-container');
                if (otpContainer) {
                    const parentMessage = otpContainer.closest('.message');
                    if (parentMessage) {
                        parentMessage.style.display = 'none';
                    }
                }
            }
        }
    }
    
    hideContactForm() {
        const form = document.getElementById('contact-form');
        if (form) {
            form.style.display = 'none';
        }
    }
    
    showFormError(message) {
        const form = document.getElementById('contact-form');
        let errorDiv = form.querySelector('.form-error');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'form-error';
            form.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Error fetching IP:', error);
            return 'unknown';
        }
    }
    
    async sendContactData() {
        try {
            const response = await fetch('/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: this.userData.name,
                    email: this.userData.email,
                    ip: this.userData.ip,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent
                })
            });
            
            if (!response.ok) {
                console.error('Failed to send contact data');
            }
        } catch (error) {
            console.error('Error sending contact data:', error);
        }
    }
    
    showTypingIndicator() {
        const typingIndicator = document.getElementById('chat-typing');
        typingIndicator.style.display = 'flex';
        this.isTyping = true;
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('chat-typing');
        typingIndicator.style.display = 'none';
        this.isTyping = false;
    }
    
    scrollToBottom() {
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    autoResizeInput(input) {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    }
    
    showWelcomeNotification() {
        // Show notification dot after 3 seconds
        setTimeout(() => {
            const notificationDot = document.getElementById('notification-dot');
            notificationDot.style.display = 'block';
            
            // Add a subtle shake animation to the chat toggle
            const chatToggle = document.getElementById('chat-toggle');
            chatToggle.style.animation = 'chatShake 0.5s ease-in-out';
            
            // Remove the shake animation after it completes
            setTimeout(() => {
                chatToggle.style.animation = '';
            }, 500);
        }, 3000);
    }
    
    addEntranceAnimation() {
        const chatToggle = document.getElementById('chat-toggle');
        
        // Start with the button slightly hidden
        chatToggle.style.opacity = '0';
        chatToggle.style.transform = 'scale(0.5) translateY(50px)';
        
        // Animate it in after a short delay
        setTimeout(() => {
            chatToggle.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            chatToggle.style.opacity = '1';
            chatToggle.style.transform = 'scale(1) translateY(0)';
            
            // Reset transition after animation
            setTimeout(() => {
                chatToggle.style.transition = 'all 0.3s ease';
            }, 800);
        }, 1000);
    }
    
    // Bubble-related methods
    initBubble() {
        const bubble = document.getElementById('chat-bubble');
        if (bubble) {
            // Show bubble after page loads and entrance animation completes
            setTimeout(() => {
                this.showBubble();
            }, 2000);
            
            // Add click event to bubble to open chat
            bubble.addEventListener('click', () => {
                this.openChat();
            });
        }
    }
    
    showBubble() {
        const bubble = document.getElementById('chat-bubble');
        if (bubble && !this.isOpen) {
            bubble.classList.remove('hidden');
            bubble.style.opacity = '1';
            bubble.style.transform = 'scale(1) translateY(0)';
            bubble.style.pointerEvents = 'auto';
            bubble.style.background = 'var(--main-color)';
            bubble.style.color = 'white';
            console.log('💬 Bubble shown');
        }
    }
    
    hideBubble() {
        const bubble = document.getElementById('chat-bubble');
        if (bubble) {
            bubble.classList.add('hidden');
            bubble.style.opacity = '0';
            bubble.style.transform = 'scale(0.8) translateY(1rem)';
            bubble.style.pointerEvents = 'none';
            console.log('💬 Bubble hidden');
        }
    }
    
    showBubbleAfterDelay(delay = 3000) {
        setTimeout(() => {
            if (!this.isOpen) {
                this.showBubble();
            }
        }, delay);
    }
    
    // Debug method for testing OTP form functionality (especially Safari)
    testOTPForm() {
        console.log('=== OTP Form Test (Safari Debug) ===');
        console.log('Browser:', navigator.userAgent);
        console.log('Is Safari:', /^((?!chrome|android).)*safari/i.test(navigator.userAgent));
        
        // Test OTP form creation
        try {
            this.showOTPVerificationForm('Test OTP verification - this is a debug test');
            console.log('✅ OTP form creation successful');
            
            // Test form elements after a delay
            setTimeout(() => {
                const otpForm = document.getElementById('otp-form');
                const otpInput = document.getElementById('otp-input');
                const submitBtn = document.querySelector('.btn-submit');
                const resendBtn = document.querySelector('.btn-resend');
                
                console.log('Form elements check:');
                console.log('  - OTP Form:', otpForm ? '✅ Found' : '❌ Not found');
                console.log('  - OTP Input:', otpInput ? '✅ Found' : '❌ Not found');
                console.log('  - Submit Button:', submitBtn ? '✅ Found' : '❌ Not found');
                console.log('  - Resend Button:', resendBtn ? '✅ Found' : '❌ Not found');
                
                if (otpInput) {
                    console.log('  - Input focused:', document.activeElement === otpInput ? '✅ Yes' : '❌ No');
                }
                
                console.log('=== Test Complete ===');
            }, 1000);
            
        } catch (error) {
            console.error('❌ OTP form creation failed:', error);
        }
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new Chatbot();
    
    // For demo purposes, override the API call with demo responses
    chatbot.callAPI = async function(message) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    };
    
    // Make chatbot globally accessible for debugging
    window.chatbot = chatbot;
});

// Add some helpful console messages
console.log('🤖 AI Chatbot loaded! Ask me about Amrut\'s experience, skills, or projects.');
console.log('💡 Tip: You can customize the API endpoint in chatbot.js to connect to your actual AI service.'); 