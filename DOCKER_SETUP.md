# Docker Setup Guide for ApproveIQ

## Prerequisites
- Docker installed and running
- Docker Compose installed (comes with Docker Desktop)

## Quick Start

### 1. Build and Start the Application

```bash
# Build images and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f approveiq
docker-compose logs -f mongodb
```

### 2. Access the Application

- **Frontend**: http://localhost:5000
- **API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

### 3. Test Login

Use these credentials to test:

| Email | Password | Role |
|-------|----------|------|
| bashaimran021@gmail.com | Imran@7200 | Student |
| advisor@college.edu | password123 | Advisor |
| hod@college.edu | password123 | HOD |
| principal@college.edu | password123 | Principal |
| admin@college.edu | password123 | Admin |

## Common Docker Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes (Clean Reset)
```bash
docker-compose down -v
```

### Rebuild Images
```bash
docker-compose up -d --build
```

### View Running Containers
```bash
docker-compose ps
```

### Access MongoDB Shell
```bash
docker exec -it approveiq-mongodb mongosh -u root -p rootpassword
```

### View Container Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f approveiq
```

### Execute Commands in Running Container
```bash
docker exec -it approveiq-app sh
```

## Architecture

```
┌─────────────────────────────────────────┐
│          Docker Network                  │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  ApproveIQ App Container         │  │
│  │  ├─ Backend (Express.js)         │  │
│  │  │  └─ Port: 5000                │  │
│  │  └─ Frontend (React/Vite build)  │  │
│  │     └─ Served by Express         │  │
│  └──────────────────────────────────┘  │
│           ↓                             │
│  ┌──────────────────────────────────┐  │
│  │  MongoDB Container               │  │
│  │  └─ Port: 27017                  │  │
│  │     User: root                   │  │
│  │     Pass: rootpassword           │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

## Environment Variables

Create a `.env` file in the root directory for custom configuration:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://root:rootpassword@mongodb:27017/approveiq?authSource=admin
JWT_SECRET=your-super-secret-key-change-this
VITE_API_URL=http://localhost:5000/api
```

**⚠️ Important:** Change `JWT_SECRET` before deploying to production!

## Troubleshooting

### Port Already in Use
```bash
# Free port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use different port in docker-compose.yml
# Change "5000:5000" to "8000:5000"
```

### Container Won't Start
```bash
# Check logs
docker-compose logs approveiq

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

### MongoDB Connection Issues
```bash
# Verify MongoDB is running
docker-compose ps

# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Clear Everything and Start Fresh
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## Production Deployment

1. **Change Credentials:**
   ```bash
   # Update in docker-compose.yml
   - MONGO_INITDB_ROOT_PASSWORD=<strong-password>
   - MONGODB_URI=mongodb://root:<strong-password>@mongodb:27017/approveiq
   - JWT_SECRET=<strong-secret-key>
   ```

2. **Use External MongoDB:**
   ```bash
   # Remove mongodb service from docker-compose.yml
   # Update MONGODB_URI to point to your hosted MongoDB
   ```

3. **Add SSL/HTTPS:**
   - Use nginx or reverse proxy in front of the container
   - Or use Docker secrets management

4. **Set Up Monitoring:**
   ```bash
   docker stats
   ```

## Support

For issues, check:
- `.dockerignore` - Files excluded from build
- `Dockerfile` - Build configuration
- `docker-compose.yml` - Service configuration
- Application logs: `docker-compose logs -f`
