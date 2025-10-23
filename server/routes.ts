import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { rotationManager, ALL_RESIDENTS } from "./rotation";
import { setupAuth } from "./auth";
import { z } from "zod";
import { format } from "date-fns";

// Configure multer for memory storage (we'll upload to object storage)
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to check if user is authenticated
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

// Middleware to check if user is admin
function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication (adds /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Initialize current week on server startup
  await rotationManager.ensureCurrentWeekRoster();

  // GET /api/current-week - Get current week's roster
  app.get("/api/current-week", async (req, res) => {
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

  // GET /api/history - Get all weekly rosters
  app.get("/api/history", async (req, res) => {
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

  // POST /api/tasks/:id/complete - Mark task as complete with optional photo proof
  app.post("/api/tasks/:id/complete", upload.single('photo'), async (req, res) => {
    try {
      const { id } = req.params;
      const proofPhotos: string[] = [];

      // If a photo was uploaded, store it in object storage
      if (req.file) {
        const { Client } = await import("@replit/object-storage");
        const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
        
        if (!bucketId) {
          res.status(500).json({ error: "Object storage is not configured" });
          return;
        }
        
        const client = new Client({ bucket: bucketId });
        const privateDir = process.env.PRIVATE_OBJECT_DIR || ".private";
        
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const filename = `${timestamp}-${req.file.originalname}`;
        const filePath = `${privateDir}/${filename}`;
        
        // Upload to object storage
        const uploadResult = await client.uploadFromBytes(filePath, req.file.buffer);
        
        if (uploadResult.isErr()) {
          console.error("Error uploading photo:", uploadResult.error);
          res.status(500).json({ error: "Failed to upload photo" });
          return;
        }
        
        proofPhotos.push(filename);
      }

      // Create task completion record
      const completion = await storage.createTaskCompletion({
        taskId: id,
        proofPhotos,
      });

      res.json(completion);
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ error: "Failed to complete task" });
    }
  });

  // PUT /api/bathrooms/:id - Update bathroom assignment
  app.put("/api/bathrooms/:id", async (req, res) => {
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

  // GET /api/photos/:path - Get photo from object storage
  app.get("/api/photos/*", async (req, res) => {
    try {
      const { Client } = await import("@replit/object-storage");
      const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      
      if (!bucketId) {
        throw new Error("Object storage is not configured");
      }
      
      const client = new Client({ bucket: bucketId });
      
      // Get the path after /api/photos/
      const photoPath = req.path.replace('/api/photos/', '');
      const privateDir = process.env.PRIVATE_OBJECT_DIR || ".private";
      const fullPath = `${privateDir}/${photoPath}`;

      const result = await client.downloadAsBytes(fullPath);
      
      if (result.isErr()) {
        throw result.error;
      }
      
      const [fileBytes] = result.value;
      
      // Determine content type based on file extension
      const extension = photoPath.split('.').pop()?.toLowerCase();
      const contentType = extension === 'png' ? 'image/png' : 'image/jpeg';
      
      res.set('Content-Type', contentType);
      res.send(fileBytes);
    } catch (error) {
      console.error("Error fetching photo:", error);
      res.status(404).json({ error: "Photo not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
