import { verifyToken, extractTokenFromHeader, TokenPayload } from "../../server/auth";
import { VercelRequest, VercelResponse } from "@vercel/node";

export interface AuthenticatedRequest extends VercelRequest {
  user?: TokenPayload;
}

// Middleware to verify JWT token
export function withAuth(
  handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: VercelResponse) => {
    // Allow CORS preflight requests to pass through
    if (req.method === "OPTIONS") {
      return handler(req, res);
    }

    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    req.user = payload;
    return handler(req, res);
  };
}

// Middleware to verify admin role
export function withAdmin(
  handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: VercelResponse) => {
    // Allow CORS preflight requests to pass through
    if (req.method === "OPTIONS") {
      return handler(req, res);
    }

    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    if (payload.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    req.user = payload;
    return handler(req, res);
  };
}

// Helper to handle CORS
export function withCors(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    // Get the origin from the request header
    const origin = req.headers.origin || "*";
    
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,OPTIONS,PATCH,DELETE,POST,PUT"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
    );

    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    return handler(req, res);
  };
}
