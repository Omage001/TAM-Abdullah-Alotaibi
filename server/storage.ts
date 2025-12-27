import { users, tasks, type User, type InsertUser, type Task, type InsertTask, type UpdateTaskRequest } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and, desc, asc, or } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: number, role: string): Promise<User | undefined>;

  getTasks(userId: number, filters?: {
    status?: string;
    priority?: string;
    search?: string;
    sort?: 'priority' | 'createdAt' | 'deadline';
    page?: number;
    limit?: number;
  }): Promise<{ tasks: Task[], total: number }>;
  getAllTasks(filters?: {
    status?: string;
    priority?: string;
    search?: string;
    sort?: 'priority' | 'createdAt' | 'deadline';
    page?: number;
    limit?: number;
  }): Promise<{ tasks: Task[], total: number }>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(userId: number, task: InsertTask): Promise<Task>;
  updateTask(id: number, userId: number, task: UpdateTaskRequest): Promise<Task | undefined>;
  deleteTask(id: number, userId: number): Promise<void>;
  adminDeleteTask(id: number): Promise<void>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserRole(userId: number, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getTasks(userId: number, filters?: {
    status?: string;
    priority?: string;
    search?: string;
    sort?: 'priority' | 'createdAt' | 'deadline';
    page?: number;
    limit?: number;
  }): Promise<{ tasks: Task[], total: number }> {
    const conditions = [eq(tasks.userId, userId)];

    if (filters?.status) {
      conditions.push(eq(tasks.status, filters.status));
    }
    if (filters?.priority) {
      conditions.push(eq(tasks.priority, filters.priority));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(tasks.title, `%${filters.search}%`),
          ilike(tasks.description, `%${filters.search}%`)
        )
      );
    }

    let orderBy = desc(tasks.createdAt);
    if (filters?.sort === 'priority') {
      // Simple sort for now, ideally strictly ordered
      orderBy = desc(tasks.priority);
    } else if (filters?.sort === 'createdAt') {
      orderBy = desc(tasks.createdAt);
    } else if (filters?.sort === 'deadline') {
      orderBy = asc(tasks.deadline);
    }

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const totalResult = await db
      .select()
      .from(tasks)
      .where(and(...conditions));
    const total = totalResult.length;

    const tasksList = await db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return { tasks: tasksList, total };
  }

  async getAllTasks(filters?: {
    status?: string;
    priority?: string;
    search?: string;
    sort?: 'priority' | 'createdAt' | 'deadline';
    page?: number;
    limit?: number;
  }): Promise<{ tasks: Task[], total: number }> {
    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(tasks.status, filters.status));
    }
    if (filters?.priority) {
      conditions.push(eq(tasks.priority, filters.priority));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(tasks.title, `%${filters.search}%`),
          ilike(tasks.description, `%${filters.search}%`)
        )
      );
    }

    let orderBy = desc(tasks.createdAt);
    if (filters?.sort === 'priority') {
      orderBy = desc(tasks.priority);
    } else if (filters?.sort === 'createdAt') {
      orderBy = desc(tasks.createdAt);
    } else if (filters?.sort === 'deadline') {
      orderBy = asc(tasks.deadline);
    }

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const totalResult = conditions.length > 0 
      ? await db.select().from(tasks).where(and(...conditions))
      : await db.select().from(tasks);
    const total = totalResult.length;

    const tasksList = conditions.length > 0
      ? await db
          .select()
          .from(tasks)
          .where(and(...conditions))
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset)
      : await db
          .select()
          .from(tasks)
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset);

    return { tasks: tasksList, total };
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(userId: number, insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({ ...insertTask, userId })
      .returning();
    return task;
  }

  async updateTask(id: number, userId: number, updateTask: UpdateTaskRequest): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({ ...updateTask, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return task;
  }

  async deleteTask(id: number, userId: number): Promise<void> {
    await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  }

  async adminDeleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }
}

export const storage = new DatabaseStorage();
