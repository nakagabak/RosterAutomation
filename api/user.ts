import { VercelResponse } from "@vercel/node";
import { withCors, withAuth, AuthenticatedRequest } from "./_lib/middleware";
import { getDb } from "./_lib/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import { sanitizeUser } from "../server/auth";

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const db = getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user!.userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Return user with role from token (might be admin override)
    const userWithRole = { ...user, role: req.user!.role };
    res.status(200).json(sanitizeUser(userWithRole));
  } catch (error) {
    console.error("User fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default withAuth(withCors(handler));
