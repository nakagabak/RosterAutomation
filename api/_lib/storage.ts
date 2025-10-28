import { getDb } from "./db";
import { users, weeklyRosters, tasks, taskCompletions, bathroomAssignments } from "../../shared/schema";
import { eq, and, desc } from "drizzle-orm";

export class DbStorage {
  private db;

  constructor() {
    this.db = getDb();
  }

  // User methods
  async getUserByUsername(username: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.name, username))
      .limit(1);
    return user || null;
  }

  async getUser(id: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user || null;
  }

  // Weekly roster methods
  async getWeeklyRoster(weekNumber: number, year: number) {
    const [roster] = await this.db
      .select()
      .from(weeklyRosters)
      .where(and(eq(weeklyRosters.weekNumber, weekNumber), eq(weeklyRosters.year, year)))
      .limit(1);
    return roster || null;
  }

  async createWeeklyRoster(data: typeof weeklyRosters.$inferInsert) {
    const [roster] = await this.db.insert(weeklyRosters).values(data).returning();
    return roster;
  }

  async getAllWeeklyRosters() {
    return this.db
      .select()
      .from(weeklyRosters)
      .orderBy(desc(weeklyRosters.year), desc(weeklyRosters.weekNumber));
  }

  // Task methods
  async getTasksByRosterId(rosterId: string) {
    return this.db.select().from(tasks).where(eq(tasks.rosterId, rosterId));
  }

  async createTask(data: typeof tasks.$inferInsert) {
    const [task] = await this.db.insert(tasks).values(data).returning();
    return task;
  }

  async deleteTask(id: string) {
    await this.db.delete(tasks).where(eq(tasks.id, id));
  }

  async getAllTasks() {
    return this.db.select().from(tasks);
  }

  // Task completion methods
  async getCompletionByTaskId(taskId: string) {
    const [completion] = await this.db
      .select()
      .from(taskCompletions)
      .where(eq(taskCompletions.taskId, taskId))
      .limit(1);
    return completion || null;
  }

  async createTaskCompletion(data: typeof taskCompletions.$inferInsert) {
    const [completion] = await this.db.insert(taskCompletions).values(data).returning();
    return completion;
  }

  async getAllCompletions() {
    return this.db.select().from(taskCompletions);
  }

  // Bathroom assignment methods
  async getBathroomsByRosterId(rosterId: string) {
    return this.db
      .select()
      .from(bathroomAssignments)
      .where(eq(bathroomAssignments.rosterId, rosterId));
  }

  async createBathroomAssignment(data: typeof bathroomAssignments.$inferInsert) {
    const [bathroom] = await this.db.insert(bathroomAssignments).values(data).returning();
    return bathroom;
  }

  async updateBathroomAssignment(
    id: string,
    assignedTo: string,
    cleaningMode: "basic" | "deep"
  ) {
    const [bathroom] = await this.db
      .update(bathroomAssignments)
      .set({ assignedTo, cleaningMode })
      .where(eq(bathroomAssignments.id, id))
      .returning();
    return bathroom;
  }

  async updateBathroomCompletion(id: string, completedAt: Date | null) {
    const [bathroom] = await this.db
      .update(bathroomAssignments)
      .set({ completedAt: completedAt ? completedAt.toISOString() : null })
      .where(eq(bathroomAssignments.id, id))
      .returning();
    return bathroom;
  }
}

export const storage = new DbStorage();
