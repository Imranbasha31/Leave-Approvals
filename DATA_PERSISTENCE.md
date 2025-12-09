# Data Persistence Guide for ApproveIQ

## ⚠️ CRITICAL: Never Use `-v` Flag Unless You Want to Delete All Data!

```bash
# ✓ SAFE - Data persists
docker-compose down

# ✗ DANGEROUS - DELETES ALL DATA PERMANENTLY!
docker-compose down -v    # DO NOT USE unless you explicitly want to reset!
```

---

## MongoDB Data Storage

All leave request data and user information is stored in MongoDB within a Docker volume named `mongodb_data`.

### Preserving Data

**To stop containers WITHOUT losing data:**
```bash
docker-compose down
```

**To start containers again (data persists):**
```bash
docker-compose up -d
```

### Resetting Data

**To completely delete all data and start fresh:**
```bash
docker-compose down -v
docker-compose up -d
```

⚠️ **WARNING:** Using the `-v` flag deletes the volume permanently!

## Volume Location

- **Windows (Docker Desktop):** Managed internally by Docker
  - Can view volumes: `docker volume ls`
  - Inspect volume: `docker volume inspect leave-approval-flow-main_mongodb_data`

- **Linux/Mac:** Typically at `/var/lib/docker/volumes/leave-approval-flow-main_mongodb_data/_data`

## Backup Your Data

### Backup MongoDB Database

```bash
# Export database to a file
docker exec approveiq-mongodb mongodump -u root -p rootpassword --authenticationDatabase admin --db approveiq --out /backup

# Copy backup from container
docker cp approveiq-mongodb:/backup ./mongodb-backup
```

### Restore MongoDB Database

```bash
# Copy backup to container
docker cp ./mongodb-backup approveiq-mongodb:/restore

# Restore database
docker exec approveiq-mongodb mongorestore -u root -p rootpassword --authenticationDatabase admin /restore/approveiq
```

## Troubleshooting

### Data Lost After Restart?

**Check if volume still exists:**
```bash
docker volume ls | grep mongodb_data
```

**If volume exists but data is missing:**
- Check MongoDB logs: `docker logs approveiq-mongodb`
- Verify volume mount: `docker inspect approveiq-mongodb | grep -A 5 Mounts`

### Cannot Connect to MongoDB?

```bash
# Check if MongoDB container is running
docker ps | grep approveiq-mongodb

# View MongoDB logs
docker logs approveiq-mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Manual Database Check

```bash
# Connect to MongoDB shell
docker exec -it approveiq-mongodb mongosh -u root -p rootpassword --authenticationDatabase admin

# Inside mongosh:
# Show all databases
show databases

# Switch to approveiq database
use approveiq

# Show collections
show collections

# View leave requests
db.leaverequests.find().pretty()

# View users
db.users.find().pretty()
```

## Environment Variables

Create a `.env` file in the project root to customize:

```env
# MongoDB
MONGODB_ROOT_PASSWORD=your_secure_password
MONGODB_DATABASE=approveiq

# JWT
JWT_SECRET=your_super_secret_key_change_in_production

# Node
NODE_ENV=production
PORT=5000
```

Update `docker-compose.yml` to use these variables for production deployments.

## Production Deployment

For production, consider:

1. **Use managed MongoDB** (MongoDB Atlas, AWS DocumentDB, etc.)
   - Set `MONGODB_URI` to your cloud MongoDB connection string
   - Remove `mongodb` service from docker-compose.yml

2. **Implement backups**
   - Automated daily backups
   - Encrypted backup storage

3. **Use strong credentials**
   - Change default passwords in `.env`
   - Use complex JWT_SECRET

4. **Enable authentication**
   - Already configured with root credentials
   - Create application-specific database users

Example for external MongoDB:
```yaml
environment:
  MONGODB_URI: mongodb+srv://user:password@cluster.mongodb.net/approveiq?retryWrites=true&w=majority
```
