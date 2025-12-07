# Getting Started with MongoDB Backend

This guide will get you up and running with the Leave Approval System with full MongoDB integration.

## Prerequisites

- **Node.js** (v16+)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or equivalent package manager
- **Git** (optional, for cloning)

## Setup Steps

### Step 1: Install Dependencies

From the root directory:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

This installs:
- **Frontend**: React, Vite, TailwindCSS, shadcn/ui, React Router
- **Backend**: Express, MongoDB, Mongoose, JWT, bcryptjs, CORS

### Step 2: Configure MongoDB

Choose one of two options:

#### Option A: Local MongoDB (Windows)

1. Download MongoDB Community Edition:
   - Visit https://www.mongodb.com/try/download/community
   - Download Windows Server (MSI) installer
   - Run installer and follow defaults
   
2. Start MongoDB:
   ```bash
   mongod
   ```
   This starts MongoDB on `mongodb://localhost:27017`

#### Option B: MongoDB Atlas (Cloud - Recommended)

1. Create free account: https://www.mongodb.com/cloud/atlas
2. Create new project (e.g., "leave-approval")
3. Create Cluster (M0 free tier is fine)
4. Create Database user and get password
5. Click "Connect" and copy connection string
6. Connection string format:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/leave-approval?retryWrites=true&w=majority
   ```

### Step 3: Environment Configuration

**Create `backend/.env`:**

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/leave-approval

# Server Configuration
PORT=5000

# JWT Secret (change this to a random string in production)
JWT_SECRET=your-secret-key-change-in-production
```

**Create `.env.local` (in root):**

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 4: Initialize Database with Test Data

Seed the database with test users:

```bash
npm run seed:db
```

This creates 5 test users:

| Email | Password | Role | Department |
|-------|----------|------|------------|
| student@college.edu | password123 | Student | Computer Science |
| advisor@college.edu | password123 | Class Advisor | Computer Science |
| hod@college.edu | password123 | HOD | Computer Science |
| principal@college.edu | password123 | Principal | - |
| admin@college.edu | password123 | Admin | - |

### Step 5: Start the Application

**Option 1: Run frontend only (mock data)**
```bash
npm run dev
# Frontend: http://localhost:8080
```

**Option 2: Run full stack (frontend + backend with MongoDB)**
```bash
npm run dev:full
# Frontend: http://localhost:8080
# Backend API: http://localhost:5000
```

**Option 3: Run backend separately**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5000
```

## Testing the Application

### 1. Login
- Go to http://localhost:8080
- Use any test credentials from the table above
- Example: `student@college.edu` / `password123`

### 2. Submit Leave Request
- Click "Apply for Leave"
- Fill in the form (dates, reason)
- Click "Submit Request"
- Data is now saved in MongoDB

### 3. Check Backend
- Verify request was saved: Check MongoDB database
- View in Compass: `mongodb://localhost:27017/leave-approval`
- Collections: `users`, `leaverequests`

### 4. Test Role-Based Views
- Login as different roles to see role-specific dashboards
- Advisors see approval requests
- HOD sees stage 2 approvals
- Principal sees stage 3 approvals

## Verification Checklist

- [ ] Backend is running without errors
- [ ] Can login with test credentials
- [ ] Can create leave request
- [ ] Leave request appears in MongoDB
- [ ] Can see dashboard with correct role
- [ ] API response times are reasonable
- [ ] No CORS errors in browser console

## Common Issues & Solutions

### MongoDB Connection Error

**Error**: `MongooseError: Cannot connect to MongoDB`

**Solution**:
```bash
# Check if MongoDB is running
# Windows: Services → MongoDB Server should be running
# Or run: mongod

# Check connection string
# Local: mongodb://localhost:27017/leave-approval
# Atlas: Check password and connection format
```

### API Connection Error (Frontend)

**Error**: `Failed to fetch from localhost:5000`

**Solution**:
```bash
# Ensure backend is running
cd backend && npm run dev

# Check .env.local has correct API URL
VITE_API_URL=http://localhost:5000/api

# Check CORS error in browser console
# Backend has CORS enabled in server.js
```

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Find process using port 5000
# Windows PowerShell:
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID 12345 /F

# Or change PORT in backend/.env
PORT=5001
```

### Seed Script Fails

**Error**: `Failed to seed database`

**Solution**:
```bash
# Ensure MongoDB is running
mongod

# Clear and retry
cd backend
npm run seed

