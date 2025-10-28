import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { rotationManager, ALL_RESIDENTS } from "./rotation";
import { 
  verifyToken, 
  extractTokenFromHeader, 
  createAuthResponse,
  comparePasswords,
  type TokenPayload 
} from "./auth";
import { z } from "zod";
import { format } from "date-fns";

// Extend Express Request to include user
interface AuthRequest extends Request {
  user?: TokenPayload;
}

// Middleware to check if user is authenticated
function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = payload;
  next();
}

// Middleware to check if user is admin
function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  if (payload.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  req.user = payload;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize current week on server startup
  await rotationManager.ensureCurrentWeekRoster();

  // POST /api/login - Authenticate user and return JWT token
  app.post("/api/login", async (req, res) => {
    try {
      const schema = z.object({
        username: z.string().min(1),
        password: z.string().optional(),
      });

      const { username, password } = schema.parse(req.body);
      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Admin login requires password
      if (user.role === "admin") {
        if (!password) {
          return res.status(401).json({ error: "Password required for admin" });
        }

        const valid = await comparePasswords(password, user.password);
        if (!valid) {
          return res.status(401).json({ error: "Invalid credentials" });
        }
      }

      const authResponse = createAuthResponse(user);
      res.json(authResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data" });
      } else {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // GET /api/user - Get current user info from JWT token
  app.get("/api/user", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password, ...sanitized } = user;
      res.json({ user: sanitized });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET /api/current-week - Get current week's roster (requires auth)
  app.get("/api/current-week", requireAuth, async (req, res) => {
    try {
      const roster = await rotationManager.ensureCurrentWeekRoster();
      const data = await rotationManager.getRosterData(roster.id);
      
      res.json({
        roster: {
          id: roster.id,
          weekStartDate: roster.weekStartDate,
          weekNumber: roster.weekNumber,
          year: roster.year,
        },
        ...data,
      });
    } catch (error) {
      console.error("Error fetching current week:", error);
      res.status(500).json({ error: "Failed to fetch current week roster" });
    }
  });

  // GET /api/history - Get all weekly rosters (requires auth)
  app.get("/api/history", requireAuth, async (req, res) => {
    try {
      const rosters = await storage.getAllWeeklyRosters();
      
      const historyData = await Promise.all(
        rosters.map(async (roster) => {
          const data = await rotationManager.getRosterData(roster.id);
          return {
            id: roster.id,
            weekStartDate: roster.weekStartDate,
            weekNumber: roster.weekNumber,
            year: roster.year,
            ...data,
          };
        })
      );

      res.json(historyData);
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // GET /api/users - Get all users (admin only)
  app.get("/api/users", requireAdmin, async (_req, res) => {
    try {
      const usersList = ALL_RESIDENTS.map(name => ({ name }));
      res.json(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // GET /api/admin/tasks - Get all tasks (admin only)
  app.get("/api/admin/tasks", requireAdmin, async (_req, res) => {
    try {
      const allTasks = await storage.getAllTasks();
      const completions = await storage.getAllCompletions();
      
      const tasksWithStatus = allTasks.map(task => ({
        ...task,
        status: completions.some(c => c.taskId === task.id) ? 'completed' : 'pending',
        completion: completions.find(c => c.taskId === task.id),
      }));
      
      res.json(tasksWithStatus);
    } catch (error) {
      console.error("Error fetching all tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // POST /api/tasks - Create a custom task (admin only)
  app.post("/api/tasks", requireAdmin, async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1),
        assignedTo: z.string().min(1),
      });

      const { name, assignedTo } = schema.parse(req.body);
      const roster = await rotationManager.ensureCurrentWeekRoster();

      const task = await storage.createTask({
        rosterId: roster.id,
        name,
        assignedTo,
        isCustomTask: true,
        rotationIndex: null,
      });

      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        console.error("Error creating task:", error);
        res.status(500).json({ error: "Failed to create task" });
      }
    }
  });

  // PUT /api/tasks/:id - Update a task (admin only)
  app.put("/api/tasks/:id", requireAdmin, async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1).optional(),
        assignedTo: z.string().min(1).optional(),
      });

      const { id } = req.params;
      const updates = schema.parse(req.body);

      const updated = await storage.updateTask(id, updates);
      
      if (!updated) {
        res.status(404).json({ error: "Task not found" });
        return;
      }

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        console.error("Error updating task:", error);
        res.status(500).json({ error: "Failed to update task" });
      }
    }
  });

  // DELETE /api/tasks/:id - Delete a task (admin only)
  app.delete("/api/tasks/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTask(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // POST /api/tasks/:id/complete - Mark task as complete (requires auth)
  app.post("/api/tasks/:id/complete", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;

      // Create task completion record
      const completion = await storage.createTaskCompletion({
        taskId: id,
      });

      res.json(completion);
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ error: "Failed to complete task" });
    }
  });

  // PUT /api/bathrooms/:id - Update bathroom assignment (requires auth)
  app.put("/api/bathrooms/:id", requireAuth, async (req, res) => {
    try {
      const schema = z.object({
        assignedTo: z.enum(ALL_RESIDENTS as [string, ...string[]]),
        cleaningMode: z.enum(["basic", "deep"]),
      });

      const { id } = req.params;
      const { assignedTo, cleaningMode } = schema.parse(req.body);

      const updated = await storage.updateBathroomAssignment(id, assignedTo, cleaningMode);
      
      if (!updated) {
        res.status(404).json({ error: "Bathroom assignment not found" });
        return;
      }

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        console.error("Error updating bathroom:", error);
        res.status(500).json({ error: "Failed to update bathroom assignment" });
      }
    }
  });

  // POST /api/bathrooms/:id/complete - Mark bathroom as complete
  app.post("/api/bathrooms/:id/complete", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify the bathroom assignment exists and user is assigned to it
      const bathroom = await storage.getBathroomAssignmentById(id);
      
      if (!bathroom) {
        res.status(404).json({ error: "Bathroom assignment not found" });
        return;
      }
      
      // Verify the current user is assigned to this bathroom
      const currentUser = req as AuthRequest;
      if (bathroom.assignedTo !== currentUser.user!.name) {
        res.status(403).json({ error: "You can only complete bathrooms assigned to you" });
        return;
      }

      const completed = await storage.completeBathroomAssignment(id);
      
      if (!completed) {
        res.status(404).json({ error: "Bathroom assignment not found" });
        return;
      }

      res.json(completed);
    } catch (error) {
      console.error("Error completing bathroom:", error);
      res.status(500).json({ error: "Failed to complete bathroom" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
