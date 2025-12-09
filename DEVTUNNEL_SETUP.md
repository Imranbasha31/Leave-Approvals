# DevTunnel Setup Guide for ApproveIQ

## 🌐 What is DevTunnel?

DevTunnel (formerly Dev Tunnel) is a Microsoft service that creates a secure public URL to your local application. Perfect for testing on mobile devices from anywhere!

**Your URL:** `https://ccrbcppp-8080.inc1.devtunnels.ms/`

---

## ✅ Setup Complete!

I've created a `.env` file that configures the app to use your DevTunnel URL:

```env
VITE_API_URL=https://ccrbcppp-8080.inc1.devtunnels.ms/api
```

---

## 🚀 How to Use

### **Step 1: Make Sure DevTunnel is Running**

Check if your DevTunnel is still active by visiting:
```
https://ccrbcppp-8080.inc1.devtunnels.ms/
```

You should see the ApproveIQ login page.

### **Step 2: Restart Dev Server**

Since we updated `.env`, restart the dev server:

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev:full
```

### **Step 3: Access from Phone**

Open on any device (phone, tablet, etc.):
```
https://ccrbcppp-8080.inc1.devtunnels.ms/
```

### **Step 4: Login**

```
Email: bashairfan518@gmail.com
Password: Irfan@86101
```

---

## 🔍 How It Works

```
┌─────────────────┐
│  Your Computer  │
│  localhost:5000 │
│  localhost:5173 │
└────────┬────────┘
         │
    DevTunnel
    (Forwarding)
         │
    ┌────▼──────────────────────────────┐
    │  Public Internet                   │
    │  ccrbcppp-8080.inc1.devtunnels.ms │
    └────┬──────────────────────────────┘
         │
    ┌────▼──────────────────┐
    │  Your Phone/Tablet    │
    │  Browser              │
    │  from anywhere        │
    └───────────────────────┘
```

---

## ✨ Benefits of DevTunnel

✅ **Public URL** - Access from anywhere in the world
✅ **Secure** - Uses HTTPS (encrypted)
✅ **No Port Forwarding Needed** - Just visit the URL
✅ **Mobile Friendly** - Test on actual devices
✅ **Tunnel Forwarding** - Automatically routes to localhost:5000

---

## 🔧 Frontend API Configuration

The app is now configured to:

1. **Use DevTunnel for API calls:**
   ```
   https://ccrbcppp-8080.inc1.devtunnels.ms/api
   ```

2. **Automatically detect the correct URL:**
   - If you access via `https://ccrbcppp-8080...` → uses that domain for API
   - If you access via `localhost` → uses localhost for API
   - Environment variable `VITE_API_URL` overrides everything

---

## 📊 What's Configured

### `.env` File
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://root:rootpassword@localhost:27017/approveiq?authSource=admin
JWT_SECRET=dev-secret-key-not-for-production
VITE_API_URL=https://ccrbcppp-8080.inc1.devtunnels.ms/api
```

### Backend CORS
Already enabled to accept requests from your DevTunnel URL.

### Frontend API Configuration
Auto-detection + environment variable override.

---

## 🧪 Testing the Setup

### **Test 1: Check DevTunnel is Working**
```bash
curl https://ccrbcppp-8080.inc1.devtunnels.ms/api/health
# Should return: {"status":"OK","timestamp":"..."}
```

### **Test 2: Test Login API**
```bash
curl -X POST https://ccrbcppp-8080.inc1.devtunnels.ms/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bashairfan518@gmail.com","password":"Irfan@86101"}'
# Should return: {"token":"...","user":{...}}
```

### **Test 3: Access from Phone**
1. Open browser on phone
2. Go to: `https://ccrbcppp-8080.inc1.devtunnels.ms/`
3. Should see login page
4. Try logging in
5. Should see dashboard

---

## 📱 Mobile Testing Workflow

### **Scenario 1: Same Location (Wi-Fi)**
```bash
# Computer: npm run dev:full
# Phone: https://ccrbcppp-8080.inc1.devtunnels.ms/
# Works! ✅
```

