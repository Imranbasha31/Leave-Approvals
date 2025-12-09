# Leave Request Fetching Troubleshooting Guide

## Problem: Leave requests not fetching from MongoDB

### Diagnostic Steps

#### 1. Verify Backend API is Working
```bash
# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bashairfan518@gmail.com","password":"Irfan@86101"}'

# Get JWT token from response, then test leave requests
BEARER_TOKEN="your_token_here"

# Create leave request
curl -X POST http://localhost:5000/api/leave/requests \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentName":"Irfan Basha",
    "department":"Bsc Information Technology",
    "fromDate":"2025-12-15",
    "toDate":"2025-12-20",
    "reason":"Medical leave"
  }'

# Fetch leave requests
curl -X GET http://localhost:5000/api/leave/requests/my \
  -H "Authorization: Bearer $BEARER_TOKEN"
```

#### 2. Check MongoDB Data
```bash
# Count leave requests
docker exec approveiq-mongodb mongosh -u root -p rootpassword --authenticationDatabase admin \
  --eval "db.approveiq.leaverequests.countDocuments()"

# View all leave requests
docker exec approveiq-mongodb mongosh -u root -p rootpassword --authenticationDatabase admin \
  --eval "db.approveiq.leaverequests.find().pretty()"

# View specific user's leave requests
# First get user ID from MongoDB
docker exec approveiq-mongodb mongosh -u root -p rootpassword --authenticationDatabase admin \
  --eval "db.approveiq.users.findOne({email:'bashairfan518@gmail.com'})"

# Then search by studentId
docker exec approveiq-mongodb mongosh -u root -p rootpassword --authenticationDatabase admin \
  --eval "db.approveiq.leaverequests.find({studentId:ObjectId('USER_ID_HERE')})"
```

### Common Issues & Solutions

#### Issue 1: Empty Array `[]` Returned
**Symptoms:** API returns `[]` even after creating leave requests

**Causes:**
- Leave requests exist but filtering by wrong studentId
- Mismatch between ObjectId and string ID

**Solution:**
Check the backend filter in `leaveController.js`:
```javascript
// This line filters by studentId - ensure it matches the request
const leaveRequests = await LeaveRequest.find({ studentId: req.userId });
```

#### Issue 2: "401 Unauthorized" Error
**Symptoms:** Cannot fetch leave requests, getting 401

**Causes:**
- JWT token expired
- Token not included in Authorization header
- Token format incorrect

**Solution:**
1. Re-login to get fresh token
2. Check Authorization header format: `Bearer <token>`
3. Verify token is in `localStorage` (dev tools > Application > Storage)

#### Issue 3: Frontend Not Showing Data
**Symptoms:** API works, but frontend shows "No requests found"

**Likely Causes:**
- `fetchLeaveRequests()` not being called
- `leaveRequests` state not updated
- `getLeavesByStudent()` filtering incorrectly

**Debug Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for `[fetchLeaveRequests]` log messages
4. Check if data is being fetched: `console.log(leaveRequests)`
5. Verify filter: `console.log('Student ID:', user.id, 'Leave IDs:', leaveRequests.map(r => r.studentId))`

#### Issue 4: CORS Errors
**Symptoms:** "Access to XMLHttpRequest at ... has been blocked by CORS policy"

**Solution:**
CORS is already enabled in backend:
```javascript
app.use(cors());
```

But verify with:
```bash
curl -I http://localhost:5000/api/health
# Should show: Access-Control-Allow-Origin: *
```

### API Endpoints Reference

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /api/auth/login | No | Get JWT token |
| POST | /api/leave/requests | Yes | Create leave request |
| GET | /api/leave/requests/my | Yes | Get own leave requests |
| GET | /api/leave/requests/all | Yes | Get all leave requests |
| GET | /api/leave/approvals/stage/1 | Yes | Get pending approvals for stage 1 |
| POST | /api/leave/requests/{id}/approve | Yes | Approve leave request |
| POST | /api/leave/requests/{id}/reject | Yes | Reject leave request |

### Frontend Component Flow

```
MyRequests.tsx (page)
  ├─ useAuth() - get user
  ├─ useLeave() - get leaveRequests state
  ├─ useEffect on mount → fetchLeaveRequests()
  │   └─ Makes API call: GET /api/leave/requests/my
  │   └─ Updates leaveRequests state
  ├─ getLeavesByStudent(user.id)
  │   └─ Filters leaveRequests by studentId
  └─ Render LeaveRequestCard for each request
```

### Testing the Complete Workflow

Run the test script:
```bash
powershell -File test-leave-api.ps1
```

This will:
1. Login
2. Create a leave request
3. Fetch leave requests
4. Verify MongoDB

### Manual Test in Browser Console

```javascript
// Get token
const token = localStorage.getItem('token');

// Fetch leave requests
fetch('http://localhost:5000/api/leave/requests/my', {
  headers: {'Authorization': 'Bearer ' + token}
})
.then(r => r.json())
.then(data => console.log('Leave requests:', data))
.catch(e => console.error('Error:', e));

// Create a leave request
fetch('http://localhost:5000/api/leave/requests', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    studentName: 'Irfan Basha',
    department: 'Bsc Information Technology',
    fromDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
    toDate: new Date(Date.now() + 12*24*60*60*1000).toISOString().split('T')[0],
    reason: 'Medical leave'
  })
})
.then(r => r.json())
.then(data => console.log('Created:', data))
.catch(e => console.error('Error:', e));
```

### Backend Logs to Check

Watch backend logs while testing:
```bash
# For Docker
docker logs -f approveiq-app

# For dev mode
npm run dev:full
# Look for:
# [fetchLeaveRequests] messages
# MongoDB connection logs
# API endpoint hits
```

### Environment Variables to Verify

In `.env` or dev environment:
- `VITE_API_URL=http://localhost:5000/api` (frontend)
- `MONGODB_URI=mongodb://root:rootpassword@localhost:27017/approveiq?authSource=admin` (backend)
- `JWT_SECRET=your-secret-key` (backend)

### Quick Checklist

- [ ] Backend running (npm run dev:backend or docker)
- [ ] MongoDB running and connected
- [ ] Can login and get JWT token
- [ ] Can create leave request via API
- [ ] Leave request appears in MongoDB
- [ ] Can fetch leave requests via API
- [ ] Frontend shows token in localStorage
- [ ] Frontend logs show fetch attempt in console
- [ ] No CORS errors in browser console
- [ ] UI shows leave requests in MyRequests page

If all checks pass but data still doesn't show, the issue is likely in the frontend state management or filtering logic. Use browser DevTools to inspect:
- Redux/Context state
- Component props
- API response data
