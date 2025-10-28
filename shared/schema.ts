import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("resident"), // "admin" or "resident"
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Weekly roster tracks which week we're in
export const weeklyRosters = pgTable("weekly_rosters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weekStartDate: timestamp("week_start_date").notNull(),
  weekNumber: integer("week_number").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWeeklyRosterSchema = createInsertSchema(weeklyRosters).omit({
  id: true,
  createdAt: true,
});

export type InsertWeeklyRoster = z.infer<typeof insertWeeklyRosterSchema>;
export type WeeklyRoster = typeof weeklyRosters.$inferSelect;

// Tasks for each week (main cleaning tasks + custom tasks)
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rosterId: varchar("roster_id").notNull(),
  name: text("name").notNull(),
  assignedTo: text("assigned_to").notNull(),
  isCustomTask: boolean("is_custom_task").notNull().default(false),
  rotationIndex: integer("rotation_index"), // For tracking position in rotation
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Task completions
export const taskCompletions = pgTable("task_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const insertTaskCompletionSchema = createInsertSchema(taskCompletions).omit({
  id: true,
  completedAt: true,
});

export type InsertTaskCompletion = z.infer<typeof insertTaskCompletionSchema>;
export type TaskCompletion = typeof taskCompletions.$inferSelect;

// Bathroom assignments for each week
export const bathroomAssignments = pgTable("bathroom_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rosterId: varchar("roster_id").notNull(),
  bathroomNumber: integer("bathroom_number").notNull(),
  assignedTo: text("assigned_to").notNull(),
  cleaningMode: text("cleaning_mode").notNull(), // 'basic' or 'deep'
  rotationIndex: integer("rotation_index"), // For tracking position in rotation
  completedAt: timestamp("completed_at"),
});

export const insertBathroomAssignmentSchema = createInsertSchema(bathroomAssignments).omit({
  id: true,
});

export type InsertBathroomAssignment = z.infer<typeof insertBathroomAssignmentSchema>;
export type BathroomAssignment = typeof bathroomAssignments.$inferSelect;
