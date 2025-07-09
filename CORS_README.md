# CORS Configuration Guide

## The Problem
When using cookies (credentials) with CORS, you cannot use wildcard `*` for `allow_origins`. This causes the error:
```
The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
```

## Solution
The application now supports flexible CORS configuration through environment variables.

## Environment Variables

### `CORS_ORIGINS` (comma-separated URLs)
- **Development default:** `http://localhost:3000,http://localhost:3001,http://localhost:8080`
- **Production default:** `https://yourdomain.com,https://www.yourdomain.com`

### `CORS_ALLOW_CREDENTIALS` (true/false)
- **Default:** `true` (enables cookie-based authentication)
- **Set to `false`** if you want to use wildcard origins without cookies

## Configuration Examples

### Development with Credentials (Default)
```bash
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
CORS_ALLOW_CREDENTIALS=true
```

### Development without Credentials (Wildcard)
```bash
CORS_ORIGINS=*
CORS_ALLOW_CREDENTIALS=false
```

### Production with Specific Domains
```bash
CORS_ORIGINS=https://myapp.com,https://www.myapp.com,https://admin.myapp.com
CORS_ALLOW_CREDENTIALS=true
```

### Local File Development
```bash
CORS_ORIGINS=null,http://localhost:3000
CORS_ALLOW_CREDENTIALS=true
```

## Common Frontend Scenarios

### React (Create React App)
```bash
CORS_ORIGINS=http://localhost:3000
```

### Vue.js Development Server
```bash
CORS_ORIGINS=http://localhost:8080
```

### Angular Development Server
```bash
CORS_ORIGINS=http://localhost:4200
```

### Multiple Frontend Apps
```bash
CORS_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:4200
```

### HTML Files (file:// protocol)
```bash
CORS_ORIGINS=null,http://localhost:3000
```

## Docker Configuration

### Development
```yaml
environment:
  - CORS_ORIGINS=http://localhost:3000,http://localhost:3001
  - CORS_ALLOW_CREDENTIALS=true
```

### Production
```yaml
environment:
  - CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
  - CORS_ALLOW_CREDENTIALS=true
```

## Troubleshooting

### Error: "CORS policy: credentials mode is 'include'"
- **Cause:** Using `CORS_ORIGINS=*` with `CORS_ALLOW_CREDENTIALS=true`
- **Fix:** Set specific origins or disable credentials

### Error: "Access-Control-Allow-Origin header is missing"
- **Cause:** Your frontend origin is not in the allowed list
- **Fix:** Add your frontend URL to `CORS_ORIGINS`

### Cookies not being sent
- **Cause:** `CORS_ALLOW_CREDENTIALS=false` or wrong origin
- **Fix:** Enable credentials and add correct origin

## Testing CORS

Use the provided test requests in `test_main.http`:
```http
# Test with specific origin
GET http://127.0.0.1:8000/user-status
Origin: http://localhost:3000

# Test with null origin (file:// protocol)
GET http://127.0.0.1:8000/user-status
Origin: null
``` 