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
        
        // Hide contact form
        this.hideContactForm();
        
        // Add message with OTP form
        const otpFormHTML = `
            <div class="otp-verification-container">
                <p>${message}</p>
                <form id="otp-form" class="otp-form">
                    <div class="form-group">
                        <label for="otp-input">Enter 6-digit verification code:</label>
                        <input type="text" id="otp-input" placeholder="123456" maxlength="6" pattern="[0-9]{6}" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-submit">Verify Code</button>
                        <button type="button" class="btn-resend">Resend Code</button>
                    </div>
                </form>
                <div id="otp-error" class="error-message" style="display: none;"></div>
            </div>
        `;
        
        // Create bot message with OTP form
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <img src="clarity.JPG" alt="Clarity AI Assistant" class="bot-avatar-image">
            </div>
            <div class="message-content">
                ${otpFormHTML}
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add event listeners
        const otpForm = document.getElementById('otp-form');
        const resendBtn = document.querySelector('.btn-resend');
        
        otpForm.addEventListener('submit', (e) => this.handleOTPSubmit(e));
        resendBtn.addEventListener('click', () => this.resendOTP());
        
        // Focus on OTP input
        document.getElementById('otp-input').focus();
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
        try {
            console.log('Resending OTP...');
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
            
        } catch (error) {
            console.error('Failed to resend OTP:', error);
            this.showOTPError('Failed to resend code. Please try again.');
        }
    }
    
    showOTPError(message) {
        const errorDiv = document.getElementById('otp-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            
            // Hide error after 5 seconds
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }
    
    hideOTPForm() {
        const otpForm = document.getElementById('otp-form');
        if (otpForm) {
            otpForm.closest('.message').style.display = 'none';
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