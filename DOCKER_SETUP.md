# Docker Setup Guide - Full Stack AI Assistant

This guide covers the complete Docker setup for both the frontend portfolio and backend API, eliminating CORS issues by serving everything from the same origin.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Same Origin (localhost:3000)             │
├─────────────────────────────────────────────────────────────┤
│  Nginx Frontend Container                                   │
│  ┌─────────────────┐    ┌──────────────────────────────────┐│
│  │ Static Files    │    │ API Proxy (/api/*)               ││
│  │ - index.html    │    │ ┌────────────────────────────────┤│
│  │ - chatbot.js    │    │ │ /api/register → backend:8000   ││
│  │ - admin.html    │    │ │ /api/chat → backend:8000       ││
│  │ - assets        │    │ │ /api/* → backend:8000          ││
│  └─────────────────┘    │ └────────────────────────────────┤│
└─────────────────────────┼──────────────────────────────────┘│
                          │                                   
┌─────────────────────────┼──────────────────────────────────┐
│ FastAPI Backend Container (ai-assistant-app:8000)          │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ - /register (email registration)                       ││
│ │ - /chat (AI chat endpoint)                             ││
│ │ - /user-status (usage tracking)                        ││
│ │ - /registration-logs (admin)                           ││
│ │ - /redis-registrations (admin)                         ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────┼──────────────────────────────────┐
│ Redis Container (ai-assistant-redis:6379)                  │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ - Rate limiting                                         ││
│ │ - Registration tracking                                 ││
│ │ - Chat history                                          ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Development Setup
```bash
# Start all services
docker-compose up

# Access the application
Frontend: http://localhost:3000
API: http://localhost:3000/api/*
Backend Direct: http://localhost:8000 (for testing)
```

### Production Setup
```bash
# Start production services
docker-compose -f docker-compose.prod.yml up

# Access the application
Frontend: http://localhost (port 80)
API: http://localhost/api/*
```

## 📁 Project Structure

```
AI-assistant/
├── docker-compose.yml         # Development setup
├── docker-compose.prod.yml    # Production setup
├── Dockerfile                 # Backend container
├── main.py                    # FastAPI backend
├── service/                   # Backend services
├── portfolio/                 # Frontend code
│   ├── Dockerfile             # Frontend container
│   ├── nginx.conf             # Nginx configuration
│   ├── index.html             # Main page
│   ├── admin.html             # Admin page
│   ├── chatbot.js             # Chatbot functionality
│   ├── chatbot-config.js      # API configuration
│   └── assets/                # Static assets
└── logs/                      # CSV registration logs
```

## 🔧 Configuration

### Frontend Configuration (`portfolio/chatbot-config.js`)
```javascript
const CHATBOT_CONFIG = {
    // API endpoint - using relative path for same-origin
    API_ENDPOINT: '/api',
    // ... other settings
};
```

### Backend Configuration (Environment Variables)
```bash
# Required
OPENAI_API_KEY=your_openai_api_key

# Optional (with defaults)
REDIS_PASSWORD=defaultpassword
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
CORS_ALLOW_CREDENTIALS=true
```

## 🌐 URL Routing

### Frontend Routes (Nginx)
| URL | Purpose | Serves |
|-----|---------|--------|
| `http://localhost:3000/` | Main portfolio page | `index.html` |
| `http://localhost:3000/admin.html` | Admin interface | `admin.html` |
| `http://localhost:3000/style.css` | Stylesheets | Static CSS |
| `http://localhost:3000/chatbot.js` | Chatbot script | Static JS |
| `http://localhost:3000/health` | Health check | Nginx status |

### API Routes (Proxied to Backend)
| URL | Purpose | Proxied To |
|-----|---------|------------|
| `http://localhost:3000/api/register` | User registration | `backend:8000/register` |
| `http://localhost:3000/api/chat` | AI chat | `backend:8000/chat` |
| `http://localhost:3000/api/user-status` | User status | `backend:8000/user-status` |
| `http://localhost:3000/api/registration-logs` | Admin logs | `backend:8000/registration-logs` |
| `http://localhost:3000/api/redis-registrations` | Admin Redis data | `backend:8000/redis-registrations` |

## 🐳 Docker Services

### Development (`docker-compose.yml`)
- **Frontend**: `localhost:3000` (nginx + static files)
- **Backend**: Internal only (accessed via proxy)
- **Redis**: Internal only
- **Volumes**: Live code reloading enabled

### Production (`docker-compose.prod.yml`)
- **Frontend**: `localhost:80` (nginx + static files)
- **Backend**: Internal only (accessed via proxy)
- **Redis**: Internal only
- **Volumes**: Production optimized

## 📊 Volume Mounts

### Development Volumes
```yaml
# Frontend hot reloading
- ./portfolio:/usr/share/nginx/html:ro
- ./portfolio/nginx.conf:/etc/nginx/nginx.conf:ro

# Backend hot reloading
- ./main.py:/app/main.py
- ./service:/app/service

# Data persistence
- ./chroma_persistent_storage:/app/chroma_persistent_storage
- ./logs:/app/logs
```

## 🧪 Testing

### Local Testing
```bash
# Test the complete setup
curl http://localhost:3000/health
curl http://localhost:3000/api/register?email=test@example.com
curl http://localhost:3000/api/user-status

# Test frontend
open http://localhost:3000
```

### API Testing
Use the provided `test_main.http` file with sections for:
- Direct backend testing (`localhost:8000`)
- Same-origin testing (`localhost:3000/api`)

## 🔒 Benefits of Same-Origin Setup

1. **No CORS Issues**: Frontend and API are served from same domain
2. **Cookie Support**: Seamless cookie-based authentication
3. **Production Ready**: Nginx handles static files and API proxying
4. **Development Friendly**: Hot reloading for both frontend and backend
5. **Secure**: Internal communication between containers
6. **Scalable**: Easy to add SSL, load balancing, etc.

## 🚀 Deployment Commands

### Development
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Production
```bash
# Start production setup
docker-compose -f docker-compose.prod.yml up -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production
docker-compose -f docker-compose.prod.yml down
```

### Rebuild Services
```bash
# Rebuild all containers
docker-compose build

# Rebuild specific service
docker-compose build frontend
docker-compose build app

# Force rebuild without cache
docker-compose build --no-cache
```

## 🔧 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   # Kill the process or change port in docker-compose.yml
   ```

2. **API Calls Failing**
   ```bash
   # Check if backend is healthy
   docker-compose logs app
   # Check nginx logs
   docker-compose logs frontend
   ```

3. **Frontend Not Loading**
   ```bash
   # Check if frontend container is running
   docker-compose ps
   # Check nginx configuration
   docker-compose exec frontend nginx -t
   ```

4. **Database Connection Issues**
   ```bash
   # Check Redis connection
   docker-compose logs redis
   # Test Redis connectivity
   docker-compose exec app redis-cli -h redis ping
   ```

### Log Analysis
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs frontend
docker-compose logs app
docker-compose logs redis

# Follow logs in real-time
docker-compose logs -f app
```

## 🌟 Next Steps

1. **SSL/HTTPS**: Add SSL certificates for production
2. **Domain Setup**: Configure with your actual domain
3. **Monitoring**: Add logging and monitoring services
4. **Scaling**: Add load balancing for high traffic
5. **CI/CD**: Set up automated deployments

Your full-stack AI assistant is now containerized and ready for both development and production! 🎉 