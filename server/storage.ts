import { db, pool } from "./db";
import { eq, and, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import {
  type User,
  type InsertUser,
  type WeeklyRoster,
  type InsertWeeklyRoster,
  type Task,
  type InsertTask,
  type TaskCompletion,
  type InsertTaskCompletion,
  type BathroomAssignment,
  type InsertBathroomAssignment,
  users,
  weeklyRosters,
  tasks,
  taskCompletions,
  bathroomAssignments,
} from "@shared/schema";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Weekly Rosters
  getCurrentWeekRoster(weekStartDate: Date): Promise<WeeklyRoster | undefined>;
  createWeeklyRoster(roster: InsertWeeklyRoster): Promise<WeeklyRoster>;
  getAllWeeklyRosters(): Promise<WeeklyRoster[]>;

  // Tasks
  getTasksForRoster(rosterId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  deleteTask(taskId: string): Promise<void>;
  getTaskById(taskId: string): Promise<Task | undefined>;

  // Task Completions
  getTaskCompletion(taskId: string): Promise<TaskCompletion | undefined>;
  createTaskCompletion(completion: InsertTaskCompletion): Promise<TaskCompletion>;
  getAllCompletions(): Promise<TaskCompletion[]>;

  // Bathroom Assignments
  getBathroomAssignmentsForRoster(rosterId: string): Promise<BathroomAssignment[]>;
  createBathroomAssignment(assignment: InsertBathroomAssignment): Promise<BathroomAssignment>;
  updateBathroomAssignment(
    id: string,
    assignedTo: string,
    cleaningMode: string
  ): Promise<BathroomAssignment | undefined>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Weekly Rosters
  async getCurrentWeekRoster(weekStartDate: Date): Promise<WeeklyRoster | undefined> {
    const result = await db
      .select()
      .from(weeklyRosters)
      .where(eq(weeklyRosters.weekStartDate, weekStartDate))
      .limit(1);
    return result[0];
  }

  async createWeeklyRoster(roster: InsertWeeklyRoster): Promise<WeeklyRoster> {
    const result = await db.insert(weeklyRosters).values(roster).returning();
    return result[0];
  }

  async getAllWeeklyRosters(): Promise<WeeklyRoster[]> {
    return await db.select().from(weeklyRosters).orderBy(desc(weeklyRosters.weekStartDate));
  }

  // Tasks
  async getTasksForRoster(rosterId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.rosterId, rosterId));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(task).returning();
    return result[0];
  }

  async deleteTask(taskId: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, taskId));
  }

  async getTaskById(taskId: string): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
    return result[0];
  }

  // Task Completions
  async getTaskCompletion(taskId: string): Promise<TaskCompletion | undefined> {
    const result = await db
      .select()
      .from(taskCompletions)
      .where(eq(taskCompletions.taskId, taskId))
      .limit(1);
    return result[0];
  }

  async createTaskCompletion(completion: InsertTaskCompletion): Promise<TaskCompletion> {
    const result = await db.insert(taskCompletions).values(completion).returning();
    return result[0];
  }

  async getAllCompletions(): Promise<TaskCompletion[]> {
    return await db.select().from(taskCompletions).orderBy(desc(taskCompletions.completedAt));
  }

  // Bathroom Assignments
  async getBathroomAssignmentsForRoster(rosterId: string): Promise<BathroomAssignment[]> {
    return await db.select().from(bathroomAssignments).where(eq(bathroomAssignments.rosterId, rosterId));
  }

  async createBathroomAssignment(assignment: InsertBathroomAssignment): Promise<BathroomAssignment> {
    const result = await db.insert(bathroomAssignments).values(assignment).returning();
    return result[0];
  }

  async updateBathroomAssignment(
    id: string,
    assignedTo: string,
    cleaningMode: string
  ): Promise<BathroomAssignment | undefined> {
    const result = await db
      .update(bathroomAssignments)
      .set({ assignedTo, cleaningMode })
      .where(eq(bathroomAssignments.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
