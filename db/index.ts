// db connection/client
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in environment variables");
}

// Cache the database connection in development
// to prevent exhausting database connection pool.
const globalForDB = global as unknown as {
    conn: Pool | undefined;
};

// use ssl in production (Neon DB)
const ssl =
    process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false;

const pool =
    globalForDB.conn ??
    new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl,
        // set a max connection limit to be safe
        max: process.env.NODE_ENV === "production" ? 10 : 1,
    });

if (process.env.NODE_ENV !== "production") globalForDB.conn = pool;

export const db = drizzle(pool, { schema });
