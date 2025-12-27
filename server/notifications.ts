import { storage } from "./storage";
import { Task } from "@shared/schema";
import sgMail from "@sendgrid/mail";

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log("[SENDGRID] API key configured successfully");
} else {
  console.warn("[SENDGRID] API key not configured - emails will only be logged to console");
}

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@taskmanager.com";

// Notification types
export enum NotificationType {
  TASK_CREATED = "TASK_CREATED",
  TASK_UPDATED = "TASK_UPDATED",
  TASK_DEADLINE_APPROACHING = "TASK_DEADLINE_APPROACHING",
  TASK_OVERDUE = "TASK_OVERDUE",
}

// Notification payload
export interface Notification {
  type: NotificationType;
  userId: number;
  taskId: number;
  message: string;
  timestamp: Date;
}

// In-memory notification queue (in production, use Redis/RabbitMQ)
const notificationQueue: Notification[] = [];

// Get user email by userId
async function getUserEmail(userId: number): Promise<string | null> {
  try {
    const user = await storage.getUser(userId);
    // In production, add an email field to the user schema
    // For now, we'll use admin email as fallback
    return process.env.ADMIN_EMAIL || null;
  } catch (err) {
    console.error(`[NOTIFICATION] Error getting user email:`, err);
    return null;
  }
}

// Send actual email via SendGrid
async function sendEmail(to: string, subject: string, html: string, text: string) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`[NOTIFICATION] Would send email to ${to}: ${subject}`);
    return;
  }

  try {
    await sgMail.send({
      to,
      from: FROM_EMAIL,
      subject,
      text,
      html,
    });
    console.log(`[SENDGRID] ✅ Email sent successfully to ${to}`);
  } catch (error: any) {
    console.error(`[SENDGRID] ❌ Error sending email:`, error.response?.body || error.message);
  }
}

// Send notification with real email
export async function sendNotification(notification: Notification) {
  notificationQueue.push(notification);
  
  // Log notification
  console.log(`[NOTIFICATION] ${notification.type}: ${notification.message} (User: ${notification.userId}, Task: ${notification.taskId})`);
  
  // Get user email
  const userEmail = await getUserEmail(notification.userId);
  if (!userEmail) {
    console.warn(`[NOTIFICATION] No email found for user ${notification.userId}`);
    return;
  }

  // Send email based on notification type
  let subject = "";
  let html = "";
  let text = "";

  switch (notification.type) {
    case NotificationType.TASK_CREATED:
      subject = "New Task Created";
      text = `You created a new task: ${notification.message}`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">✅ New Task Created</h2>
          <p>${notification.message}</p>
          <p style="color: #666; font-size: 14px;">Task ID: ${notification.taskId}</p>
        </div>
      `;
      await sendEmail(userEmail, subject, html, text);
      console.log(`  📧 Email sent to ${userEmail}`);
      break;

    case NotificationType.TASK_UPDATED:
      subject = "Task Updated";
      text = `Your task was updated: ${notification.message}`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">🔄 Task Updated</h2>
          <p>${notification.message}</p>
          <p style="color: #666; font-size: 14px;">Task ID: ${notification.taskId}</p>
        </div>
      `;
      await sendEmail(userEmail, subject, html, text);
      console.log(`  📧 Email sent to ${userEmail}`);
      break;

    case NotificationType.TASK_DEADLINE_APPROACHING:
      subject = "⚠️ Task Deadline Approaching";
      text = `Reminder: ${notification.message}`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #F59E0B;">⚠️ Deadline Approaching</h2>
          <p style="font-size: 16px; color: #333;">${notification.message}</p>
          <p style="color: #666; font-size: 14px;">Task ID: ${notification.taskId}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #FEF3C7; border-left: 4px solid #F59E0B;">
            <p style="margin: 0; color: #92400E;">Don't forget to complete this task before the deadline!</p>
          </div>
        </div>
      `;
      await sendEmail(userEmail, subject, html, text);
      console.log(`  📧 Email sent to ${userEmail}`);
      break;

    case NotificationType.TASK_OVERDUE:
      subject = "🚨 Task Overdue!";
      text = `URGENT: ${notification.message}`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #DC2626;">🚨 Task Overdue</h2>
          <p style="font-size: 16px; color: #333;">${notification.message}</p>
          <p style="color: #666; font-size: 14px;">Task ID: ${notification.taskId}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #FEE2E2; border-left: 4px solid #DC2626;">
            <p style="margin: 0; color: #991B1B;">This task is past its deadline. Please take action immediately!</p>
          </div>
        </div>
      `;
      await sendEmail(userEmail, subject, html, text);
      console.log(`  🔔 Push notification sent to ${userEmail}`);
      break;
  }
}

// Check for upcoming deadlines and overdue tasks
export async function checkTaskDeadlines() {
  try {
    const allTasksResult = await storage.getAllTasks({ limit: 1000 });
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    for (const task of allTasksResult.tasks) {
      if (!task.deadline || task.status === "completed") continue;
      
      const deadline = new Date(task.deadline);
      
      // Check if task is overdue
      if (deadline < now) {
        sendNotification({
          type: NotificationType.TASK_OVERDUE,
          userId: task.userId,
          taskId: task.id,
          message: `Task "${task.title}" is overdue!`,
          timestamp: now,
        });
      }
      // Check if deadline is within 24 hours
      else if (deadline < oneDayFromNow) {
        sendNotification({
          type: NotificationType.TASK_DEADLINE_APPROACHING,
          userId: task.userId,
          taskId: task.id,
          message: `Task "${task.title}" deadline is approaching (due: ${deadline.toLocaleString()})`,
          timestamp: now,
        });
      }
    }
  } catch (err) {
    console.error("[NOTIFICATION] Error checking task deadlines:", err);
  }
}

// Start deadline checker (runs every hour)
export function startDeadlineChecker() {
  // Check immediately on startup
  checkTaskDeadlines();
  
  // Then check every hour
  setInterval(checkTaskDeadlines, 60 * 60 * 1000);
  
  console.log("[NOTIFICATION] Deadline checker started (checking every hour)");
}

// Get user notifications (for future UI integration)
export function getUserNotifications(userId: number): Notification[] {
  return notificationQueue.filter(n => n.userId === userId);
}

// Clear old notifications (older than 7 days)
export function cleanupOldNotifications() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const originalLength = notificationQueue.length;
  
  while (notificationQueue.length > 0 && notificationQueue[0].timestamp < sevenDaysAgo) {
    notificationQueue.shift();
  }
  
  const cleaned = originalLength - notificationQueue.length;
  if (cleaned > 0) {
    console.log(`[NOTIFICATION] Cleaned up ${cleaned} old notifications`);
  }
}

// Run cleanup daily
setInterval(cleanupOldNotifications, 24 * 60 * 60 * 1000);
