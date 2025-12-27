# Task Manager - Operations Runbook

## 📚 Overview

This runbook provides comprehensive operational procedures for deploying, monitoring, and maintaining the Task Manager application.

**Application:** Task Manager  
**Version:** 1.0  
**Owner:** Abdullah Alotaibi  
**Last Updated:** December 27, 2025

---

## 🚀 Deployment Procedures

### Initial Deployment

#### Prerequisites

1. **System Requirements**
   - Docker 20.x or higher
   - Docker Compose 2.x or higher
   - 2GB RAM minimum
   - 10GB disk space
   - Internet connection for pulling images

2. **Required Files**
   - `.env` file with configuration
   - `docker-compose.yml`
   - Application image on Docker Hub

#### Deployment Steps

```powershell
# 1. Clone repository
git clone https://github.com/Omage001/TAM-Abdullah-Alotaibi.git
cd TAM-Abdullah-Alotaibi

# 2. Create .env file
Copy-Item .env.example .env
# Edit .env with appropriate values

# 3. Pull latest images
docker-compose pull

# 4. Start services
docker-compose up -d

# 5. Verify deployment
docker-compose ps
docker-compose logs -f task-manager

# 6. Test application
curl http://localhost:5000
```

**Expected Result:**
- Both containers running (task-manager, postgres)
- Application accessible at http://localhost:5000
- No errors in logs

---

### Environment Configuration

#### Required Environment Variables

Create `.env` file with these variables:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/secure_scala_chat

# Application Configuration
NODE_ENV=production
PORT=5000

# SendGrid Email Configuration
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
ADMIN_EMAIL=abdullah106778@gmail.com
FROM_EMAIL=a.alotaibi@nearpay.io

# Session Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=your_32_byte_random_hex_string

# Docker Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=secure_scala_chat
```

#### Generating Secrets

```powershell
# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate random password
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

---

### Database Initialization

#### Automatic Migration

The application automatically creates tables on first startup:
- users
- tasks
- session

#### Manual Database Setup

```powershell
# Connect to PostgreSQL container
docker-compose exec postgres psql -U postgres secure_scala_chat

# Run SQL commands
\i /path/to/schema.sql

# Verify tables
\dt

# Exit
\q
```

#### Create Demo Users

```sql
-- Insert demo user (password: demo1234)
INSERT INTO users (username, password, role) VALUES
('demo', '$scrypt_hash_here', 'user');

-- Insert admin user (password: admin1234)
INSERT INTO users (username, password, role) VALUES
('admin', '$scrypt_hash_here', 'admin');
```

**Note:** Use the application's registration endpoint to create users with properly hashed passwords.

---

## 🔍 Monitoring & Health Checks

### Application Health

#### Check Container Status

```powershell
# List running containers
docker-compose ps

# Check specific container
docker inspect task-manager

# View resource usage
docker stats task-manager postgres
```

#### Application Logs

```powershell
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f task-manager

# View last 100 lines
docker-compose logs --tail=100 task-manager

# Filter for errors
docker-compose logs | Select-String "ERROR"
```

#### Health Check Endpoint

```powershell
# Check application health
Invoke-WebRequest http://localhost:5000/health

# Expected response: 200 OK
```

### Database Health

```powershell
# Connect to database
docker-compose exec postgres psql -U postgres secure_scala_chat

# Check connection
\conninfo

# List databases
\l

# Check table sizes
SELECT 
    schemaname, 
    tablename, 
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public';

# Check active connections
SELECT count(*) FROM pg_stat_activity;
```

### Performance Metrics

```sql
-- Task statistics
SELECT 
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress
FROM tasks;

-- User statistics
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users
FROM users;

-- Recent activity
SELECT 
    u.username,
    t.title,
    t.status,
    t.created_at
FROM tasks t
JOIN users u ON t.user_id = u.id
ORDER BY t.created_at DESC
LIMIT 10;
```

---

## 🔧 Maintenance Procedures

### Regular Maintenance Schedule

