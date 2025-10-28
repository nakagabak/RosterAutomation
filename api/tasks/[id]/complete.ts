import { VercelResponse } from "@vercel/node";
import { withCors, withAuth, AuthenticatedRequest } from "../../_lib/middleware";
import { storage } from "../../_lib/storage";

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const taskId = req.query.id as string;

    if (!taskId) {
      res.status(400).json({ error: "Task ID is required" });
      return;
    }

    const completion = await storage.createTaskCompletion({
      taskId,
      completedAt: new Date(),
    });

    res.status(201).json(completion);
  } catch (error) {
    console.error("Error completing task:", error);
    res.status(500).json({ error: "Failed to complete task" });
  }
}

export default withAuth(withCors(handler));