# Check MongoDB connection string in .env
```

## File Structure

```
project-root/
├── src/                          # Frontend React code
│   ├── contexts/
│   │   ├── AuthContext.tsx      # ← Now connects to API
│   │   └── LeaveContext.tsx     # ← Now connects to API
│   └── ...
├── backend/                      # ← NEW: Express backend
│   ├── src/
│   │   ├── models/              # MongoDB schemas
│   │   ├── routes/              # API endpoints
│   │   ├── controllers/         # Business logic
│   │   ├── middleware/          # Auth middleware
│   │   └── server.js            # Express app
│   ├── seed.js                  # Database seeding
│   ├── package.json
│   ├── .env                     # Backend config
│   └── README.md
├── .env.local                   # Frontend API URL
├── package.json                 # ← Updated with dev:full
├── MONGODB_SETUP.md             # This file
├── ARCHITECTURE.md              # System design
└── README.md                    # ← Updated with backend info
```

## API Endpoints Overview

All protected endpoints require JWT token in Authorization header.

### Authentication
```
POST   /api/auth/login        - Login (no auth required)
POST   /api/auth/register     - Register (no auth required)
GET    /api/auth/me           - Get current user (requires auth)
```

### Leave Requests
```
POST   /api/leave/requests           - Create request (requires auth)
GET    /api/leave/requests/my        - Get my requests (requires auth)
GET    /api/leave/requests/all       - Get all requests (requires auth)
POST   /api/leave/requests/:id/approve - Approve (requires auth)
POST   /api/leave/requests/:id/reject  - Reject (requires auth)
```

## Production Deployment

When ready to deploy to production:

1. **Backend Deployment** (Heroku, AWS, Railway, etc.)
   - Update `MONGODB_URI` to production MongoDB Atlas cluster
   - Set strong random `JWT_SECRET`
   - Deploy `backend/` folder
   - Get production backend URL (e.g., `https://api.myapp.com`)

2. **Frontend Deployment** (Netlify, Vercel, etc.)
   - Update `.env.production` with production backend URL
   - Build: `npm run build`
   - Deploy `dist/` folder

3. **Environment Configuration**
   ```env
   # Frontend .env.production
   VITE_API_URL=https://api.myapp.com

   # Backend .env (production)
   MONGODB_URI=mongodb+srv://user:pass@prod-cluster.mongodb.net/leave-approval
   PORT=5000
   JWT_SECRET=<strong-random-secret>
   NODE_ENV=production
   ```

## Next Steps

1. **Customize the System**
   - Modify approval workflow
   - Add additional fields to leave request
   - Change department list

2. **Add Features**
   - Email notifications on approvals
   - File upload for supporting documents
   - Analytics dashboard
   - Bulk user import

3. **Enhance Security**
   - Implement 2FA
   - Add rate limiting
   - Enhanced role-based permissions

4. **Performance**
   - Add caching (Redis)
   - Optimize MongoDB queries
   - CDN for static assets

## Documentation

- **`README.md`** - Main project documentation
- **`ARCHITECTURE.md`** - System architecture and data flow
- **`IMPLEMENTATION_SUMMARY.md`** - What was implemented
- **`backend/README.md`** - Backend API reference
- **`backend/.env`** - Environment configuration options

## Support

### Check Logs
```bash
# Frontend errors appear in browser console
# Backend errors appear in terminal

# MongoDB connection logs in backend terminal
# API request logs: Use Postman or curl to test endpoints
```

### Test with Postman
```
1. Import backend API collection
2. Set Authorization header with JWT token
3. Test each endpoint:
   - POST /api/auth/login
   - GET /api/leave/requests/my
   - POST /api/leave/requests
   - etc.
```

### Database Inspection
- **Local**: MongoDB Compass - Connect to `mongodb://localhost:27017`
- **Cloud**: MongoDB Atlas Console - View in web dashboard

## Frequently Asked Questions

**Q: Do I need to run MongoDB separately?**
A: Yes. MongoDB must be running for the backend to work. Start with `mongod` or use MongoDB Atlas (cloud).

**Q: Can I use only the frontend without backend?**
A: Yes. Use `npm run dev` for frontend only (uses mock data). But to persist data to MongoDB, backend must be running.

**Q: How long are authentication tokens valid?**
A: 24 hours. Tokens expire and require re-login.

**Q: Can I change the default password?**
A: Yes. Edit `seed.js` before running `npm run seed:db`.

**Q: How do I reset the database?**
A: Run `npm run seed:db` again - it clears and repopulates data.

**Q: Can I deploy to production now?**
A: Yes, but review `IMPLEMENTATION_SUMMARY.md` for production checklist.

---

**You're all set! Happy coding! 🚀**
