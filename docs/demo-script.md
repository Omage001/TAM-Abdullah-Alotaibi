# Task Manager - Demo Script

## 📋 Demo Overview

This script provides a comprehensive walkthrough of the Task Manager application, showcasing all features and functionality.

**Duration:** ~15 minutes  
**Presenter:** Abdullah Alotaibi  
**Application:** Task Manager with RBAC, Email Notifications, and Docker Deployment

---

## 🎬 Pre-Demo Setup

### Prerequisites Check

```powershell
# 1. Verify Docker is running
docker --version
docker-compose --version

# 2. Start the application
cd C:\Users\slhrr\Documents\TAM-assignment\Task-manager
docker-compose up -d

# 3. Verify containers are running
docker-compose ps

# 4. Check logs for any errors
docker-compose logs -f task-manager
```

**Expected Output:**
- ✅ Both containers (task-manager, postgres) are running
- ✅ Application accessible at http://localhost:5000
- ✅ No errors in logs

---

## 🎯 Demo Flow

### Part 1: Introduction (2 minutes)

**Script:**
> "Hello everyone! Today I'll be demonstrating the Task Manager application - a full-stack project built with React, Express.js, PostgreSQL, and Docker. This application features role-based access control, email notifications, and a complete CI/CD pipeline."

**Show:**
- Open browser to http://localhost:5000
- Display clean, professional UI
- Mention technology stack visible in the interface

---

### Part 2: User Registration & Authentication (3 minutes)

**Demo Steps:**

1. **Register a New User**
   ```
   Click "Register" tab
   Username: demo_user
   Password: Demo1234!
   Click "Create Account"
   ```

   **Talking Points:**
   - Passwords are hashed using crypto.scrypt with salt
   - Session-based authentication with HTTP-only cookies
   - Automatic redirect to Dashboard after registration

2. **Show Dashboard**
   ```
   - Point out sidebar navigation
   - Highlight empty task list
   - Show user info in header
   ```

3. **Logout and Login**
   ```
   Click user menu → Logout
   Click "Login" tab
   Username: demo
   Password: demo1234
   Click "Sign In"
   ```

   **Talking Points:**
   - Session persists across page refreshes
   - Secure logout clears session

---

### Part 3: Task Management - Regular User (4 minutes)

**Demo Steps:**

1. **Create a Task**
   ```
   Click "+ Create Task" button
   Fill form:
   - Task Title: "Complete Project Documentation"
   - Description: "Finish README and system design docs"
   - Priority: High
   - Status: In Progress
   - Deadline: [Set date 2 days from now]
   Click "Create Task"
   ```

   **Talking Points:**
   - Real-time form validation
   - Task appears immediately (optimistic update)
   - Email notification sent to admin (show email if possible)

2. **Create Multiple Tasks**
   ```
   Task 2:
   - Title: "Code Review"
   - Priority: Medium
   - Status: Pending
   - Deadline: [Tomorrow]
   
   Task 3:
   - Title: "Deploy to Production"
   - Priority: Urgent
   - Status: Pending
   - Deadline: [Today]
   ```

3. **Show Task Card Features**
   ```
   - Priority badges (color-coded)
   - Status indicators
   - Deadline countdown
   - Action buttons (Edit, Delete)
   ```

4. **Edit a Task**
   ```
   Click Edit icon on first task
   Change Status: Completed
   Click "Update Task"
   ```

   **Talking Points:**
   - Real-time updates
   - Updated timestamp tracked
   - Email notification sent

5. **Delete a Task**
   ```
   Click Delete icon on one task
   Confirm deletion
   ```

   **Talking Points:**
   - Confirmation dialog prevents accidents
   - Task removed from database

---

### Part 4: Admin Features (4 minutes)

**Demo Steps:**

1. **Login as Admin**
   ```
   Logout current user
   Login with:
   - Username: admin
   - Password: admin1234
   ```

2. **Show Admin Dashboard**
   ```
   Click "Admin Panel" in sidebar
   ```

   **Talking Points:**
   - Only visible to admin users
   - Access to all system features

3. **User Management**
   ```
   - View all users in the system
   - Show user roles
   - Demonstrate role change:
     * Find demo_user
     * Change role from "user" to "admin"
     * Click "Update Role"
   ```

   **Talking Points:**
   - Admin can manage all users
   - Role-based access control (RBAC)
   - Instant permission changes

4. **View All Tasks**
   ```
   - Show tasks from all users
   - Point out username column
   - Demonstrate admin can delete any task
   ```

   **Talking Points:**
   - Complete system oversight
   - Can manage tasks across all users
   - Useful for monitoring and cleanup

---

### Part 5: Email Notifications (2 minutes)

**Demo Steps:**

1. **Show Email Configuration**
   ```powershell
   # Open .env file (redact sensitive info)
   notepad .env
   ```

   **Show:**
   - SENDGRID_API_KEY (redacted)
   - FROM_EMAIL: a.alotaibi@nearpay.io
   - ADMIN_EMAIL: abdullah106778@gmail.com

2. **Demonstrate Email Triggers**
   ```
   Create a new task as admin
   - Title: "Test Email Notification"
   - Priority: High
   - Deadline: [Tomorrow]
   ```

3. **Show Email Inbox** (if possible)
   - Open Gmail/Outlook
   - Show received notification email
   - Point out task details in email

**Talking Points:**
- SendGrid integration for reliable delivery
- Notifications for: task created, updated, deadline approaching, overdue
- Hourly cron job checks deadlines
- Professional HTML email templates

---

### Part 6: Docker & Deployment (2 minutes)

**Demo Steps:**

