import { defineConfig } from "drizzle-kit";

// Force Node to allow self-signed certificates for Supabase SSL connection
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || "";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.js",
  out: "./drizzle",
  dbCredentials: {
    url: connectionString,
  },
  strict: true,
  verbose: true,
});
