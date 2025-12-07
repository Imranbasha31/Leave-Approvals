# Leave Approval System - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      WEB BROWSER                                 │
│                  (React + TypeScript)                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTP/HTTPS (Port 8080)
                             │
        ┌────────────────────▼────────────────────┐
        │     FRONTEND APPLICATION (Vite)         │
        │  ┌────────────────────────────────────┐ │
        │  │   React Components & Pages         │ │
        │  │  - Dashboard, ApplyLeave, etc.    │ │
        │  └────────────────────────────────────┘ │
        │  ┌────────────────────────────────────┐ │
        │  │   Context API & State Management   │ │
        │  │  - AuthContext (User Login)        │ │
        │  │  - LeaveContext (Requests)         │ │
        │  └────────────────────────────────────┘ │
        └────────────────────┬────────────────────┘
                             │
                    REST API Calls
                  (Port 5000 /api/*)
                             │
        ┌────────────────────▼────────────────────────────┐
        │        BACKEND API (Express.js)                 │
        │  ┌──────────────────────────────────────────┐  │
        │  │         Express Server (Node.js)          │  │
        │  │  - REST API Routes                       │  │
        │  │  - JWT Authentication Middleware         │  │
        │  │  - CORS Configuration                    │  │
        │  └──────────────────────────────────────────┘  │
        │  ┌──────────────────────────────────────────┐  │
        │  │         Route Handlers                    │  │
        │  │  ├─ /api/auth/*      (authRoutes)        │  │
        │  │  └─ /api/leave/*     (leaveRoutes)       │  │
        │  └──────────────────────────────────────────┘  │
        │  ┌──────────────────────────────────────────┐  │
        │  │    Controllers & Business Logic           │  │
        │  │  ├─ authController.js                    │  │
        │  │  │  (login, register, getCurrentUser)    │  │
        │  │  └─ leaveController.js                   │  │
        │  │     (CRUD operations, approvals)         │  │
        │  └──────────────────────────────────────────┘  │
        └────────────────────┬────────────────────────────┘
                             │
                    MongoDB Query Protocol
                         (Port 27017)
                             │
        ┌────────────────────▼────────────────────────────┐
        │           MongoDB Database                       │
        │  ┌──────────────────────────────────────────┐  │
        │  │  Collections                             │  │
        │  │  ├─ users                                │  │
        │  │  │  ├─ id, name, email, password        │  │
        │  │  │  ├─ role, department, studentId      │  │
        │  │  │  └─ timestamps                        │  │
        │  │  │                                       │  │
        │  │  └─ leaverequests                        │  │
        │  │     ├─ id, studentId, studentName       │  │
        │  │     ├─ fromDate, toDate, reason         │  │
        │  │     ├─ status, currentStage             │  │
        │  │     ├─ approvals (nested array)         │  │
        │  │     └─ timestamps                        │  │
        │  └──────────────────────────────────────────┘  │
        └──────────────────────────────────────────────────┘
```

## Data Flow

### Login Flow
```
User Input (Email/Password)
           ↓
    Frontend Form
           ↓
    POST /api/auth/login
           ↓
    Backend Validation
           ↓
    MongoDB User Lookup
           ↓
    Password Verification (bcrypt)
           ↓
    JWT Token Generation
           ↓
    Token Stored in localStorage
           ↓
    AuthContext Updated
           ↓
    Redirect to Dashboard
```

### Leave Request Submission Flow
```
Student Fills Form
           ↓
    Input Validation (Zod)
           ↓
    POST /api/leave/requests
           (with JWT Token)
           ↓
    Backend Validates Token
           ↓
    Create LeaveRequest in MongoDB
           ↓
    Initialize with currentStage: 1
           (Pending Advisor Approval)
           ↓
    Response to Frontend
           ↓
    Update LeaveContext
           ↓
    UI Updates
```

### Approval Flow
```
Advisor Views Pending Requests
           ↓
    POST /api/leave/requests/:id/approve
           ↓
    Backend Validates Approver Role
           ↓
    Create Approval Record
           ↓
    Move to currentStage: 2 (HOD)
           ↓
    Update MongoDB
           ↓
    HOD Reviews & Approves
           ↓
    Create Approval Record
           ↓
    Move to currentStage: 3 (Principal)
           ↓
    Principal Reviews & Approves
           ↓
    Create Approval Record
           ↓
    Mark Status: approved
           ↓
    Process Complete
```

## File Structure

```
leave-approval-flow-main/
├── frontend/ (Root is frontend)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # shadcn UI components
│   │   │   └── *.tsx        # Custom components
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx    # Now calls API
│   │   │   └── LeaveContext.tsx   # Now calls API
│   │   ├── pages/           # Route pages
│   │   ├── types/
│   │   │   └── leave.ts     # Type definitions
│   │   └── lib/
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json         # Added dev:full, seed:db scripts
│   ├── .env.local           # Frontend API URL
│   └── tsconfig.json
│
├── backend/                 # NEW - Node.js Backend
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js                  # User schema
│   │   │   └── LeaveRequest.js          # Leave & Approval schemas
│   │   ├── routes/
│   │   │   ├── authRoutes.js            # Auth endpoints
│   │   │   └── leaveRoutes.js           # Leave endpoints
│   │   ├── controllers/
│   │   │   ├── authController.js        # Auth logic
│   │   │   └── leaveController.js       # Leave logic
│   │   ├── middleware/
│   │   │   └── auth.js                  # JWT middleware
│   │   └── server.js                    # Express app
│   ├── seed.js                          # Database seeding
│   ├── package.json
│   ├── .env                             # MongoDB, JWT config
│   ├── README.md
│   └── .gitignore
│
├── MONGODB_SETUP.md         # Database setup guide
└── README.md                # Updated with backend info
```

## Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - Component library
- **React Router** - Routing
- **Zod** - Validation

### Backend
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - Object modeling
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin support

### Development
- **Node.js** - Runtime
- **npm** - Package manager
- **concurrently** - Run multiple scripts

## API Authentication

All protected endpoints require JWT token in Authorization header:

```javascript
headers: {
  'Authorization': 'Bearer <token>',
  'Content-Type': 'application/json'
}
```

Token obtained from `/api/auth/login` and stored in localStorage.
Valid for 24 hours.

## Key Features Implemented

✅ User authentication with JWT  
✅ Role-based access control  
✅ Leave request creation & tracking  
✅ Multi-stage approval workflow  
✅ Password hashing with bcryptjs  
✅ MongoDB data persistence  
✅ RESTful API design  
✅ CORS enabled for frontend access  
✅ Database seeding with test users  
✅ Frontend-backend separation  

## Environment Variables

**Frontend (.env.local)**
```
VITE_API_URL=http://localhost:5000/api
```

**Backend (.env)**
```
MONGODB_URI=mongodb://localhost:27017/leave-approval
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

## Running the Application

```bash
# Install all dependencies
npm install && cd backend && npm install && cd ..

# Seed database (optional)
npm run seed:db

# Run everything together
npm run dev:full

# Or separately:
npm run dev              # Frontend only (port 8080)
cd backend && npm run dev  # Backend only (port 5000)
```
