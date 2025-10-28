import { VercelResponse } from "@vercel/node";
import { withCors, withAuth, AuthenticatedRequest } from "./_lib/middleware";
import { rotationManager } from "./_lib/rotation";

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

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
}

export default withAuth(withCors(handler));
