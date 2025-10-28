import { VercelResponse } from "@vercel/node";
import { z } from "zod";
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

    const schema = z.object({
      assignedTo: z.string().min(1),
      cleaningMode: z.enum(["basic", "deep"]),
    });

    const { assignedTo, cleaningMode } = schema.parse(req.body);

    const bathroom = await storage.updateBathroomAssignment(
      bathroomId,
      assignedTo,
      cleaningMode
    );

    res.status(200).json(bathroom);
  } catch (error) {
    console.error("Error updating bathroom:", error);
    res.status(500).json({ error: "Failed to update bathroom" });
  }
}

export default withAuth(withCors(handler));