### **Scenario 2: Different Location (Remote)**
```bash
# Computer: npm run dev:full (anywhere with internet)
# Phone: https://ccrbcppp-8080.inc1.devtunnels.ms/ (anywhere with internet)
# Works! ✅
```

### **Scenario 3: Testing Both Desktop & Mobile**
```bash
# Computer browser: http://localhost:5173
# Desktop: Works with localhost ✅

# Phone browser: https://ccrbcppp-8080.inc1.devtunnels.ms/
# Mobile: Works with DevTunnel ✅
```

---

## 🚨 Troubleshooting

### **Problem: "Network Error" when accessing from phone**

**Check 1: Is DevTunnel still active?**
```bash
curl https://ccrbcppp-8080.inc1.devtunnels.ms/
# Should show login page HTML
```

**Check 2: Is backend running?**
```bash
# Terminal should show:
✓ ApproveIQ Server running on http://0.0.0.0:5000
```

**Check 3: Is .env being used?**
```bash
# Restart dev server:
npm run dev:full

# Should show:
VITE_API_URL from .env being loaded
```

**Check 4: Clear browser cache on phone**
- Settings → Safari/Chrome → Clear Cache

### **Problem: "API connection failed"**

**Cause:** Frontend trying to use wrong API URL

**Solution:**
1. Open phone browser console (F12)
2. Look for: "🔍 API Configuration Debug:"
3. Should show: `API URL: https://ccrbcppp-8080.inc1.devtunnels.ms/api`
4. If shows `localhost` → the .env isn't being read
5. Restart dev server: `npm run dev:full`

### **Problem: DevTunnel URL expired**

If your DevTunnel URL changes:
1. Get new URL from your DevTunnel settings
2. Update `.env` file:
   ```env
   VITE_API_URL=https://NEW_URL/api
   ```
3. Restart dev server: `npm run dev:full`
4. Use new URL on phone

---

## 🔐 Security Notes

⚠️ **For Development Only:**
- DevTunnel is public (anyone with URL can access)
- Don't use real passwords in seed data
- Change JWT_SECRET before production

✅ **Best Practices:**
- Use HTTPS (DevTunnel already does this)
- Implement rate limiting for production
- Add authentication for sensitive pages
- Use environment-specific credentials

---

## 📋 DevTunnel vs Other Options

| Method | Ease | Range | Setup |
|--------|------|-------|-------|
| **localhost** | ⭐⭐⭐⭐⭐ | Phone on same WiFi | None |
| **IP Address** | ⭐⭐⭐⭐ | Phone on same WiFi | Find IP |
| **ADB (Android)** | ⭐⭐⭐ | USB connected | USB cable |
| **DevTunnel** | ⭐⭐⭐⭐ | Anywhere in world | Create tunnel |
| **ngrok** | ⭐⭐⭐⭐⭐ | Anywhere in world | Install & run |

---

## 🎯 Next Steps

1. **Verify setup:**
   ```bash
   cat .env
   # Should show: VITE_API_URL=https://ccrbcppp-8080.inc1.devtunnels.ms/api
   ```

2. **Restart dev server:**
   ```bash
   npm run dev:full
   ```

3. **Test on phone:**
   - Open: `https://ccrbcppp-8080.inc1.devtunnels.ms/`
   - Login with credentials
   - Navigate around app
   - Everything should work! ✅

4. **Test from different location:**
   - Phone on mobile data (not WiFi)
   - Should still work! ✅

---

## 📞 Support

**If DevTunnel stops working:**

1. Check DevTunnel dashboard for status
2. Restart tunnel from VS Code
3. Update `.env` with new URL
4. Restart dev server

**If you need a different tunnel:**

Use ngrok instead:
```bash
# Install ngrok
ngrok http 5000

# Get public URL, then update .env:
VITE_API_URL=https://your-ngrok-url/api
```

---

**Setup Date:** December 9, 2025
**Status:** ✅ Ready for Testing
**API URL:** `https://ccrbcppp-8080.inc1.devtunnels.ms/api`
