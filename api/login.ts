import { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { getDb } from "./_lib/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import { comparePasswords, createAuthResponse } from "../server/auth";
import { withCors } from "./_lib/middleware";

const ADMIN_PASSWORD = "7SS#1";

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const schema = z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    });

    const { username, password } = schema.parse(req.body);

    const db = getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.name, username))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Check if admin password
    if (password === ADMIN_PASSWORD) {
      // Grant admin access
      const userWithAdminRole = { ...user, role: "admin" as const };
      const authResponse = createAuthResponse(userWithAdminRole);
      res.status(200).json(authResponse);
      return;
    }

    // Check regular password
    const isValidPassword = await comparePasswords(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const authResponse = createAuthResponse(user);
    res.status(200).json(authResponse);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default withCors(handler);
