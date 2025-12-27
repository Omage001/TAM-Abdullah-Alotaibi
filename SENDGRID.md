# SendGrid Email Integration

## Overview
The Task Manager application now sends **real email notifications** using SendGrid for task-related events.

## Configuration

### Environment Variables
The following environment variables are configured in both `.env` and `docker-compose.yml`:

```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
ADMIN_EMAIL=abdullah106778@gmail.com
FROM_EMAIL=a.alotaibi@nearpay.io
```

### Package Installed
```bash
npm install @sendgrid/mail
```

## Email Notifications

### When Emails Are Sent

#### 1. Task Created
- **Trigger**: When a user creates a new task
- **Subject**: "New Task Created"
- **Content**: Task title and ID
- **Style**: Blue theme with checkmark icon

#### 2. Task Updated
- **Trigger**: When a user updates a task
- **Subject**: "Task Updated"
- **Content**: Update details and task ID
- **Style**: Blue theme with refresh icon

#### 3. Deadline Approaching (24 hours)
- **Trigger**: Automated check every hour
- **Subject**: "⚠️ Task Deadline Approaching"
- **Content**: Task title, deadline time
- **Style**: Yellow/orange warning theme
- **Sent to**: abdullah106778@gmail.com

#### 4. Task Overdue
- **Trigger**: Automated check every hour
- **Subject**: "🚨 Task Overdue!"
- **Content**: Task title with urgent notice
- **Style**: Red urgent theme
- **Sent to**: abdullah106778@gmail.com

### Email Templates

All emails use responsive HTML templates with:
- Professional styling
- Color-coded severity (blue, yellow, red)
- Task ID for reference
- Clear call-to-action messages

### Example Email (Deadline Approaching):
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #F59E0B;">⚠️ Deadline Approaching</h2>
  <p style="font-size: 16px; color: #333;">
    Task "Review Project Proposal" deadline is approaching (due: 12/28/2025, 2:29:19 PM)
  </p>
  <p style="color: #666; font-size: 14px;">Task ID: 3</p>
  <div style="margin-top: 20px; padding: 15px; background-color: #FEF3C7; border-left: 4px solid #F59E0B;">
    <p style="margin: 0; color: #92400E;">
      Don't forget to complete this task before the deadline!
    </p>
  </div>
</div>
```

## Automated Checks

### Deadline Checker
- **Frequency**: Every hour
- **Checks for**:
  - Tasks with deadlines within 24 hours
  - Tasks that are overdue
- **Excludes**: Completed tasks
- **Email recipient**: abdullah106778@gmail.com (admin email)

### Background Service
The deadline checker starts automatically when the application starts:
```typescript
[SENDGRID] API key configured successfully
[NOTIFICATION] Deadline checker started (checking every hour)
```

## Testing SendGrid Integration

### 1. Check Application Logs
```bash
docker-compose logs app --tail=50
```

Look for:
```
[SENDGRID] API key configured successfully
[SENDGRID] ✅ Email sent successfully to abdullah106778@gmail.com
```

### 2. Create a Task with Deadline
```bash
# Login and create a task via UI with a deadline in the next 24 hours
# OR use curl:
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "Testing email notifications",
    "priority": "high",
    "deadline": "2025-12-28T10:00:00Z"
  }' \
  --cookie "connect.sid=<your-session-cookie>"
```

### 3. Check Your Email
Check **abdullah106778@gmail.com** inbox for:
- Task creation email
- Deadline approaching notifications (if deadline is within 24 hours)

### 4. Monitor Notification Queue
The application logs all notifications:
```
[NOTIFICATION] TASK_CREATED: New task created: Test Task (User: 4, Task: 8)
[SENDGRID] ✅ Email sent successfully to abdullah106778@gmail.com
```

## Error Handling

### If SendGrid API Key is Missing
```
[SENDGRID] API key not configured - emails will only be logged to console
[NOTIFICATION] Would send email to abdullah106778@gmail.com: New Task Created
```

### If Email Sending Fails
```
[SENDGRID] ❌ Error sending email: <error details>
```

### If User Email Not Found
```
[NOTIFICATION] No email found for user 5
```

## Production Considerations

### Current Implementation
- All notifications are sent to **abdullah106778@gmail.com**
- This is because users don't have email addresses in the database schema

### Future Enhancements
1. **Add Email Field to Users**:
   ```typescript
   export const users = pgTable("users", {
     id: serial("id").primaryKey(),
     username: text("username").notNull().unique(),
     password: text("password").notNull(),
     role: text("role").notNull().default("user"),
     email: text("email").notNull().unique(), // Add this
   });
   ```

2. **Email Verification**: Add email verification on registration

3. **User Preferences**: Allow users to configure notification preferences

4. **Rate Limiting**: Implement rate limiting to avoid spam

5. **Email Templates**: Use SendGrid dynamic templates for better design

## SendGrid Dashboard

Monitor your email sending at: https://app.sendgrid.com/

### Useful Metrics:
- Delivery rate
- Open rate
- Bounce rate
- Spam reports

### API Usage:
Check your API key usage and limits in the SendGrid dashboard.

## Troubleshooting

### Emails Not Being Received

1. **Check Spam Folder**: SendGrid emails might be marked as spam initially

2. **Verify Sender Authentication**: 
   - Add SPF/DKIM records in SendGrid
   - Verify domain ownership

3. **Check SendGrid Activity**:
   - Login to SendGrid dashboard
   - Go to Activity Feed
   - Check if emails were sent successfully

4. **Check Application Logs**:
   ```bash
   docker-compose logs app | grep SENDGRID
   ```

### API Key Issues

If you see authentication errors:
1. Verify API key is correct
2. Check API key permissions in SendGrid
3. Ensure API key has "Mail Send" permission

## Security Notes

⚠️ **Important**: The SendGrid API key is stored in plain text in:
- `.env` file
- `docker-compose.yml`

**For Production**:
- Use secrets management (Docker Secrets, Kubernetes Secrets, AWS Secrets Manager)
- Use environment variable injection
- Never commit `.env` to version control
- Rotate API keys regularly

## Current Configuration

- **SendGrid API Key**: Configured ✅
- **From Email**: a.alotaibi@nearpay.io (verified sender)
- **Admin Email**: abdullah106778@gmail.com
- **Email Recipients**: All emails go to admin email (abdullah106778@gmail.com)
- **Notification Types**: 4 (Created, Updated, Deadline Approaching, Overdue)
- **Check Frequency**: Every hour
- **Status**: Active and working ✅

## Docker Image

The updated Docker image with SendGrid integration has been pushed:

**Image**: `abdullah0100/task-manager:latest`  
**Digest**: sha256:683f55572606f6fe830d7e0a0711293866f9e29e10eb166447612c147310dd67

## Summary

✅ SendGrid successfully integrated  
✅ Real email notifications enabled  
✅ Automated deadline monitoring active  
✅ HTML email templates implemented  
✅ Error handling configured  
✅ Docker image updated and pushed  

All task-related notifications are now sent to **abdullah106778@gmail.com** via SendGrid! 📧
