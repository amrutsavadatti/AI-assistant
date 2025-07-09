// Chatbot Configuration
// Update these settings to customize your AI chatbot

const CHATBOT_CONFIG = {
    // API endpoint - using relative path for same-origin requests
    API_ENDPOINT: '/api',
    
    // API request configuration
    API_CONFIG: {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Add any additional headers your API requires
            // 'Authorization': 'Bearer YOUR_API_KEY',
        }
    },
    
    // Chatbot appearance settings
    APPEARANCE: {
        // Welcome message
        WELCOME_MESSAGE: "Hi! I'm Amrut's AI assistant called 'Clarity'. I can help you learn more about his skills, experience, or answer any questions you might have. What would you like to know?",
        
        // Bot name
        BOT_NAME: "Clarity",
        
        // Bot description
        BOT_DESCRIPTION: "Ask me anything about Amrut!",
        
        // Notification delay (in milliseconds)
        NOTIFICATION_DELAY: 3000,
        
        // Typing animation delay range (min, max in milliseconds)
        TYPING_DELAY: {
            MIN: 1000,
            MAX: 3000
        }
    },
    
    // Message history settings
    MESSAGE_HISTORY: {
        // Maximum number of messages to keep in context
        MAX_MESSAGES: 20,
        
        // Whether to include message history in API calls
        INCLUDE_CONTEXT: true
    },
    
    // Demo mode settings (for testing without API)
    DEMO_MODE: {
        // Enable demo mode (set to false when using real API)
        ENABLED: false,
        
        // Demo responses for common questions
        RESPONSES: {
            greeting: "Hello! I'm Amrut's AI assistant called 'Clarity'. How can I help you learn more about him today?",
            }
    }
};

// Export configuration for use in chatbot.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CHATBOT_CONFIG;
} else {
    window.CHATBOT_CONFIG = CHATBOT_CONFIG;
} 