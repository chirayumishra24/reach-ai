import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "./db/schema";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/saas";
const client = postgres(connectionString, { max: 10 });
export const db = drizzle(client, { schema });

// Helper functions for user management compatible with Postgres schema
export async function getUsers() {
  try {
    return await db.select().from(schema.users);
  } catch (err) {
    return [];
  }
}

export async function saveUser(user) {
  if (!user.email) throw new Error("Email is required");
  const normalizedEmail = user.email.toLowerCase().trim();
  const [newUser] = await db
    .insert(schema.users)
    .values({
      name: user.name || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      passwordHash: user.password || "",
      role: user.isAdmin ? "admin" : "manager",
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: {
        name: user.name || normalizedEmail.split("@")[0],
        role: user.isAdmin ? "admin" : "manager",
        updatedAt: new Date(),
      },
    })
    .returning();
  return newUser;
}

export async function deleteUser(email) {
  if (!email) throw new Error("Email is required");
  const normalizedEmail = email.toLowerCase().trim();
  await db.delete(schema.users).where(eq(schema.users.email, normalizedEmail));
  return true;
}

export async function authenticate(email, password) {
  if (!email || !password) return null;
  const normalizedEmail = email.toLowerCase().trim();
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, normalizedEmail))
    .limit(1);
  if (!user) return null;
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}
