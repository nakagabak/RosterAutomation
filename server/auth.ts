import jwt from "jsonwebtoken";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { User as SelectUser } from "@shared/schema";

const scryptAsync = promisify(scrypt);

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  // Only throw in production/serverless environments
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  // Allow development fallback
  return "development-secret-key-do-not-use-in-production";
})();
const JWT_EXPIRES_IN = "7d"; // 7 days

export interface TokenPayload {
  userId: string;
  name: string;
  role: "resident" | "admin";
}

export interface AuthResponse {
  user: Omit<SelectUser, "password">;
  token: string;
}

// Password hashing functions
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// JWT token functions
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

// Sanitize user object by removing sensitive fields
export function sanitizeUser(user: SelectUser): Omit<SelectUser, "password"> {
  const { password, ...sanitized } = user;
  return sanitized;
}

// Create auth response with token
export function createAuthResponse(user: SelectUser): AuthResponse {
  const token = generateToken({
    userId: user.id,
    name: user.name,
    role: user.role as "resident" | "admin",
  });

  return {
    user: sanitizeUser(user),
    token,
  };
}
