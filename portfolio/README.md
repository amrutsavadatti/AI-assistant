# Portfolio Frontend - AI Assistant

This directory contains the frontend portfolio application with integrated AI chatbot functionality.

## 🏗️ Structure

```
portfolio/
├── index.html              # Main portfolio page
├── admin.html              # Admin interface
├── style.css               # Main styles
├── admin.css               # Admin styles
├── script.js               # Main portfolio functionality
├── chatbot.js              # AI chatbot integration
├── chatbot-config.js       # Chatbot configuration
├── js/
│   ├── admin.js            # Admin functionality
│   └── admin-data.js       # Admin data handling
├── assets/                 # Images, PDFs, etc.
├── Dockerfile              # Frontend container
├── nginx.conf              # Nginx configuration
└── .dockerignore           # Docker ignore rules
```

## 🤖 Chatbot Integration

### Configuration (`chatbot-config.js`)
```javascript
const CHATBOT_CONFIG = {
    API_ENDPOINT: '/api',  // Same-origin API calls
    APPEARANCE: {
        WELCOME_MESSAGE: "Hi! I'm Amrut's AI assistant...",
        BOT_NAME: "Clarity",
        // ... other settings
    }
};
```

### API Calls (`chatbot.js`)
- **Registration**: `/api/register?email=user@example.com&company=Company`
- **Chat**: `/api/chat?question=What is Amrut's experience?`
- **Status**: `/api/user-status`

## 🚀 Docker Setup

### Build Frontend Container
```bash
# From portfolio directory
docker build -t ai-assistant-frontend .

# From project root
docker-compose build frontend
```

### Run with Backend
```bash
# From project root
docker-compose up
# Access: http://localhost:3000
```

## 🌐 Same-Origin Benefits

- **No CORS Issues**: Frontend and API served from same domain
- **Cookie Support**: Seamless authentication
- **Production Ready**: Nginx handles static files and API proxying

## 📝 Key Features

### Main Portfolio (`index.html`)
- Personal information and experience
- Skills showcase
- Integrated AI chatbot
- Responsive design

### Admin Interface (`admin.html`)
- Registration logs viewer
- User analytics
- Chat history management
- Redis monitoring

### AI Chatbot
- Email registration required
- Rate limited questions per day
- Rate limiting with Redis
- Persistent chat history

## 🔧 Development

### Local Development
```bash
# Serve files locally (for testing without Docker)
python -m http.server 8080
# Access: http://localhost:8080

# With live reloading in Docker
docker-compose up
# Files are mounted as volumes for hot reloading
```

### Configuration Updates
1. Edit `chatbot-config.js` for chatbot settings
2. Modify `nginx.conf` for routing changes
3. Update `Dockerfile` for container changes

## 🎨 Styling

- **Main CSS**: `style.css` (portfolio styles)
- **Admin CSS**: `admin.css` (admin interface)
- **Responsive**: Mobile-friendly design
- **Modern**: Clean, professional appearance

## 🔌 API Integration

### Same-Origin Requests
```javascript
// All API calls use relative paths
fetch('/api/register?email=user@example.com')
fetch('/api/chat?question=Hello')
fetch('/api/user-status')
```

### Cookie Authentication
- Automatic cookie handling
- No need for CORS headers
- Secure, HttpOnly cookies
- 24-hour expiration

## 📊 Admin Features

### Registration Logs
- View all user registrations
- CSV export functionality
- Company tracking
- Timestamp information

### User Analytics
- Active user monitoring
- Question usage stats
- Rate limit tracking
- Redis data visualization

Your portfolio is now fully containerized with seamless AI integration! 🎉 