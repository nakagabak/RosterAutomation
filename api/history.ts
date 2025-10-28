import { VercelResponse } from "@vercel/node";
import { withCors, withAuth, AuthenticatedRequest } from "./_lib/middleware";
import { storage } from "./_lib/storage";
import { rotationManager } from "./_lib/rotation";

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

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
}

export default withAuth(withCors(handler));
