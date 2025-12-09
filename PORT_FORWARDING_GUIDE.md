# Port Forwarding Guide for ApproveIQ Mobile Testing

## 🎯 Problem
When accessing the application on your phone via port forwarding, you see the application but **login fails**. This is because the frontend tries to connect to `localhost:5000`, but `localhost` on your phone refers to the phone itself, not your computer.

## ✅ Solution
The application now **automatically detects** your computer's IP address and connects to it!

---

## 📱 How to Use Port Forwarding on Phone

### **Step 1: Find Your Computer's Local IP Address**

#### On Windows (PowerShell):
```powershell
ipconfig
```
Look for **IPv4 Address** under your network adapter (e.g., `192.168.1.2`)

#### On Mac/Linux (Terminal):
```bash
ifconfig
```
Look for **inet** address under your WiFi connection

### **Step 2: Set Up Port Forwarding**

#### **Option A: Using adb (Android)**
```bash
# Connect phone via USB
# Enable Developer Mode on phone
# Run:
adb reverse tcp:5000 tcp:5000
adb reverse tcp:5173 tcp:5173

# Now access: http://localhost:5000 on phone browser
```

#### **Option B: Manual WiFi Access**
```bash
# Make sure phone and computer are on same WiFi network
# On phone browser, go to:
http://YOUR_COMPUTER_IP:5000

# Example:
http://192.168.1.2:5000
```

#### **Option C: Using ngrok (Easiest for Remote Access)**
```bash
# Install ngrok: https://ngrok.com
# In terminal:
ngrok http 5000

# ngrok will give you a public URL like:
# https://abc123.ngrok.io

# Use this URL on your phone from anywhere
```

---

## 🔧 How It Works Now

### **Desktop/Localhost Access**
```
Your Computer:
  Browser: http://localhost:5173
  ↓
  Frontend detects: localhost
  ↓
  API URL: http://localhost:5000/api ✅
```

### **Phone via WiFi**
```
Your Phone:
  Browser: http://192.168.1.2:5000
  ↓
  Frontend detects: 192.168.1.2
  ↓
  API URL: http://192.168.1.2:5000/api ✅
```

### **Phone via ADB Port Forwarding**
```
Your Phone:
  Browser: http://localhost:5000
  ↓
  Frontend detects: localhost
  ↓
  ADB forwards: localhost:5000 → computer's 5000 ✅
```

---

## 🚀 Quick Start Steps

### **For Desktop Development:**
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
npm run dev

# Desktop browser: http://localhost:5173
# Login: bashairfan518@gmail.com / Irfan@86101
```

### **For Phone Testing (WiFi):**
```bash
# On your computer (from project root):
npm run dev:full

# Find your IP:
ipconfig  # Windows
ifconfig  # Mac/Linux

# On your phone browser, go to:
http://YOUR_IP:5000

# Example: http://192.168.1.2:5000
# Login works now! ✅
```

### **For Phone Testing (ADB):**
```bash
# Prerequisites: Android phone + USB cable + ADB installed

# Enable Developer Mode on phone
# Connect phone via USB

# In terminal:
adb reverse tcp:5000 tcp:5000

# On phone browser:
http://localhost:5000  # Now this works! ✅
```

---

## 🔍 Debugging API Connection

### **Check What API URL is Being Used:**

1. **Open phone browser DevTools:**
   - Open Browser Console (varies by browser)
   - Look for message like: `🔍 API Configuration Debug:`
   
2. **Example output:**
   ```
   🔍 API Configuration Debug:
     Current Host: 192.168.1.2
     Current Port: 5000
     API URL: http://192.168.1.2:5000/api
     Environment: Development
   ```

3. **Common Issues:**
   - If API URL shows `http://localhost:5000/api` ❌
   - But you accessed via IP address ❌
   - Solution: Clear browser cache and refresh

---

## 🛠️ Manual API URL Override

If auto-detection isn't working, you can manually set the API URL:

### **Option 1: Environment Variable**
Create a `.env` file in project root:
```env
VITE_API_URL=http://192.168.1.2:5000/api
```

Then restart dev server:
```bash
npm run dev:full
```