1. **Show Docker Setup**
   ```powershell
   # Show running containers
   docker-compose ps
   
   # Show container logs
   docker-compose logs --tail=20 task-manager
   ```

2. **Show docker-compose.yml**
   ```powershell
   notepad docker-compose.yml
   ```

   **Talking Points:**
   - Two services: task-manager (Node.js) and postgres
   - Persistent volume for database
   - Environment variables for configuration
   - Port mapping (5000:5000)

3. **Show Docker Hub**
   - Open browser to: https://hub.docker.com/r/abdullah0100/task-manager
   - Show published image
   - Show tags (latest, commit SHA)

---

### Part 7: CI/CD Pipeline (2 minutes)

**Demo Steps:**

1. **Show GitHub Actions**
   ```
   Open browser to:
   https://github.com/Omage001/TAM-Abdullah-Alotaibi/actions
   ```

   **Show:**
   - Recent workflow runs
   - Green checkmarks (successful builds)
   - Workflow file structure

2. **Explain Pipeline Stages**
   ```
   Open .github/workflows/ci-cd.yml in editor
   ```

   **Talking Points:**
   - Build & Test (Node.js, PostgreSQL)
   - Security Scan (npm audit, Trivy)
   - Docker Build & Push to Docker Hub
   - Deploy & Release
   - Path filters (only triggers on app code changes)

3. **Show Security Features**
   ```
   - GitHub Secrets (DOCKER_USERNAME, DOCKER_PASSWORD)
   - .gitignore preventing sensitive data commits
   - npm audit in pipeline
   - Container vulnerability scanning
   ```

---

### Part 8: Database & Technical Details (1 minute)

**Demo Steps:**

1. **Show Database Structure**
   ```powershell
   # Connect to PostgreSQL container
   docker-compose exec postgres psql -U postgres secure_scala_chat
   ```

   **Execute:**
   ```sql
   -- Show tables
   \dt
   
   -- Show users
   SELECT id, username, role FROM users;
   
   -- Show tasks count by user
   SELECT u.username, COUNT(t.id) as task_count
   FROM users u
   LEFT JOIN tasks t ON u.id = t.user_id
   GROUP BY u.id, u.username;
   
   -- Exit
   \q
   ```

2. **Show Code Structure** (optional, if time permits)
   ```powershell
   # Open VS Code
   code .
   ```

   **Highlight:**
   - Client folder (React frontend)
   - Server folder (Express backend)
   - Shared folder (TypeScript types)
   - Clean separation of concerns

---

## 🎭 Demo Variations

### Short Demo (5 minutes)
1. Introduction (30s)
2. User Login & Create Task (2m)
3. Admin Panel Overview (1m30s)
4. Docker & Deployment (1m)

### Technical Deep Dive (25 minutes)
- Include all sections above
- Add code walkthrough
- Show database queries
- Explain architecture decisions
- Live debugging session

---

## 🐛 Troubleshooting During Demo

### Issue: Application Not Loading
```powershell
# Restart containers
docker-compose down
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Issue: Database Connection Error
```powershell
# Verify postgres is running
docker-compose ps postgres

# Check environment variables
docker-compose exec task-manager env | grep DATABASE
```

### Issue: Email Not Sending
```
- Check SendGrid API key is set
- Verify sender email is verified
- Check network connectivity
```

---

## 📊 Key Metrics to Mention

- **Technologies:** 8 (React, TypeScript, Express, PostgreSQL, Docker, SendGrid, GitHub Actions, TanStack Query)
- **Security Features:** 5 (Password hashing, RBAC, SQL injection prevention, Session management, Secret scanning)
- **Database Tables:** 3 (users, tasks, session)
- **CI/CD Stages:** 4 (Build, Security, Docker, Deploy)
- **Response Time:** < 100ms for most operations
- **Container Size:** ~200MB (optimized with Alpine)

---

## 🎤 Demo Tips

1. **Prepare backup accounts** in case of login issues
2. **Clear browser cache** before demo for clean state
3. **Have multiple browser tabs** ready:
   - Application (http://localhost:5000)
   - GitHub repo
   - Docker Hub
   - Email inbox
4. **Practice transitions** between sections
5. **Keep terminal commands** in a text file for quick copy-paste
6. **Have backup demo video** in case of technical difficulties
7. **Test everything 30 minutes before** the presentation

---

## 📝 Demo Checklist

**Before Demo:**
- [ ] Docker containers running
- [ ] Application accessible
- [ ] Demo users created (demo/demo1234, admin/admin1234)
- [ ] Email notifications tested
- [ ] Browser tabs prepared
- [ ] Terminal ready with commands
- [ ] Backup plan ready

**During Demo:**
- [ ] Introduce project clearly
- [ ] Show user features
- [ ] Demonstrate admin capabilities
- [ ] Highlight security features
- [ ] Show DevOps integration
- [ ] Answer questions confidently

**After Demo:**
- [ ] Share repository link
- [ ] Provide documentation links
- [ ] Offer to answer follow-up questions

---

## 🔗 Resources

- **GitHub Repo:** https://github.com/Omage001/TAM-Abdullah-Alotaibi
- **Docker Hub:** https://hub.docker.com/r/abdullah0100/task-manager
- **System Design:** [SYSTEM-DESIGN.md](../SYSTEM-DESIGN.md)
- **Database ERD:** [DATABASE-ERD.md](../DATABASE-ERD.md)
- **Operations Guide:** [runbook.md](./runbook.md)

---

**Demo Script Version:** 1.0  
**Last Updated:** December 27, 2025  
**Created by:** Abdullah Alotaibi
