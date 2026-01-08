// db connection/client
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in environment variables");
}

// Cache the database connection in development
// to prevent exhausting database connection pool.
const globalForDB = global as unknown as {
    conn: Pool | undefined;
};

const pool =
    globalForDB.conn ??
    new Pool({
        connectionString: process.env.DATABASE_URL,
    });

if (process.env.NODE_ENV !== "production") globalForDB.conn = pool;

export const db = drizzle(pool, { schema });
