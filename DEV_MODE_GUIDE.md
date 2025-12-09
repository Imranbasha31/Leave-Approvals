# Development Mode Guide for ApproveIQ

## Quick Start with npm run dev:full

This command runs both frontend and backend in development mode:

```bash
npm run dev:full
```

**What it does:**
- Frontend: Vite dev server on http://localhost:5173 (hot reload)
- Backend: Node.js with `--watch` on http://localhost:5000 (auto-restart on file changes)
- Database: MongoDB in Docker container (persistent storage)

## Accessing the Application

### Frontend Development
- **URL**: http://localhost:5173
- **Features**: Hot Module Replacement (HMR), automatic reload on code changes
- **API calls to**: http://localhost:5000/api

### Backend API
- **URL**: http://localhost:5000/api
- **Health check**: http://localhost:5000/api/health
- **Features**: Auto-restart on file changes (`--watch` flag)

## Data Persistence in Development

### Starting Services

```bash
# Start MongoDB container (one-time setup)
docker-compose up -d mongodb

# Or start full stack with Docker
docker-compose up -d

# Then in a separate terminal, start dev servers
npm run dev:full
```

### Data Preservation

**Your data persists because:**
1. MongoDB runs in Docker with named volume `mongodb_data`
2. All leave requests and user data stored in MongoDB volume
3. Volume persists even when containers stop

**To keep data when stopping:**
```bash
# Safe - data preserved
docker-compose down

# Then restart
docker-compose up -d mongodb
npm run dev:full
```

**To completely reset data:**
```bash
# Dangerous - deletes all data!
docker-compose down -v

# Then restart fresh
docker-compose up -d mongodb
npm run dev:full
# Database will be seeded with default users
```

## Environment Variables for Development

Create `.env` in project root:

```env
# Backend
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://root:rootpassword@localhost:27017/approveiq?authSource=admin
JWT_SECRET=dev-secret-key-not-for-production

# Frontend
VITE_API_URL=http://localhost:5000/api
```

## Troubleshooting

### MongoDB Connection Failed

```bash
# Check if MongoDB container is running
docker ps | grep mongo

# If not running, start it
docker-compose up -d mongodb

# View MongoDB logs
docker logs approveiq-mongodb

# Verify connection
docker exec approveiq-mongodb mongosh -u root -p rootpassword --authenticationDatabase admin --eval "db.adminCommand('ping')"
```

### Cannot Access Frontend at localhost:5173

```bash
# Check if Vite server is running
netstat -an | grep 5173

# If not, restart
npm run dev:full

# Or run just frontend
npm run dev
```

### Backend Auto-Restart Not Working

The `--watch` flag requires file changes in `backend/src` directory:
- Edit any `.js` file in `backend/src/`
- Backend automatically restarts
- Changes like `backend/package.json` require manual restart

### Data Appearing/Disappearing Between Restarts

**This should NOT happen with proper setup.** If it does:

```bash
# Verify volume exists
docker volume ls | grep mongodb_data

# Check volume details
docker volume inspect leave-approval-flow-main_mongodb_data

# See what's in the volume
docker exec approveiq-mongodb mongosh -u root -p rootpassword --authenticationDatabase admin

# Inside mongosh:
show databases
use approveiq
db.leaverequests.find()
```

## Database Operations During Development

### View Current Data

```bash
docker exec -it approveiq-mongodb mongosh -u root -p rootpassword --authenticationDatabase admin

# Inside mongosh:
use approveiq
show collections
db.users.find()
db.leaverequests.find().pretty()
```

### Clear Specific Collection (Keep Schema)

```bash
docker exec approveiq-mongodb mongosh -u root -p rootpassword --authenticationDatabase admin --eval "db.leaverequests.deleteMany({})"
```

### Full Database Reset (Keep MongoDB)

```bash
docker exec approveiq-mongodb mongosh -u root -p rootpassword --authenticationDatabase admin --eval "db.dropDatabase()"

# Restart backend to reseed
# Next request to backend will initialize database
```

### Complete MongoDB Reset (Delete Everything)

```bash
docker-compose down -v
docker-compose up -d mongodb
npm run dev:full
# Fresh database with seed users
```

## Default Test Credentials

After fresh database initialization:

| Email | Password | Role |
|-------|----------|------|
| bashaimran021@gmail.com | Imran@7200 | Student |
| advisor@college.edu | password123 | Advisor |
| hod@college.edu | password123 | HOD |
| principal@college.edu | password123 | Principal |
| admin@college.edu | password123 | Admin |

## Tips for Development

1. **Keep MongoDB running**: `docker-compose up -d mongodb`
2. **Watch for file changes**: `npm run dev:full` auto-restarts on backend changes
3. **Test API with Postman**: Import API endpoints, use JWT from login
4. **Monitor logs**: `docker logs -f approveiq-mongodb` to debug DB issues
5. **Never use `-v` flag**: `docker-compose down -v` permanently deletes data

## FAQ

**Q: Why is my data gone after restarting?**
A: Check if you used `docker-compose down -v`. Always use `docker-compose down` without `-v`.

**Q: Can I use a remote MongoDB instead?**
A: Yes! Update `.env`: `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/approveiq`

**Q: Does frontend hot reload preserve data?**
A: Yes! Frontend changes don't affect backend data. Leave requests persisted in MongoDB.

**Q: Why aren't my backend changes taking effect?**
A: Backend auto-restart only works for changes in `backend/src/`. Restart manually if you change `backend/package.json`.

**Q: Can I run just the backend without frontend?**
A: Yes: `npm run dev:backend` then visit http://localhost:5000/api/health
