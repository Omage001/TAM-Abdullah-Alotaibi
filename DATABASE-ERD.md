# Database ERD (Entity Relationship Diagram)

## Overview

The Task Manager application uses PostgreSQL with three main tables: `users`, `tasks`, and `session`.

## Database Schema

```
┌─────────────────────────────────────┐
│             USERS                   │
├─────────────────────────────────────┤
│ PK  id (SERIAL)                     │
│     username (TEXT) UNIQUE          │
│     password (TEXT)                 │
│     role (TEXT) DEFAULT 'user'      │
└─────────────────────────────────────┘
                 │
                 │ 1
                 │
                 │ has many
                 │
                 │ N
                 ▼
┌─────────────────────────────────────┐
│             TASKS                   │
├─────────────────────────────────────┤
│ PK  id (SERIAL)                     │
│     title (TEXT)                    │
│     description (TEXT)              │
│     priority (TEXT) DEFAULT 'medium'│
│     status (TEXT) DEFAULT 'pending' │
│ FK  user_id (INTEGER)               │
│     deadline (TIMESTAMP)            │
│     created_at (TIMESTAMP)          │
│     updated_at (TIMESTAMP)          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│            SESSION                  │
├─────────────────────────────────────┤
│ PK  sid (VARCHAR)                   │
│     sess (JSON)                     │
│     expire (TIMESTAMP)              │
└─────────────────────────────────────┘
```

## Table Details

### 1. Users Table

**Purpose:** Stores user authentication and authorization data

| Column   | Type    | Constraints           | Description                    |
|----------|---------|----------------------|--------------------------------|
| id       | SERIAL  | PRIMARY KEY          | Unique user identifier         |
| username | TEXT    | NOT NULL, UNIQUE     | User login name                |
| password | TEXT    | NOT NULL             | Hashed password (scrypt)       |
| role     | TEXT    | NOT NULL, DEFAULT 'user' | User role (user/admin)     |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE constraint on `username`

**Sample Data:**
```sql
INSERT INTO users (username, password, role) VALUES
('demo', 'hashed_password_here', 'user'),
('admin', 'hashed_password_here', 'admin');
```

---

### 2. Tasks Table

**Purpose:** Stores task information with ownership and deadlines

| Column      | Type      | Constraints                    | Description                           |
|-------------|-----------|--------------------------------|---------------------------------------|
| id          | SERIAL    | PRIMARY KEY                    | Unique task identifier                |
| title       | TEXT      | NOT NULL                       | Task title                            |
| description | TEXT      |                                | Task details                          |
| priority    | TEXT      | NOT NULL, DEFAULT 'medium'     | Priority (low/medium/high/urgent)     |
| status      | TEXT      | NOT NULL, DEFAULT 'pending'    | Status (pending/in-progress/completed)|
| user_id     | INTEGER   | NOT NULL, FOREIGN KEY → users(id) | Owner of the task                  |
| deadline    | TIMESTAMP |                                | Task deadline (optional)              |
| created_at  | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP      | Task creation time                    |
| updated_at  | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP      | Last update time                      |

**Foreign Keys:**
- `user_id` REFERENCES `users(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY on `id`
- FOREIGN KEY index on `user_id`

**Sample Data:**
```sql
INSERT INTO tasks (title, description, priority, status, user_id, deadline) VALUES
('Complete project', 'Finish the task manager', 'high', 'in-progress', 1, '2025-12-31 23:59:59'),
('Review code', 'Code review for PR #123', 'medium', 'pending', 2, NULL);
```

---

### 3. Session Table

**Purpose:** Stores user session data for authentication

| Column | Type        | Constraints  | Description                  |
|--------|-------------|--------------|------------------------------|
| sid    | VARCHAR     | PRIMARY KEY  | Session ID                   |
| sess   | JSON        | NOT NULL     | Session data (user info, etc)|
| expire | TIMESTAMP   | NOT NULL     | Session expiration time      |

**Indexes:**
- PRIMARY KEY on `sid`
- INDEX on `expire` for cleanup queries

**Sample Data:**
```sql
-- Managed automatically by express-session
```

---

## Relationships

### One-to-Many: Users → Tasks

```
users (1) ────────< (N) tasks
  │                     │
  └── user_id ──────────┘
```

- **Type:** One-to-Many
- **Description:** Each user can have multiple tasks
- **Cascade:** ON DELETE CASCADE (deleting a user deletes all their tasks)
- **Foreign Key:** `tasks.user_id` → `users.id`

---

## Database Constraints

### Primary Keys
```sql
-- Users
ALTER TABLE users ADD PRIMARY KEY (id);

-- Tasks
ALTER TABLE tasks ADD PRIMARY KEY (id);

-- Session
ALTER TABLE session ADD PRIMARY KEY (sid);
```

### Foreign Keys
```sql
-- Tasks references Users
ALTER TABLE tasks 
  ADD CONSTRAINT fk_tasks_user 
  FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON DELETE CASCADE;
