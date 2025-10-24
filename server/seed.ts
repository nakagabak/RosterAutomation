import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

const FIXED_ACCOUNTS = [
  { username: "illy", name: "Illy", role: "resident" as const },
  { username: "atilla", name: "Atilla", role: "resident" as const },
  { username: "allegra", name: "Allegra", role: "resident" as const },
  { username: "perpetua", name: "Perpetua", role: "resident" as const },
  { username: "eman", name: "Eman", role: "resident" as const },
  { username: "dania", name: "Dania", role: "resident" as const },
];

export async function seedUsers() {
  console.log("Seeding fixed user accounts...");

  for (const account of FIXED_ACCOUNTS) {
    const existingUser = await storage.getUserByUsername(account.username);
    
    if (existingUser) {
      console.log(`  ✓ User ${account.username} already exists`);
      continue;
    }

    // Default password is the same as username for passwordless login
    const hashedPassword = await hashPassword(account.username);
    
    await storage.createUser({
      username: account.username,
      name: account.name,
      password: hashedPassword,
      role: account.role,
    });

    console.log(`  ✓ Created user ${account.username} (${account.role})`);
  }

  console.log("User seeding complete!");
}
