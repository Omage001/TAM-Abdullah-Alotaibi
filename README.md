# Task Manager Application

A secure, full-featured task management system with role-based access control, deadline tracking, and real-time email notifications powered by SendGrid.

![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![React](https://img.shields.io/badge/React-18.x-61dafb)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [User Roles](#user-roles)
- [API Documentation](#api-documentation)
- [Email Notifications](#email-notifications)
- [Admin Panel](#admin-panel)
- [Usage Guide](#usage-guide)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

---

## ✨ Features

### Core Features
- 🔐 **Secure Authentication** - Passport.js with session-based auth and password hashing
- 📝 **Task Management** - Create, update, delete, and track tasks
- 🎯 **Priority Levels** - Low, Medium, High, Urgent
- ⏰ **Deadline Tracking** - Set and monitor task deadlines
- 📊 **Status Management** - Pending, In Progress, Completed
- 🔍 **Sorting & Filtering** - Sort by date, priority, or deadline
- 📄 **Pagination** - Efficient data loading

### Advanced Features
- 👥 **Role-Based Access Control (RBAC)** - User and Admin roles
- 📧 **Email Notifications** - SendGrid-powered real-time alerts
- ⚠️ **Deadline Reminders** - Automated 24-hour warnings
- 🚨 **Overdue Alerts** - Automatic notifications for missed deadlines
- 🛡️ **Admin Dashboard** - System-wide user and task management
- 🐳 **Docker Support** - Containerized deployment with PostgreSQL

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20.x (Alpine)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 17
- **ORM**: Drizzle ORM
- **Authentication**: Passport.js (Local Strategy)
- **Email Service**: SendGrid (@sendgrid/mail)
- **Session Management**: express-session with PostgreSQL store

### Frontend
- **Library**: React 18.x
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI + Tailwind CSS
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + PostCSS

### DevOps
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 17 Alpine
- **Health Checks**: Docker healthcheck for database

---

## 📦 Prerequisites

### For Local Development:
- Node.js 20.x or higher
- PostgreSQL 17
- npm or yarn
- SendGrid account (for email notifications)

### For Docker Deployment:
- Docker Engine 20.x or higher
- Docker Compose 2.x or higher

---

## 🚀 Installation

### Local Development Setup

1. **Clone the repository**:
```bash
git clone https://github.com/abdullah0100/task-manager.git
cd task-manager
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/secure_scala_chat
NODE_ENV=development
PORT=5000
SENDGRID_API_KEY=your_sendgrid_api_key
ADMIN_EMAIL=your_admin_email@example.com
FROM_EMAIL=your_verified_sendgrid_sender@example.com
```

4. **Initialize the database**:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE secure_scala_chat;

# Create tables
\c secure_scala_chat

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_expire ON session(expire);
```

5. **Create demo users** (optional):
```sql
-- User: demo / demo1234
INSERT INTO users (username, password, role) VALUES (
  'demo',
  '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8bfb920dbc0ff96cddf0d3f2a24c6b91f8e5a4f5a7b7c3d4a1b0e9f8c7d6e5f4a3b.a1b2c3d4e5f6a7b8',
  'user'
);

-- Admin: admin / admin1234
INSERT INTO users (username, password, role) VALUES (
  'admin',
  '09d62314c7a15268c7037b3b13a88b666f71a4bd19cc9128efb26e283f5c51f4db24b72e0967f047dd7bb238d6d784674339bbf24f94f0912117aca5047f3859.17e37b08a3875ad04cfecec1c95af3bc',
  'admin'
);
```

6. **Build and run**:
```bash
npm run build
npm run dev
```

7. **Access the application**:
Open http://localhost:5000 in your browser.

---

## 🐳 Docker Deployment

### Quick Start with Docker

1. **Clone the repository**:
```bash
git clone https://github.com/abdullah0100/task-manager.git
cd task-manager
```

2. **Configure environment** (optional):
Edit `docker-compose.yml` to customize environment variables.

3. **Start the containers**:
```bash
docker-compose up -d
```

4. **Check container status**:
```bash
docker-compose ps
```

5. **View logs**:
```bash
docker-compose logs app --tail=50
```

6. **Access the application**:
Open http://localhost:5000

### Docker Commands

```bash
# Stop containers
docker-compose down

# Rebuild containers
docker-compose up -d --build

# View logs
docker-compose logs app -f

# Execute commands in container
docker-compose exec app sh

# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d secure_scala_chat
```

### Docker Hub Image

Pull the pre-built image:
```bash
docker pull abdullah0100/task-manager:latest
```

---

## 🔑 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `NODE_ENV` | Environment (development/production) | No | `production` |
| `PORT` | Application port | No | `5000` |
| `SENDGRID_API_KEY` | SendGrid API key for emails | Yes | - |
| `ADMIN_EMAIL` | Email to receive notifications | Yes | - |
| `FROM_EMAIL` | Verified SendGrid sender email | Yes | - |

### SendGrid Setup

1. **Create SendGrid account**: https://sendgrid.com
2. **Create API key**: Settings → API Keys → Create API Key
3. **Verify sender**: Settings → Sender Authentication → Verify Single Sender
4. **Update environment variables** with your API key and verified email

---

## 👥 User Roles

### User Role
- Create, read, update, delete **own tasks**
- View task dashboard
- Receive email notifications for own tasks
- Set task priorities and deadlines
- Track task status

### Admin Role
**All User permissions, plus**:
- Access to admin dashboard
- View **all users** in the system
- View **all tasks** from all users
- Delete **any user's tasks**
- Change user roles (User ↔ Admin)
- System-wide task monitoring

---

## 📡 API Documentation

### Authentication

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/register` | POST | Register new user | No |
| `/api/login` | POST | Login user | No |
| `/api/logout` | POST | Logout user | Yes |
| `/api/user` | GET | Get current user | Yes |

### Tasks

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/tasks` | GET | Get user's tasks (paginated) | Yes |
| `/api/tasks` | POST | Create new task | Yes |
| `/api/tasks/:id` | PATCH | Update task | Yes (Owner or Admin) |
| `/api/tasks/:id` | DELETE | Delete task | Yes (Owner or Admin) |

**Query Parameters for GET /api/tasks**:
- `page` (default: 1) - Page number
- `limit` (default: 10) - Items per page
- `sort` (default: createdAt) - Sort by: `createdAt`, `priority`, `deadline`

### Admin

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/admin/users` | GET | Get all users | Admin |
| `/api/admin/tasks` | GET | Get all tasks (paginated) | Admin |
| `/api/admin/users/:id/role` | PUT | Update user role | Admin |
| `/api/admin/tasks/:id` | DELETE | Delete any task | Admin |

---

## 📧 Email Notifications

### Notification Types

1. **Task Created**
   - Triggered when a new task is created
   - Email subject: "New Task Created"
   - Includes task title and ID

2. **Task Updated**
   - Triggered when a task is modified
   - Email subject: "Task Updated"
   - Includes update details

3. **Deadline Approaching** (Automated)
   - Sent 24 hours before deadline
   - Email subject: "⚠️ Task Deadline Approaching"
   - Warning styled (yellow/orange theme)

4. **Task Overdue** (Automated)
   - Sent for tasks past deadline
   - Email subject: "🚨 Task Overdue!"
   - Urgent styled (red theme)

### Automated Checks
- System checks for deadlines **every hour**
- Sends notifications to `ADMIN_EMAIL`
- Excludes completed tasks
- HTML-formatted professional emails

### Email Configuration

All emails are sent:
- **FROM**: Your verified SendGrid sender (e.g., a.alotaibi@nearpay.io)
- **TO**: ADMIN_EMAIL (e.g., abdullah106778@gmail.com)

---

## 🛡️ Admin Panel

### Features

1. **User Management**
   - View all registered users
   - See user roles (User/Admin)
   - Change user roles with dropdown
   - Search users by username

2. **Task Management**
   - View all tasks from all users
   - See task details (title, priority, status, deadline)
   - Delete any task with confirmation
   - Search tasks by title

3. **System Overview**
   - Total users count
   - Total tasks count
   - Quick access navigation
   - Purple-themed professional UI

### Accessing Admin Panel

1. Login with admin credentials
2. Click **"Admin Panel"** in sidebar (shield icon)
3. Manage users and tasks from dashboard

---

## 📖 Usage Guide

### Creating a Task

1. **Login** to your account
2. Click **"+ New Task"** button
3. Fill in the form:
   - **Title**: Task name (required)
   - **Description**: Task details (optional)
   - **Priority**: Low, Medium, High, Urgent
   - **Status**: Pending, In Progress, Completed
   - **Deadline**: Date and time (optional)
4. Click **"Create Task"**
5. Receive email confirmation

### Updating a Task

1. Click on any task card
2. Modify the fields
3. Click **"Save"**
4. Receive email notification

### Deleting a Task

1. Click on task card
2. Click **"Delete"** button
3. Confirm deletion
4. Task removed from list

### Sorting Tasks

Use the sort dropdown to sort by:
- **Created Date** (newest first)
- **Priority** (urgent → low)
- **Deadline** (soonest first)

### Admin Functions

**Change User Role**:
1. Go to Admin Panel
2. Find user in Users table
3. Select new role from dropdown
4. Role updated automatically

**Delete Any Task**:
1. Go to Admin Panel
2. Find task in Tasks table
3. Click **"Delete"** button
4. Confirm deletion

---

## 📁 Project Structure

```
task-manager/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── layout/       # Layout components (Sidebar)
│   │   │   ├── tasks/        # Task components (TaskCard, TaskDialog)
│   │   │   └── ui/           # Reusable UI components (Radix UI)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities and configurations
│   │   ├── pages/            # Page components
│   │   │   ├── AuthPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── AdminDashboard.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── public/
│
├── server/                    # Backend Express application
│   ├── auth.ts               # Authentication logic
│   ├── db.ts                 # Database connection
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API routes
│   ├── storage.ts            # Database operations
│   ├── notifications.ts      # Email notification system
│   └── middleware.ts         # RBAC middleware
│
├── shared/                    # Shared types and schemas
│   ├── routes.ts             # API route types
│   └── schema.ts             # Database schema (Drizzle)
│
├── docker-compose.yml         # Docker orchestration
├── Dockerfile                 # Container build instructions
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── drizzle.config.ts          # Drizzle ORM configuration
├── SENDGRID.md                # SendGrid integration guide
├── DOCKER.md                  # Docker deployment guide
└── README.md                  # This file
```

---

## 🔒 Security Features

- **Password Hashing**: Crypto.scrypt with salt
- **Session Management**: Secure session cookies
- **CSRF Protection**: Session-based security
- **SQL Injection Prevention**: Parameterized queries (Drizzle ORM)
- **Role-Based Access Control**: Middleware authorization
- **Input Validation**: Zod schema validation
- **Environment Secrets**: Secure environment variables

---

## 🧪 Testing

### Manual Testing

1. **Authentication**:
```bash
# Register user
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test1234"}'

# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test1234"}'
```

2. **Create Task**:
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -b "connect.sid=YOUR_SESSION_COOKIE" \
  -d '{
    "title":"Test Task",
    "description":"Testing",
    "priority":"high",
    "deadline":"2025-12-30T10:00:00Z"
  }'
```

3. **Check Email Logs**:
```bash
docker-compose logs app | grep SENDGRID
```

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user'
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Session Table
```sql
CREATE TABLE session (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
```

---

## 🐛 Troubleshooting

### Email Not Sending

**Check logs**:
```bash
docker-compose logs app --tail=50 | grep SENDGRID
```

**Common issues**:
- ❌ Unverified sender email → Verify in SendGrid dashboard
- ❌ Wrong API key → Check SENDGRID_API_KEY
- ❌ API key permissions → Ensure "Mail Send" permission enabled

### Database Connection Issues

```bash
# Check PostgreSQL status
docker-compose ps

# View database logs
docker-compose logs postgres

# Reconnect to database
docker-compose restart postgres
```

### Port Already in Use

```bash
# Change port in docker-compose.yml
ports:
  - "5001:5000"  # Use 5001 instead of 5000
```

---

## 🚢 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong passwords for PostgreSQL
- [ ] Rotate SendGrid API keys regularly
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Use secrets management (Docker Secrets, Kubernetes Secrets)
- [ ] Set up health checks
- [ ] Configure rate limiting
- [ ] Enable CORS properly

---

## 📝 Demo Credentials

**User Account**:
- Username: `demo`
- Password: `demo1234`
- Role: User

**Admin Account**:
- Username: `admin`
- Password: `admin1234`
- Role: Admin

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Abdullah Al-Otaibi**
- GitHub: [@abdullah0100](https://github.com/abdullah0100)
- Docker Hub: [abdullah0100/task-manager](https://hub.docker.com/r/abdullah0100/task-manager)
- Email: abdullah106778@gmail.com

---

## 🙏 Acknowledgments

- [SendGrid](https://sendgrid.com) - Email delivery service
- [Radix UI](https://www.radix-ui.com/) - Accessible UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Docker](https://www.docker.com/) - Containerization platform

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check [SENDGRID.md](./SENDGRID.md) for email setup
- Check [DOCKER.md](./DOCKER.md) for Docker deployment

---

**Built with ❤️ using Node.js, React, and PostgreSQL**