| Task | Frequency | Command |
|------|-----------|---------|
| Check logs | Daily | `docker-compose logs --tail=50` |
| Database backup | Daily | See [Backup Section](#backup-procedures) |
| Update dependencies | Weekly | `npm audit; npm update` |
| Clean Docker images | Weekly | `docker system prune -a` |
| Review security alerts | Weekly | GitHub Security tab |
| Update SSL certificates | Yearly | Depends on provider |

### Restart Procedures

#### Graceful Restart

```powershell
# Restart application only
docker-compose restart task-manager

# Restart all services
docker-compose restart

# Verify restart
docker-compose ps
docker-compose logs -f task-manager
```

#### Full Restart (with rebuild)

```powershell
# Stop services
docker-compose down

# Pull latest images
docker-compose pull

# Start services
docker-compose up -d

# Verify
docker-compose ps
```

#### Emergency Restart (preserve data)

```powershell
# Stop containers (keep volumes)
docker-compose stop

# Remove containers
docker-compose rm -f

# Recreate containers
docker-compose up -d
```

### Update Procedures

#### Application Update

```powershell
# 1. Pull latest code
git pull origin main

# 2. Pull latest Docker image
docker-compose pull task-manager

# 3. Restart with new image
docker-compose up -d task-manager

# 4. Verify update
docker-compose logs -f task-manager
```

#### Database Migration

```powershell
# 1. Backup database first
docker-compose exec postgres pg_dump -U postgres secure_scala_chat > backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# 2. Apply migration
docker-compose exec task-manager npm run migrate

# 3. Verify migration
docker-compose exec postgres psql -U postgres secure_scala_chat -c "\dt"
```

---

## 💾 Backup Procedures

### Database Backup

#### Manual Backup

```powershell
# Create backup
docker-compose exec postgres pg_dump -U postgres secure_scala_chat > backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# Verify backup
Get-Item backup_*.sql | Select-Object Name, Length
```

#### Automated Daily Backup Script

Create `backup.ps1`:

```powershell
# backup.ps1
$BackupDir = "C:\backups\task-manager"
$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = "$BackupDir\backup_$Date.sql"

# Create backup directory if not exists
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir
}

# Create backup
docker-compose exec -T postgres pg_dump -U postgres secure_scala_chat > $BackupFile

# Compress backup
Compress-Archive -Path $BackupFile -DestinationPath "$BackupFile.zip"
Remove-Item $BackupFile

# Keep only last 7 days of backups
Get-ChildItem $BackupDir -Filter "*.zip" | 
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | 
    Remove-Item

Write-Output "Backup completed: $BackupFile.zip"
```

Schedule with Task Scheduler:

```powershell
# Create scheduled task (run daily at 2 AM)
$Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\path\to\backup.ps1"
$Trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -TaskName "TaskManagerBackup" -Action $Action -Trigger $Trigger
```

### Restore Procedures

#### Restore from Backup

```powershell
# 1. Stop application
docker-compose stop task-manager

# 2. Restore database
Get-Content backup_20251227_120000.sql | docker-compose exec -T postgres psql -U postgres secure_scala_chat

# 3. Restart application
docker-compose start task-manager

# 4. Verify restore
docker-compose exec postgres psql -U postgres secure_scala_chat -c "SELECT COUNT(*) FROM users;"
```

### Volume Backup

```powershell
# Backup Docker volume
docker run --rm -v task-manager_postgres_data:/data -v ${PWD}:/backup alpine tar czf /backup/volume_backup_$(Get-Date -Format "yyyyMMdd").tar.gz /data

# Restore Docker volume
docker run --rm -v task-manager_postgres_data:/data -v ${PWD}:/backup alpine tar xzf /backup/volume_backup_20251227.tar.gz -C /
```

---

## 🚨 Troubleshooting

### Common Issues

#### Issue 1: Container Won't Start

**Symptoms:** Container exits immediately or won't start

**Diagnosis:**
```powershell
# Check logs
docker-compose logs task-manager

# Check container status
docker-compose ps
```

**Solutions:**
```powershell
# Check environment variables
docker-compose exec task-manager env | Select-String "DATABASE"

# Verify database connection
docker-compose exec task-manager node -e "console.log(process.env.DATABASE_URL)"

# Rebuild container
docker-compose down
docker-compose build --no-cache task-manager
docker-compose up -d
```

#### Issue 2: Database Connection Failed

**Symptoms:** "Connection refused" or "Database not found"

**Diagnosis:**
```powershell
# Check postgres is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U postgres -c "SELECT 1"
```

**Solutions:**
```powershell
# Restart postgres
docker-compose restart postgres

# Wait for postgres to be ready
Start-Sleep -Seconds 10
docker-compose restart task-manager

# Verify DATABASE_URL
cat .env | Select-String "DATABASE_URL"
```

#### Issue 3: Email Notifications Not Sending

**Symptoms:** Emails not received, errors in logs

**Diagnosis:**
```powershell
# Check SendGrid configuration
docker-compose exec task-manager env | Select-String "SENDGRID"

# Check application logs
docker-compose logs task-manager | Select-String "email"
```

**Solutions:**
```powershell
# Verify SendGrid API key
# Check sender email is verified in SendGrid
# Test email manually
docker-compose exec task-manager node -e "require('@sendgrid/mail').setApiKey(process.env.SENDGRID_API_KEY); require('@sendgrid/mail').send({to: 'test@example.com', from: process.env.FROM_EMAIL, subject: 'Test', text: 'Test'})"
```

#### Issue 4: High Memory Usage

**Symptoms:** System slowdown, container restarts

**Diagnosis:**
```powershell
# Check resource usage
docker stats task-manager postgres

# Check Node.js heap usage
docker-compose exec task-manager node -e "console.log(process.memoryUsage())"
```

**Solutions:**
```powershell
# Limit container memory
# Add to docker-compose.yml:
# mem_limit: 512m

# Restart with limits
docker-compose down
docker-compose up -d

# Monitor for leaks
docker stats --no-stream task-manager
```

#### Issue 5: Disk Space Full

**Symptoms:** Cannot write to database, container crashes

**Diagnosis:**
```powershell
# Check disk space
docker system df

# Check volume sizes
docker volume ls
docker volume inspect task-manager_postgres_data
```

**Solutions:**
```powershell
# Clean up unused images
docker system prune -a

# Remove old backups
Get-ChildItem C:\backups\task-manager -Filter "*.zip" | 
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | 
    Remove-Item

# Vacuum database
docker-compose exec postgres psql -U postgres secure_scala_chat -c "VACUUM FULL"
```

---

## 🔐 Security Procedures

### Security Checklist

- [ ] All secrets stored in environment variables
- [ ] .env file not committed to git
- [ ] Database passwords changed from defaults
- [ ] SendGrid API key rotated regularly
- [ ] GitHub Secrets configured for CI/CD
- [ ] HTTPS enabled (in production)
- [ ] Security updates applied weekly
- [ ] npm audit run regularly
- [ ] Container vulnerability scanning enabled

### Security Audit

```powershell
# Check for npm vulnerabilities
docker-compose exec task-manager npm audit

# Check for outdated packages
docker-compose exec task-manager npm outdated

# Scan container for vulnerabilities
docker scan abdullah0100/task-manager:latest

# Check for exposed secrets
git log --all --full-history --source --pretty=format:'%H' -- .env
```

### Incident Response

1. **Identify:** Determine the nature and scope of the security incident
2. **Contain:** Isolate affected systems
   ```powershell
   docker-compose stop task-manager
   ```
3. **Eradicate:** Remove the threat
   ```powershell
   docker-compose down
   docker system prune -a
   ```
4. **Recover:** Restore from clean backup
   ```powershell
   # Restore database from backup
   Get-Content backup_clean.sql | docker-compose exec -T postgres psql -U postgres secure_scala_chat
   ```
5. **Review:** Analyze and document the incident

---

## 📊 Performance Tuning

### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);

-- Analyze tables
ANALYZE users;
ANALYZE tasks;
ANALYZE session;

-- Vacuum to reclaim space
VACUUM ANALYZE;
```

### Application Optimization

```powershell
# Enable production mode
# In .env:
NODE_ENV=production

# Increase Node.js memory limit
# In docker-compose.yml:
environment:
  - NODE_OPTIONS=--max-old-space-size=512
```

### Monitoring Queries

```sql
-- Slow queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 seconds'
AND state = 'active';

-- Table sizes
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 📞 Support & Escalation

### Support Contacts

| Level | Contact | Response Time |
|-------|---------|---------------|
| L1 Support | abdullah106778@gmail.com | 4 hours |
| L2 Technical | GitHub Issues | 24 hours |
| L3 Critical | [Emergency Contact] | 1 hour |

### Escalation Path

1. **Level 1:** Basic troubleshooting, restart procedures
2. **Level 2:** Database issues, configuration problems
3. **Level 3:** Security incidents, data loss, system outage

### Log Collection for Support

```powershell
# Collect all relevant logs
$LogDir = "C:\support\task-manager\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $LogDir

# Container logs
docker-compose logs > "$LogDir\container_logs.txt"

# System info
docker-compose ps > "$LogDir\container_status.txt"
docker stats --no-stream > "$LogDir\resource_usage.txt"

# Configuration (redact secrets)
Copy-Item .env "$LogDir\env_redacted.txt"

# Compress for support
Compress-Archive -Path $LogDir -DestinationPath "$LogDir.zip"
```

---

## 🔄 CI/CD Operations

### Manual Deployment Trigger

```powershell
# Trigger CI/CD manually via GitHub Actions
# Or manually deploy:

# 1. Pull latest image
docker-compose pull task-manager

# 2. Restart service
docker-compose up -d task-manager
```

### Rollback Procedure

```powershell
# 1. Find previous working image
docker images abdullah0100/task-manager

# 2. Update docker-compose.yml to use specific tag
# image: abdullah0100/task-manager:abc123def

# 3. Deploy previous version
docker-compose up -d task-manager

# 4. Verify rollback
docker-compose logs -f task-manager
```

---

## 📚 Additional Resources

- **README:** [../README.md](../README.md)
- **System Design:** [../SYSTEM-DESIGN.md](../SYSTEM-DESIGN.md)
- **Database ERD:** [../DATABASE-ERD.md](../DATABASE-ERD.md)
- **Demo Script:** [demo-script.md](./demo-script.md)
- **GitHub Repository:** https://github.com/Omage001/TAM-Abdullah-Alotaibi
- **Docker Hub:** https://hub.docker.com/r/abdullah0100/task-manager

---

**Runbook Version:** 1.0  
**Last Updated:** December 27, 2025  
**Maintained by:** Abdullah Alotaibi