### **Option 2: Using ngrok**
```bash
# Terminal 1: Start ngrok
ngrok http 5000

# Copy the URL ngrok gives you, then set .env:
VITE_API_URL=https://abc123.ngrok.io/api

# Terminal 2: Start dev server
npm run dev:full

# Now use the ngrok URL on your phone from anywhere!
```

---

## 📊 Common Setups

### **Setup 1: Same WiFi Network**
```
Computer (192.168.1.2)
    ↑ (WiFi)
    ↓
Phone (WiFi)

Browser: http://192.168.1.2:5000 ✅
```

### **Setup 2: USB ADB Forwarding**
```
Computer
    ↑ (USB Cable)
    ↓
Phone (adb reverse)

Browser: http://localhost:5000 ✅
```

### **Setup 3: Remote Access (ngrok)**
```
Computer → ngrok cloud → Internet → Phone

Browser: https://abc123.ngrok.io ✅
Works from anywhere!
```

---

## ✨ Features of Auto-Detection

✅ **Automatic IP Detection**: Detects if accessed via IP and uses it for API calls
✅ **Localhost Support**: Desktop development still works with localhost
✅ **Development Console**: Logs API config on page load for debugging
✅ **Environment Override**: Can set VITE_API_URL to override
✅ **Production Ready**: Auto-uses backend domain in production

---

## 🚨 Troubleshooting

### **Problem: "Network Error" or "Failed to login"**

**Cause:** Frontend can't reach backend API

**Solutions:**
1. Verify backend is running:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. Check if phone and computer on same WiFi
   ```bash
   # On phone, open browser to:
   http://YOUR_COMPUTER_IP:5000
   # Should see ApproveIQ login page
   ```

3. Check firewall isn't blocking port 5000:
   ```bash
   # Windows PowerShell:
   netstat -an | grep 5000
   ```

4. Clear browser cache on phone and refresh

### **Problem: "Cannot GET /"**

**Cause:** Frontend bundle not built or being served

**Solution:**
```bash
# Kill any running processes
npm run dev:full

# Should show:
# Vite dev server on port 5173
# Backend on port 5000
```

### **Problem: API calls go to wrong URL**

**Check the debug log:**
```javascript
// Open browser console (F12)
// Look for: "🔍 API Configuration Debug:"

// If shows wrong IP, try:
// 1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
// 2. Clear cache: Ctrl+Shift+Delete
// 3. Set VITE_API_URL manually in .env
```

---

## 📝 Environment Variables

Create `.env` file in project root if needed:

```env
# Frontend
VITE_API_URL=http://192.168.1.2:5000/api  # Optional - only if auto-detect fails

# Backend (in backend/.env if using separate server)
MONGODB_URI=mongodb://root:rootpassword@localhost:27017/approveiq?authSource=admin
JWT_SECRET=dev-secret-key-not-for-production
PORT=5000
NODE_ENV=development
```

---

## 🎓 How Auto-Detection Works

```typescript
// src/lib/apiConfig.ts

export function getApiUrl(): string {
  // 1. Check explicit VITE_API_URL first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 2. In development
  if (import.meta.env.DEV) {
    // If localhost → use localhost:5000
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:5000/api';
    }

    // If IP address → use same IP:5000
    return `http://${window.location.hostname}:5000/api`;
  }

  // 3. Production → use current domain
  return `${window.location.protocol}//${window.location.host}/api`;
}
```

---

## 🎯 Quick Test Credentials

```
Email: bashairfan518@gmail.com
Password: Irfan@86101
Role: Student
```

---

## 📞 Still Having Issues?

1. **Check backend logs:**
   ```bash
   docker logs -f approveiq-app
   # or just look at terminal where npm run dev:full is running
   ```

2. **Check frontend console (F12):**
   - Look for red errors
   - Check "Network" tab - see failed requests
   - Look for API URL being used

3. **Test API directly:**
   ```bash
   # On computer:
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"bashairfan518@gmail.com","password":"Irfan@86101"}'
   
   # Should return JWT token
   ```

4. **Verify network connectivity:**
   ```bash
   # From phone, ping computer:
   ping 192.168.1.2  # Replace with your IP
   ```

---

**Last Updated:** December 2025
**Status:** Working ✅
