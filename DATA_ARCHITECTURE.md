# ApproveIQ Data Persistence Architecture

## Overview

ApproveIQ uses **Docker named volumes** to ensure that all data persists across container lifecycle events. Your leave requests, user data, and all modifications are safely stored and survive container restarts.

---

## How Data Persistence Works

### 1. **MongoDB Running in Docker Container**

```
┌─────────────────────────────────────────────┐
│       Docker Container: approveiq-mongodb    │
│  ┌──────────────────────────────────────┐  │
│  │     MongoDB Database (in-memory)     │  │
│  │  - Users collection                  │  │
│  │  - Leave requests collection         │  │
│  │  - Approvals data                    │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
         │
         └─────────────────────────┐
                                   │
                    (Persists to)  │
                                   ▼
                  ┌──────────────────────────┐
                  │  Docker Named Volume     │
                  │  mongodb_data            │
                  │                          │
                  │  /data/db (actual files) │
                  │  on Docker's filesystem  │
                  └──────────────────────────┘
                          │
            Windows: Managed by Docker Desktop
            Linux: /var/lib/docker/volumes/...
```

### 2. **Volume Configuration**

In `docker-compose.yml`:

```yaml
volumes:
  mongodb_data:
    driver: local  # Stores data on local Docker engine

services:
  mongodb:
    volumes:
      - mongodb_data:/data/db  # Mount point inside container
```

### 3. **Data Flow**

```
Step 1: Container Running
   MongoDB ←→ Volume (auto-sync)
   
Step 2: Stop Container (docker-compose down)
   Data remains in Volume ✓
   Container stopped
   
Step 3: Container Restarted
   Container connects to same Volume
   All data restored automatically ✓
```

---

## Scenarios & What Happens to Data

### ✓ Safe Operations (Data Preserved)

| Command | Result | Data |
|---------|--------|------|
| `docker-compose down` | Containers stop, removed | ✓ Safe in volume |
| `docker-compose restart` | Containers restart | ✓ Preserved |
| `docker-compose pause` | Containers paused | ✓ Preserved |
| `docker ps` | Just checking status | ✓ Unaffected |
| Reboot Windows/Mac | Host restarts | ✓ Volume persists |
| `npm run dev:full` | Restart dev servers | ✓ Connected to same volume |

### ✗ Dangerous Operations (Data Deleted)

| Command | Effect | Data |
|---------|--------|------|
| `docker-compose down -v` | **Removes volume** | ✗ **DELETED** |
| `docker volume rm leave-approval-flow-main_mongodb_data` | **Deletes volume** | ✗ **DELETED** |
| `docker system prune -a --volumes` | **Aggressive cleanup** | ✗ **DELETED** |
| Update Docker Desktop storage path | **May move/lose data** | ⚠️ Check settings |

---

## Development vs Production Workflow

### Development Mode (`npm run dev:full`)

```
┌────────────────────────┐
│  Your Local Computer   │
│                        │
│  Frontend: :5173 ─────┐│
│  Backend: :5000  ─────┼┤ Same MongoDB
│                        ││ in Docker
│  npm run dev:full  ◄──┘│
└────────────────────────┘
         │
         └──────────────────────┐
                                │
                 ┌──────────────▼──────────┐
                 │  MongoDB Container      │
                 │  (persistent volume)    │
                 └─────────────────────────┘
```

**Key Point:** Your development data persists in the same MongoDB volume. When you restart, all your leave requests and tests are still there.

### Docker Production Deployment

```
┌──────────────────────────────────────┐
│  docker-compose up -d                │
│                                      │
│  ┌──────────────┐  ┌────────────┐   │
│  │   Frontend   │  │  Backend   │   │
│  │   + API      │  │  + Config  │   │
│  └──────────────┘  └────────────┘   │
│         ↓                 ↓          │
│  ┌─────────────────────────────┐    │
│  │    MongoDB Container        │    │
│  │  (persistent volume)        │    │
│  └─────────────────────────────┘    │
└──────────────────────────────────────┘
           │
           └──────────────────┐
                              │
                ┌─────────────▼──────────┐
                │   Docker Volume        │
                │   mongodb_data         │
                │                        │
                │   PERSISTS TO DISK ✓   │
                └────────────────────────┘
```

