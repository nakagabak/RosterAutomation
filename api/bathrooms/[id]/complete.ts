import { VercelResponse } from "@vercel/node";
import { withCors, withAuth, AuthenticatedRequest } from "../../_lib/middleware";
import { storage } from "../../_lib/storage";

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const bathroomId = req.query.id as string;

    if (!bathroomId) {
      res.status(400).json({ error: "Bathroom ID is required" });
      return;
    }

    const bathroom = await storage.updateBathroomCompletion(bathroomId, new Date());

    res.status(200).json(bathroom);
  } catch (error) {
    console.error("Error completing bathroom:", error);
    res.status(500).json({ error: "Failed to complete bathroom" });
  }
}

export default withAuth(withCors(handler));