```

### Unique Constraints
```sql
-- Username must be unique
ALTER TABLE users ADD UNIQUE (username);
```

### Check Constraints
```sql
-- Priority values
ALTER TABLE tasks ADD CHECK (
  priority IN ('low', 'medium', 'high', 'urgent')
);

-- Status values
ALTER TABLE tasks ADD CHECK (
  status IN ('pending', 'in-progress', 'completed')
);

-- Role values
ALTER TABLE users ADD CHECK (
  role IN ('user', 'admin')
);
```

---

## SQL Schema

### Complete Schema Creation

```sql
-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  CHECK (role IN ('user', 'admin'))
);

-- Create Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  CHECK (status IN ('pending', 'in-progress', 'completed'))
);

-- Create Session table
CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_session_expire ON session(expire);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
```

---

## Entity Descriptions

### User Entity
**Represents:** Application users (both regular users and administrators)

**Attributes:**
- Identity: `id`, `username`
- Security: `password` (hashed with crypto.scrypt + salt)
- Authorization: `role` (determines access level)

**Business Rules:**
- Username must be unique
- Password must be hashed (never store plaintext)
- Role determines RBAC permissions
- Default role is 'user'

---

### Task Entity
**Represents:** Individual tasks created by users

**Attributes:**
- Identity: `id`
- Content: `title`, `description`
- Classification: `priority`, `status`
- Ownership: `user_id`
- Timing: `deadline`, `created_at`, `updated_at`

**Business Rules:**
- Every task must have an owner (user_id)
- Priority affects task ordering
- Status tracks task lifecycle
- Deadline is optional (can be NULL)
- Timestamps track creation and updates

---

### Session Entity
**Represents:** User session data for maintaining authentication state

**Attributes:**
- Identity: `sid` (session ID)
- Data: `sess` (JSON containing user info, login time, etc.)
- Expiration: `expire` (automatic cleanup)

**Business Rules:**
- Sessions expire after inactivity
- Managed by express-session middleware
- Contains serialized user information
- Cleaned up periodically by expire index

---

## Query Examples

### Get all tasks for a user
```sql
SELECT * FROM tasks 
WHERE user_id = 1 
ORDER BY created_at DESC;
```

### Get tasks by priority
```sql
SELECT * FROM tasks 
WHERE priority = 'high' 
ORDER BY deadline ASC;
```

### Get overdue tasks
```sql
SELECT t.*, u.username 
FROM tasks t
JOIN users u ON t.user_id = u.id
WHERE t.deadline < NOW() 
  AND t.status != 'completed'
ORDER BY t.deadline ASC;
```

### Get user with task count
```sql
SELECT u.username, u.role, COUNT(t.id) as task_count
FROM users u
LEFT JOIN tasks t ON u.id = t.user_id
GROUP BY u.id, u.username, u.role;
```

### Delete user and cascade tasks
```sql
-- This will automatically delete all tasks owned by the user
DELETE FROM users WHERE id = 5;
```

---

## Database Statistics

### Current Schema Version
- PostgreSQL: 17-alpine
- Tables: 3
- Relationships: 1 (One-to-Many)
- Indexes: 3

### Data Types Used
- SERIAL (auto-incrementing integer)
- TEXT (unlimited text)
- INTEGER (numeric foreign key)
- TIMESTAMP (date/time)
- VARCHAR (session ID)
- JSON (session data)

---

## Migrations

### Adding a New Column (Example)
```sql
-- Add email column to users
ALTER TABLE users ADD COLUMN email TEXT UNIQUE;

-- Add category to tasks
ALTER TABLE tasks ADD COLUMN category TEXT DEFAULT 'general';
```

### Modifying Existing Data
```sql
-- Update all pending tasks to in-progress
UPDATE tasks 
SET status = 'in-progress', updated_at = CURRENT_TIMESTAMP
WHERE status = 'pending';
```

---

## Backup and Restore

### Backup Database
```bash
docker-compose exec postgres pg_dump -U postgres secure_scala_chat > backup.sql
```

### Restore Database
```bash
docker-compose exec -T postgres psql -U postgres secure_scala_chat < backup.sql
```

---

## Performance Optimization

### Indexes
- `idx_session_expire` - Fast session cleanup
- `idx_tasks_user_id` - Fast user task queries
- `idx_tasks_deadline` - Fast deadline queries

### Recommended Additional Indexes
```sql
-- For task filtering by status
CREATE INDEX idx_tasks_status ON tasks(status);

-- For task filtering by priority
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- Composite index for user + status queries
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
```

---

## Security Considerations

1. **Password Hashing:** All passwords use crypto.scrypt with salt
2. **SQL Injection Prevention:** Parameterized queries via Drizzle ORM
3. **Cascade Deletion:** Prevents orphaned tasks
4. **Session Management:** Automatic expiration with secure cookies
5. **Role-Based Access:** Enforced at application and database level

---

## ORM Integration (Drizzle)

The schema is defined in TypeScript using Drizzle ORM:

**File:** `shared/schema.ts`

```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("pending"),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

---

**Database ERD Complete** ✅
