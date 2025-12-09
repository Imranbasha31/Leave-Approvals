# DevTunnel Mobile Login - Troubleshooting & Fix

## Problem Identified

✗ **Mobile can't login via DevTunnel**
- ✓ Laptop works: `https://ccrbcppp-8080.inc1.devtunnels.ms/` → Shows login page
- ✓ Laptop login works
- ✗ Mobile: Fails with "Login failed" message
- ✗ API endpoint returns 404 or serves React HTML instead of JSON

## Root Cause Analysis

```
Test Results:
✓ Local backend: http://localhost:5000/api/health → Returns JSON
✓ Local login:   http://localhost:5000/api/auth/login → Returns JWT

✗ DevTunnel:     https://ccrbcppp-8080.inc1.devtunnels.ms/api/health → Returns HTML (NOT JSON)
✗ DevTunnel:     https://ccrbcppp-8080.inc1.devtunnels.ms/api/auth/login → Returns 404
```

**Why it fails on mobile:**
1. Mobile browser accesses `https://ccrbcppp-8080.inc1.devtunnels.ms/`
2. Frontend loads correctly (you see login page)
3. Frontend tries to call API: `https://ccrbcppp-8080.inc1.devtunnels.ms/api/auth/login`
4. API call fails because:
   - DevTunnel tunnel isn't properly connected to backend
   - OR tunnel connected but returning frontend files instead of API JSON
   - OR CORS blocking the request from mobile browser

---

## Solution Options

### **Option 1: Verify DevTunnel is Still Active (RECOMMENDED)**

Your DevTunnel might have expired or disconnected.

**Steps:**
1. Check your DevTunnel dashboard for tunnel status
2. In VS Code, look for DevTunnel icon in status bar
3. If inactive, restart the tunnel:
   ```bash
   # In VS Code:
   # - Remote Explorer → DevTunnels
   # - Click "Create Tunnel" or restart existing tunnel
   # - Copy new URL and update .env
   ```

4. Verify tunnel is forwarding to localhost:5000:
   ```bash
   # The tunnel should show:
   # Local: localhost:5000
   # Public: https://ccrbcppp-8080.inc1.devtunnels.ms
   ```

5. Test tunnel is working:
   ```bash
   curl https://ccrbcppp-8080.inc1.devtunnels.ms/api/health
   # Should return: {"status":"OK","timestamp":"..."}
   # NOT HTML
   ```

---

### **Option 2: Check Backend is Running**

Backend might have crashed or stopped.

**Steps:**
1. Check terminal for backend errors
2. Verify on localhost:
   ```bash
   Invoke-WebRequest http://localhost:5000/api/health
   # Should return: {"status":"OK","timestamp":"..."}
   ```

3. If not running, restart backend:
   ```bash
   cd backend
   npm run dev
   # Should show: ✓ ApproveIQ Server running on http://0.0.0.0:5000
   ```

---

### **Option 3: Explicit CORS Configuration (If tunnel is working)**

Mobile might be blocked by strict CORS if DevTunnel URL changed.

**Edit backend/src/server.js:**
```javascript
// Before: app.use(cors());
// After:
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'https://ccrbcppp-8080.inc1.devtunnels.ms',  // Add your DevTunnel URL
  ],
  credentials: true
}));
```

Then restart backend:
```bash
npm run dev
```

---

### **Option 4: Use Different Remote Access Method**

If DevTunnel continues to fail, use alternative:

**A. ngrok (Better for production):**
```bash
# Install: choco install ngrok (Windows)
ngrok http 5000

# Get URL like: https://abc123.ngrok.io
# Update .env:
VITE_API_URL=https://abc123.ngrok.io/api
```

**B. Port Forwarding (Simple, same WiFi only):**
```bash
# No setup needed
# On phone, connect to same WiFi
# On laptop: ipconfig (find IP like 192.168.1.100)
# On phone: https://192.168.1.100:5000
# (Accept self-signed certificate warning)
```

**C. Docker + Public IP (If you have static public IP):**
```bash
# Deploy with docker-compose
# Expose on your public IP
# Works from anywhere
```

---

## Diagnostic Checklist

Run these tests to identify exact issue:

### Test 1: Backend is Running
```bash
Invoke-WebRequest http://localhost:5000/api/health
# Expected: StatusCode 200, Content: {"status":"OK",...}
```

### Test 2: DevTunnel is Active
```bash
$null = [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
Invoke-WebRequest https://ccrbcppp-8080.inc1.devtunnels.ms/api/health
# Expected: StatusCode 200, Content: {"status":"OK",...}
# If you see HTML, tunnel isn't connected to backend
```

### Test 3: Login API Works Locally
```bash
$body = @{email="bashairfan518@gmail.com"; password="Irfan@86101"} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:5000/api/auth/login `
  -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
# Expected: StatusCode 200, Content: {"token":"...",...}
```

### Test 4: Login API Works via DevTunnel
```bash
$null = [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
$body = @{email="bashairfan518@gmail.com"; password="Irfan@86101"} | ConvertTo-Json
Invoke-WebRequest -Uri https://ccrbcppp-8080.inc1.devtunnels.ms/api/auth/login `
  -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
# Expected: StatusCode 200, Content: {"token":"...",...}
```

### Test 5: CORS Headers
```bash
$null = [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
$response = Invoke-WebRequest https://ccrbcppp-8080.inc1.devtunnels.ms/api/health
$response.Headers | Select-Object -Property @{Name="Key"; Expression={$_.Keys}}, @{Name="Value"; Expression={$_.Values}} | Format-Table
# Should show: Access-Control-Allow-Origin: *
```

---

## Recommended Action

1. **First:** Run Diagnostic Test 2 (DevTunnel health)
   - If fails → DevTunnel tunnel is down, restart it
   - If works → Continue to Test 4

2. **Then:** Run Diagnostic Test 4 (DevTunnel login)
   - If works → CORS issue on mobile, use Option 3
   - If fails → Backend not receiving requests, check tunnel

3. **Finally:** Test on mobile browser
   - Open: `https://ccrbcppp-8080.inc1.devtunnels.ms/`
   - Try login
   - Check console (F12) for errors

---

## Quick Fix Command

If DevTunnel is confirmed working, try this to add explicit CORS:

```bash
# Update backend CORS
# File: backend/src/server.js
# Change line ~21 from:
#   app.use(cors());
# To:
#   app.use(cors({
#     origin: ['http://localhost:5173', 'https://ccrbcppp-8080.inc1.devtunnels.ms'],
#     credentials: true
#   }));

# Then restart:
npm run dev
```

---

## Timeline

- **✓ Worked:** DevTunnel on laptop
- **✗ Failed:** Login from mobile
- **✓ Found:** API endpoint returns HTML instead of JSON via DevTunnel
- **→ Fix:** Restart DevTunnel tunnel or update CORS config

---

**Status:** Requires diagnostic testing
**Priority:** High - blocks mobile testing
**Effort:** 5-10 minutes to resolve

Run Test 2 first and let me know the result!
