import { VercelResponse } from "@vercel/node";
import { withCors, withAdmin, AuthenticatedRequest } from "../../_lib/middleware";
import { storage } from "../../_lib/storage";

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  if (req.method !== "DELETE") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const taskId = req.query.id as string;

    if (!taskId) {
      res.status(400).json({ error: "Task ID is required" });
      return;
    }

    await storage.deleteTask(taskId);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
}

export default withAdmin(withCors(handler));
