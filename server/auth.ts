import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false);
      }

      // Admin password check - anyone can become admin with this password
      const ADMIN_PASSWORD = "7SS#1";
      if (password === ADMIN_PASSWORD) {
        // Grant admin access
        return done(null, { ...user, role: "admin" });
      }

      // Regular password check for passwordless resident login
      if (!(await comparePasswords(password, user.password))) {
        return done(null, false);
      }
      
      return done(null, user);
    }),
  );

  passport.serializeUser((user, done) => {
    // Store both id and role in session to preserve admin override
    done(null, { id: user.id, role: user.role });
  });
  passport.deserializeUser(async (sessionData: any, done) => {
    // Handle both old sessions (string id) and new sessions (object with id and role)
    const userId = typeof sessionData === 'string' ? sessionData : sessionData.id;
    const sessionRole = typeof sessionData === 'string' ? null : sessionData.role;
    
    const user = await storage.getUser(userId);
    if (!user) {
      return done(null, false);
    }
    
    // Use session role if available (admin override), otherwise use database role
    const userWithRole = { ...user, role: sessionRole || user.role };
    done(null, userWithRole);
  });

  // Sanitize user object by removing sensitive fields
  function sanitizeUser(user: SelectUser) {
    const { password, ...sanitized } = user;
    return sanitized;
  }

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(sanitizeUser(req.user!));
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(sanitizeUser(req.user!));
  });
}

export { hashPassword };
