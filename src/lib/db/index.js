import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || "";

if (!connectionString && process.env.NODE_ENV !== "production") {
  console.warn("⚠️ Warning: POSTGRES_URL or DATABASE_URL is not set. Database operations will fail.");
}

// For serverless environments like Neon/Vercel Postgres, prepare: false is recommended to avoid prepared statement caching issues
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
export * from "./schema";
