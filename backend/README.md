# Leave Approval System - Backend

Node.js/Express backend API with MongoDB database for the Leave Approval Flow system.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas cloud database)

## Installation

```bash
npm install
```

## Environment Setup

Create or edit `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017/leave-approval
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

### MongoDB Setup Options

#### Option 1: Local MongoDB
1. Download and install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB server:
   ```bash
   mongod
   ```
3. Use `mongodb://localhost:27017/leave-approval` as MONGODB_URI

#### Option 2: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and database
3. Get connection string from Atlas dashboard
4. Use format: `mongodb+srv://username:password@cluster.mongodb.net/leave-approval`

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server runs on `http://localhost:5000`

## Seeding Initial Data

Populate database with mock users:

```bash
npm run seed
```

This creates 5 test users:
- **Student**: `student@college.edu` / `password123`
- **Advisor**: `advisor@college.edu` / `password123`
- **HOD**: `hod@college.edu` / `password123`
- **Principal**: `principal@college.edu` / `password123`
- **Admin**: `admin@college.edu` / `password123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user (requires auth)

### Leave Requests
- `POST /api/leave/requests` - Create leave request (requires auth)
- `GET /api/leave/requests/my` - Get student's leave requests (requires auth)
- `GET /api/leave/requests/all` - Get all leave requests (requires auth)
- `GET /api/leave/approvals/stage/:stage` - Get pending approvals for stage (requires auth)
- `POST /api/leave/requests/:leaveId/approve` - Approve leave request (requires auth)
- `POST /api/leave/requests/:leaveId/reject` - Reject leave request (requires auth)

## Project Structure

```
backend/
├── src/
│   ├── models/          # MongoDB schemas
│   │   ├── User.js
│   │   └── LeaveRequest.js
│   ├── routes/          # API route definitions
│   │   ├── authRoutes.js
│   │   └── leaveRoutes.js
│   ├── controllers/     # Request handlers
│   │   ├── authController.js
│   │   └── leaveController.js
│   ├── middleware/      # Express middleware
│   │   └── auth.js      # JWT authentication
│   └── server.js        # Express app entry point
├── seed.js              # Database seed script
├── .env                 # Environment variables
└── package.json
```

## Key Technologies

- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## Notes

- All API endpoints (except `/api/auth/login` and `/api/auth/register`) require JWT token in Authorization header
- Tokens are valid for 24 hours
- Leave requests go through 3 approval stages: Class Advisor → HOD → Principal
