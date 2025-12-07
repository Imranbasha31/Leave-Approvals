# MongoDB Setup Guide

## Quick Start

### Step 1: Set Up MongoDB

**Choose one option:**

#### Local MongoDB
```bash
# Windows: Download from https://www.mongodb.com/try/download/community
# Install and MongoDB Community Server will run on port 27017

# Or use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create new Project → Create Cluster
4. Get connection string from "Connect" button
5. Update `MONGODB_URI` in `backend/.env`

### Step 2: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 3: Configure Environment

Create `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/leave-approval
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

Create `.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 4: Seed Database (Optional)

Populate with test users:
```bash
npm run seed:db
```

### Step 5: Run Application

**Option A: Frontend only (with mock data)**
```bash
npm run dev
```

**Option B: Full stack (frontend + backend with MongoDB)**
```bash
npm run dev:full
```

- Frontend: http://localhost:8080
- Backend: http://localhost:5000

## Test Credentials

After seeding the database, use these to log in:

| Role | Email | Password |
|------|-------|----------|
| Student | student@college.edu | password123 |
| Class Advisor | advisor@college.edu | password123 |
| HOD | hod@college.edu | password123 |
| Principal | principal@college.edu | password123 |
| Admin | admin@college.edu | password123 |

## Database Collections

### Users
- Stores user profiles with encrypted passwords
- Fields: name, email, password (hashed), role, department, studentId
- Roles: student, advisor, hod, principal, admin

### Leave Requests
- Stores leave applications and their approval history
- Fields: studentId, studentName, department, dates, reason, status, approvals
- Status: pending, approved, rejected
- Approval stages: 1 (Advisor), 2 (HOD), 3 (Principal)

## API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /api/auth/login | No | User login |
| POST | /api/auth/register | No | User registration |
| GET | /api/auth/me | Yes | Get current user |
| POST | /api/leave/requests | Yes | Create leave request |
| GET | /api/leave/requests/my | Yes | Get student's requests |
| GET | /api/leave/requests/all | Yes | Get all requests |
| GET | /api/leave/approvals/stage/:stage | Yes | Get pending approvals |
| POST | /api/leave/requests/:id/approve | Yes | Approve request |
| POST | /api/leave/requests/:id/reject | Yes | Reject request |

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` (local) or check Atlas cluster status
- Verify `MONGODB_URI` in `.env`
- Test connection: `telnet localhost 27017`

### Backend Won't Start
```bash
# Clear node_modules and reinstall
cd backend
rm -r node_modules
npm install
npm run dev
```

### Frontend Can't Connect to Backend
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `.env.local`
- Check browser console for CORS errors
- Verify CORS is enabled in `backend/src/server.js`

### Seed Script Fails
- Ensure MongoDB is running
- Check MongoDB has no existing users (script clears them)
- Run with proper connection: `npm run seed:db`

## Next Steps

1. **Production Deployment**: Update `MONGODB_URI` to production MongoDB Atlas instance
2. **Security**: Change `JWT_SECRET` to strong random string in production
3. **Email Notifications**: Add nodemailer for approval notifications
4. **File Uploads**: Implement S3 or similar for document storage
5. **Analytics**: Add MongoDB aggregation for reports
