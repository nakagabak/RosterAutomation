import { VercelResponse } from "@vercel/node";
import { z } from "zod";
import { withCors, withAdmin, AuthenticatedRequest } from "../_lib/middleware";
import { storage } from "../_lib/storage";
import { rotationManager } from "../_lib/rotation";

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

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
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
}

export default withAdmin(withCors(handler));
