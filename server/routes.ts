import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { requireAuth, requireAdmin } from "./middleware";
import { sendNotification, NotificationType, startDeadlineChecker, getUserNotifications } from "./notifications";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Set up authentication first
  setupAuth(app);

  // Start deadline checker
  startDeadlineChecker();

  app.get(api.tasks.list.path, requireAuth, async (req, res) => {
    try {
      const query = api.tasks.list.input?.parse(req.query);
      const tasks = await storage.getTasks(req.user!.id, query);
      res.json(tasks);
    } catch (err) {
      if (err instanceof z.ZodError) {
         const tasks = await storage.getTasks(req.user!.id);
         return res.json(tasks);
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.tasks.get.path, requireAuth, async (req, res) => {
    const task = await storage.getTask(Number(req.params.id));
    if (!task || task.userId !== req.user!.id) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  });

  app.post(api.tasks.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask(req.user!.id, input);
      
      // Send notification
      sendNotification({
        type: NotificationType.TASK_CREATED,
        userId: req.user!.id,
        taskId: task.id,
        message: `New task created: ${task.title}`,
        timestamp: new Date(),
      });
      
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.tasks.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.tasks.update.input.parse(req.body);
      const task = await storage.updateTask(Number(req.params.id), req.user!.id, input);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Send notification
      sendNotification({
        type: NotificationType.TASK_UPDATED,
        userId: req.user!.id,
        taskId: task.id,
        message: `Task updated: ${task.title} - Status: ${task.status}`,
        timestamp: new Date(),
      });

      res.json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.tasks.delete.path, requireAuth, async (req, res) => {
    await storage.deleteTask(Number(req.params.id), req.user!.id);
    res.status(204).send();
  });

  // Admin Routes
  // Get all users (admin only)
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Don't send passwords
      const sanitizedUsers = users.map(u => ({ id: u.id, username: u.username, role: u.role }));
      res.json(sanitizedUsers);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user role (admin only)
  app.put("/api/admin/users/:id/role", requireAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      if (!role || !["user", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const user = await storage.updateUserRole(Number(req.params.id), role);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ id: user.id, username: user.username, role: user.role });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all tasks (admin only)
  app.get("/api/admin/tasks", requireAdmin, async (req, res) => {
    try {
      const query = req.query as any;
      const result = await storage.getAllTasks(query);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete any task (admin only)
  app.delete("/api/admin/tasks/:id", requireAdmin, async (req, res) => {
    try {
      await storage.adminDeleteTask(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user notifications
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const notifications = getUserNotifications(req.user!.id);
      res.json(notifications);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed Data
  if (app.get("env") !== "production") {
    await seedDatabase();
  }

  return httpServer;
}

async function seedDatabase() {
  const existingUser = await storage.getUserByUsername("demo");
  if (!existingUser) {
    const hashedPassword = await hashPassword("demo1234");
    const user = await storage.createUser({
      username: "demo",
      password: hashedPassword
    });
    
    // Create an admin user
    const adminExists = await storage.getUserByUsername("admin");
    if (!adminExists) {
      const adminPassword = await hashPassword("admin1234");
      await storage.createUser({
        username: "admin",
        password: adminPassword,
      });
      // Update role to admin
      const adminUser = await storage.getUserByUsername("admin");
      if (adminUser) {
        await storage.updateUserRole(adminUser.id, "admin");
      }
    }
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    await storage.createTask(user.id, {
      title: "Review Project Proposal",
      description: "Review the new project proposal and provide feedback by EOD.",
      priority: "high",
      status: "pending",
      deadline: tomorrow,
    });
    
    await storage.createTask(user.id, {
      title: "Team Meeting",
      description: "Weekly sync with the engineering team.",
      priority: "medium",
      status: "completed",
    });
    
    await storage.createTask(user.id, {
      title: "Update Documentation",
      description: "Update the API documentation to reflect recent changes.",
      priority: "low",
      status: "in-progress",
      deadline: nextWeek,
    });
    
    console.log("Database seeded with demo user, admin user, and tasks.");
  }
}
