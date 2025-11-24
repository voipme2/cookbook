import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./db.schema";
import dotenv from "dotenv";

// Load environment variables from .env file (development only)
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: parseInt(process.env.PGPORT || "5432", 10),
});

export const db = drizzle(pool, { schema });

// Export the pool for raw queries if needed
export { pool };