---

## Checking Your Data

### View Volume Details

```bash
docker volume inspect leave-approval-flow-main_mongodb_data
```

Output shows:
- `Mountpoint`: Where Docker stores your data
- `Labels`: Volume metadata
- `Driver`: How data is stored

### Connect to MongoDB Directly

```bash
# Interactive MongoDB shell
docker exec -it approveiq-mongodb mongosh -u root -p rootpassword --authenticationDatabase admin

# Then inside mongosh:
show databases
use approveiq
db.users.find()
db.leaverequests.find()
```

### Query User Count (Non-interactive)

```bash
docker exec approveiq-mongodb mongosh -u root -p rootpassword --authenticationDatabase admin --eval "db.approveiq.users.countDocuments()"
```

---

## Backup & Restore Strategy

### Quick Backup

```bash
# Export entire database
docker exec approveiq-mongodb mongodump -u root -p rootpassword \
  --authenticationDatabase admin --db approveiq --out /backup

# Copy to your computer
docker cp approveiq-mongodb:/backup ./mongodb-backup-$(date +%Y%m%d)
```

### Restore from Backup

```bash
# Copy backup to container
docker cp ./mongodb-backup approveiq-mongodb:/restore

# Restore database
docker exec approveiq-mongodb mongorestore -u root -p rootpassword \
  --authenticationDatabase admin /restore/approveiq
```

### Using External MongoDB (Production)

For enterprise deployments:

```bash
# Use MongoDB Atlas or similar
# Update MONGODB_URI environment variable
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/approveiq

# Volume still works as local cache if needed
```

---

## Troubleshooting

### "Data disappeared after restart"

**Most likely cause:** Used `docker-compose down -v`

**Fix:**
```bash
docker volume ls | grep mongodb_data
# If volume is gone, data is permanently deleted

# Prevent this:
docker-compose down  # WITHOUT -v
```

### "MongoDB won't connect"

```bash
# Check if container is running
docker ps | grep mongo

# View MongoDB logs
docker logs approveiq-mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### "Different data in dev vs Docker"

**Cause:** Different MongoDB instances

**Solution:**
- Dev mode: Uses Docker MongoDB at `localhost:27017` (in docker-compose)
- Make sure MongoDB is running: `docker ps | grep mongo`

---

## Key Takeaways

| Point | Details |
|-------|---------|
| **Volume Location** | Named volume `leave-approval-flow-main_mongodb_data` |
| **Safe to Stop** | `docker-compose down` (preserves data) |
| **Dangerous** | `docker-compose down -v` (deletes data) |
| **Data Path Windows** | Managed by Docker Desktop |
| **Data Path Linux** | `/var/lib/docker/volumes/.../` |
| **Backup Method** | `mongodump` export to local folder |
| **Dev Mode** | Same volume as Docker (shared data) |
| **Production** | Volume persists across deploys |

---

## Quick Reference Commands

```bash
# Check if data persists
docker volume ls | grep mongodb_data

# Inspect volume details
docker volume inspect leave-approval-flow-main_mongodb_data

# Backup data
docker exec approveiq-mongodb mongodump -u root -p rootpassword --authenticationDatabase admin --db approveiq --out /backup && docker cp approveiq-mongodb:/backup ./my-backup

# View database stats
docker exec approveiq-mongodb mongosh -u root -p rootpassword --authenticationDatabase admin --eval "db.approveiq.users.countDocuments()"

# Stop containers (safe)
docker-compose down

# Start containers (data restored)
docker-compose up -d

# Reset database (destructive)
docker-compose down -v && docker-compose up -d
```

---

**Remember:** Your data is safe as long as you use `docker-compose down` (not `-v`). The volume persists independently from containers.
