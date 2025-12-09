# Quick Start: Mobile Phone Access

## 🚀 Fastest Way to Test on Phone

### Step 1: Find Your IP
```powershell
# Windows PowerShell
ipconfig

# Look for: IPv4 Address (like 192.168.1.2)
```

### Step 2: Start Development
```bash
npm run dev:full
```

### Step 3: Open on Phone
```
Browser URL: http://YOUR_IP:5000

Example: http://192.168.1.2:5000
```

### Step 4: Login
```
Email: bashairfan518@gmail.com
Password: Irfan@86101
```

---

## ✅ What Now Works

✅ Auto-detects your computer's IP address
✅ Frontend connects to correct API endpoint
✅ Login now works on phone!
✅ All features work on mobile

---

## 🔧 If Still Not Working

1. **Verify same WiFi network**
   - Phone and computer must be on same WiFi

2. **Check backend is running**
   ```bash
   # Terminal should show:
   ✓ ApproveIQ Server running on http://0.0.0.0:5000
   ```

3. **Clear browser cache on phone**
   - Settings → Browser → Clear Cache

4. **Try hardcoding IP in .env**
   ```env
   VITE_API_URL=http://192.168.1.2:5000/api
   ```

5. **Restart dev server**
   ```bash
   npm run dev:full
   ```

---

## 📱 Alternative: USB Debugging (Android)

```bash
# Connect phone via USB
# Enable Developer Mode on phone

adb reverse tcp:5000 tcp:5000

# Then on phone browser:
http://localhost:5000
```

---

## 🌍 Remote Access (Works Anywhere)

```bash
# Install ngrok: https://ngrok.com
ngrok http 5000

# Set in .env:
VITE_API_URL=https://abc123.ngrok.io/api

# On phone from anywhere:
https://abc123.ngrok.io
```

---

**Version:** 1.0
**Last Updated:** December 9, 2025
