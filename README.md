# ApproveIQ - Digital Leave Approval System

A modern, streamlined digital leave approval workflow system designed for colleges and educational institutions. ApproveIQ simplifies the leave request process through a structured 3-step approval workflow: Class Advisor → HOD → Principal.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Architecture](#project-architecture)
- [Key Concepts](#key-concepts)
- [Available Routes](#available-routes)
- [User Roles & Permissions](#user-roles--permissions)
- [Mock Credentials](#mock-credentials)
- [Development](#development)
- [Building for Production](#building-for-production)

## 🎯 Overview

ApproveIQ is a comprehensive leave management system built with modern web technologies. It facilitates the complete lifecycle of leave requests from student application through multi-stage approval to final decision recording.

The system implements a hierarchical approval workflow with role-based access control, ensuring proper governance and transparency in the leave approval process.

## ✨ Features

### Core Functionality
- **Leave Application**: Students can submit leave requests with detailed information
- **Multi-Stage Approval**: 3-tier approval workflow (Advisor → HOD → Principal)
- **Real-time Status Tracking**: Track leave request status at each approval stage
- **Document Management**: Support for uploading proof/supporting documents
- **Approval History**: Complete audit trail of all approvals and rejections

### User Roles
- **Students**: Apply for leave, view personal leave history
- **Class Advisors**: Review and approve/reject student requests (Stage 1)
- **HOD (Head of Department)**: Second-level approval (Stage 2)
- **Principal**: Final approval authority (Stage 3)
- **Admin**: System-wide management and reporting

### Dashboard Features
- **Role-Based Dashboards**: Customized interface for each user role
- **Quick Statistics**: Pending, approved, and rejected leave counts
- **Leave History**: Comprehensive view of all requests
- **Workflow Timeline**: Visual representation of approval stages
- **Reports**: Analytics and insights into leave patterns
- **User Management**: Admin controls for managing users

## 🛠 Tech Stack

### Frontend
- **React 18+**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **Lucide React**: Icon library
- **date-fns**: Date manipulation and formatting

### State Management & Data
- **React Context API**: Global state management
- **React Query**: Server state management and caching
- **TanStack Query**: Advanced data synchronization

### Styling & UI
- **Tailwind CSS**: Responsive design
- **PostCSS**: CSS transformation
- **Class Variance Authority**: Utility composition
- **Radix UI**: Accessible component primitives

### Development Tools
- **ESLint**: Code quality and linting
- **TypeScript**: Static type checking

## 📁 Project Structure

```
leave-approval-flow-main/
├── src/
│   ├── components/                 # Reusable React components
│   │   ├── ui/                     # Shadcn UI components
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   └── [other UI components]
│   │   ├── DashboardLayout.tsx     # Main dashboard wrapper
│   │   ├── LeaveRequestCard.tsx    # Leave request display component
│   │   ├── StatusBadge.tsx         # Status indicator component
│   │   ├── WorkflowTimeline.tsx    # Approval workflow visualization
│   │   ├── NavLink.tsx             # Navigation link component
│   │   └── [other components]
│   │
│   ├── contexts/                   # React Context providers
│   │   ├── AuthContext.tsx         # Authentication state & logic
│   │   └── LeaveContext.tsx        # Leave management state & logic
│   │
│   ├── pages/                      # Page components (routes)
│   │   ├── Index.tsx               # Landing/home page
│   │   ├── Login.tsx               # Login page
│   │   ├── Dashboard.tsx           # Main dashboard (role-based)
│   │   ├── ApplyLeave.tsx          # Leave application form
│   │   ├── MyRequests.tsx          # Student's leave requests
│   │   ├── Approvals.tsx           # Pending approvals for staff
│   │   ├── AllRequests.tsx         # All requests (admin view)
│   │   ├── ManageUsers.tsx         # User management (admin)
│   │   ├── Reports.tsx             # Analytics and reports
│   │   └── NotFound.tsx            # 404 page
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── use-mobile.tsx          # Mobile detection hook
│   │   └── use-toast.ts            # Toast notification hook
│   │
│   ├── lib/                        # Utility libraries
│   │   └── utils.ts                # Helper functions
│   │
│   ├── types/                      # TypeScript type definitions
│   │   └── leave.ts                # Leave-related types & interfaces
│   │
│   ├── App.tsx                     # Root app component with routing
│   ├── main.tsx                    # React DOM render entry
│   ├── App.css                     # App-level styles
│   └── index.css                   # Global styles
│
├── public/                         # Static assets
│   └── robots.txt
│
├── Configuration Files
│   ├── package.json                # Dependencies and scripts
│   ├── vite.config.ts              # Vite configuration
│   ├── tsconfig.json               # TypeScript config
│   ├── tsconfig.app.json           # App TypeScript config
│   ├── tsconfig.node.json          # Node TypeScript config
│   ├── tailwind.config.ts           # Tailwind CSS config
│   ├── postcss.config.js           # PostCSS config
│   ├── eslint.config.js            # ESLint config
│   ├── components.json             # UI components config
│   └── index.html                  # HTML entry point
│
└── bun.lockb                       # Bun package lock file
```

## 📋 Prerequisites

- **Node.js** 16.x or higher (or Bun)
- **npm** or **yarn** or **Bun** package manager
- A modern web browser
- **MongoDB** (local or MongoDB Atlas cloud)

## 🗄️ Database Setup

This application uses MongoDB for data persistence. You have two options:

### Option 1: Local MongoDB Installation
1. Download MongoDB Community Edition from https://www.mongodb.com/try/download/community
2. Install and start MongoDB server
3. By default runs on `mongodb://localhost:27017`

### Option 2: MongoDB Atlas (Recommended for Production)
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and database
3. Get connection string from Atlas dashboard
4. Connection format: `mongodb+srv://username:password@cluster.mongodb.net/leave-approval`

For detailed backend configuration, see [Backend README](./backend/README.md)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd leave-approval-flow-main
```

### 2. Install Dependencies

**Frontend dependencies:**
```bash
npm install
```

**Backend dependencies:**
```bash
cd backend
npm install
cd ..
```

Or using yarn:
```bash
yarn install
cd backend && yarn install && cd ..
```

Or using Bun:
```bash
bun install
```

### 3. Configure Environment Variables

Create `.env.local` in the root directory (frontend):
```env
VITE_API_URL=http://localhost:5000/api
```

Create `.env` in the `backend` directory:
```env
MONGODB_URI=mongodb://localhost:27017/leave-approval
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

### 4. Seed Initial Data (Optional)

Populate database with test users:
```bash
npm run seed:db
```

Test credentials:
- **Student**: student@college.edu / password123
- **Advisor**: advisor@college.edu / password123
- **HOD**: hod@college.edu / password123
- **Principal**: principal@college.edu / password123
- **Admin**: admin@college.edu / password123

## 🏃 Running the Application

### Development Mode (Frontend only)

```bash
npm run dev
```

Available at `http://localhost:8080`

### Development Mode (Frontend + Backend)

Run both frontend and backend simultaneously:
```bash
npm run dev:full
```

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5000/api`

### Production Build

Create an optimized production build:

```bash
npm run build
```

### Development Build

Create a development build for testing:

```bash
npm run build:dev
```

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## 🏛 Project Architecture

### Component Hierarchy

```
App
├── AuthProvider
│   └── LeaveProvider
│       ├── QueryClientProvider
│       ├── TooltipProvider
│       └── Routes
│           ├── Index (Public)
│           ├── Login (Public)
│           └── ProtectedRoute
│               ├── Dashboard
│               ├── ApplyLeave
│               ├── MyRequests
│               ├── Approvals
│               ├── AllRequests
│               ├── ManageUsers
│               ├── Reports
│               └── NotFound (Fallback)
```

### State Management

**AuthContext**: Manages user authentication and session
- Current logged-in user
- Login/logout functionality
- Authentication state

**LeaveContext**: Manages leave request data
- Leave request list
- CRUD operations for requests
- Approval/rejection logic
- Stage-based filtering

### Data Flow

1. **User Authentication**: Handled by `AuthContext`
2. **Leave Data**: Managed by `LeaveContext`
3. **Component Props**: Passed through component hierarchy
4. **Side Effects**: Managed with React hooks

## 🔑 Key Concepts

### User Roles

| Role | Responsibility | Access Level |
|------|-----------------|--------------|
| **Student** | Submit leave requests | View own requests |
| **Class Advisor** | Stage 1 approval | Approve/reject student requests |
| **HOD** | Stage 2 approval | Review advisor-approved requests |
| **Principal** | Stage 3 approval | Final approval authority |
| **Admin** | System management | Full system access |

### Leave Status

- **Pending**: Awaiting approval at current stage
- **Approved**: Successfully approved
- **Rejected**: Rejected at any stage

### Approval Stages

1. **Stage 1**: Class Advisor approval
2. **Stage 2**: HOD approval
3. **Stage 3**: Principal approval

### Leave Request Attributes

- `id`: Unique identifier
- `studentId`: Student submitting the request
- `studentName`: Student's full name
- `department`: Academic department
- `fromDate`: Leave start date
- `toDate`: Leave end date
- `reason`: Reason for leave
- `proofFile`: Optional supporting documentation
- `currentStage`: Current approval stage (1-3)
- `status`: Current status
- `createdAt`: Request creation timestamp
- `approvals`: Array of approval decisions

## 🛣 Available Routes

### Public Routes
- `/` - Landing/home page
- `/login` - User login

### Protected Routes (Authenticated Users)
- `/dashboard` - Main dashboard (role-based view)
- `/dashboard/apply` - Apply for leave
- `/dashboard/my-requests` - View personal leave requests
- `/dashboard/approvals` - View pending approvals (for approvers)
- `/dashboard/all-requests` - View all requests (admin)
- `/dashboard/users` - User management (admin)
- `/dashboard/reports` - Analytics and reports
- `*` - 404 Not Found page

## 👥 User Roles & Permissions

### Student
- **Can**:
  - Apply for leave
  - View own leave requests
  - View approval history
  - Download documents
- **Cannot**:
  - Approve other requests
  - Modify approved requests
  - View other students' requests

### Class Advisor
- **Can**:
  - View assigned student requests (Stage 1)
  - Approve/reject requests
  - Add comments
  - View request details
- **Cannot**:
  - Approve own requests (if student)
  - Access Stage 2+ functions

### HOD
- **Can**:
  - View Stage 2 pending requests
  - Approve/reject advisor-approved requests
  - Add comments
  - View request history
- **Cannot**:
  - Approve Stage 1 requests

### Principal
- **Can**:
  - View Stage 3 pending requests
  - Provide final approval/rejection
  - Add comments
  - View complete approval history
- **Cannot**:
  - Approve earlier stages

### Admin
- **Can**:
  - Access all functionality
  - View all requests
  - Manage users
  - Generate reports
  - System-wide administration

## 🔐 Mock Credentials

For development and testing, use the following credentials (password: `password123`):

| Email | Role | Name |
|-------|------|------|
| student@college.edu | Student | John Student |
| advisor@college.edu | Class Advisor | Dr. Sarah Advisor |
| hod@college.edu | HOD | Dr. Michael HOD |
| principal@college.edu | Principal | Prof. Elizabeth Principal |
| admin@college.edu | Admin | Admin User |

## 💻 Development

### Linting

Check code quality:

```bash
npm run lint
```

### Code Structure

- **Components**: Reusable UI elements in `src/components/`
- **Pages**: Full-page components representing routes in `src/pages/`
- **Contexts**: Global state management in `src/contexts/`
- **Types**: TypeScript definitions in `src/types/`
- **Hooks**: Custom React hooks in `src/hooks/`
- **Utils**: Helper functions in `src/lib/`

### Adding New Features

1. **Create Components**: Add reusable components in `src/components/`
2. **Define Types**: Update types in `src/types/leave.ts`
3. **Add Contexts**: If needed, extend context providers
4. **Create Pages**: Add new page in `src/pages/`
5. **Update Routes**: Register route in `App.tsx`
6. **Add Styling**: Use Tailwind classes and shadcn/ui components

## 🔨 Building for Production

### Step 1: Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Step 2: Verify the Build

```bash
npm run preview
```

This serves the production build locally for testing.

### Step 3: Deploy

Deploy the `dist/` folder to your hosting provider:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## 📝 Notes

- The application uses **mock data** and **context-based state management** for demonstration
- For production, connect to a real backend API
- Implement proper authentication (JWT, OAuth, etc.)
- Add database integration for data persistence
- Set up proper error handling and logging
- Implement role-based API access control

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is private. For licensing information, contact the project owner.

## 📞 Support

For issues, questions, or suggestions, please create an issue in the repository.

---

**Last Updated**: December 2025
