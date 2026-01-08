import { loadEnvConfig } from "@next/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../schema";
import data from "./data.json";
import { auth } from "@/lib/auth";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

// Helper to generate a random vector of 1536 dimensions
const generateDummyVector = () =>
    Array.from({ length: 1536 }, () => Math.random());

async function main() {
    console.log("🚀 Starting database seed...");

    try {
        // 1. Seed Users via Better Auth API
        console.log("👤 Creating users and accounts...");
        const userMap: Record<string, string> = {}; // To map dummy IDs to real DB IDs

        for (const u of data.users) {
            const res = await auth.api.signUpEmail({
                body: {
                    email: u.email,
                    password: u.password,
                    name: u.name,
                    image: u.image,
                },
            });

            // Better Auth generates its own IDs.
            // We map your JSON "user_1" to the actual ID Better Auth created.
            if (res?.user?.id) {
                userMap[u.id] = res.user.id;
            }
        }

        // 2. Seed Items
        console.log("📦 Seeding items...");
        await db.insert(schema.items).values(
            data.items.map((item) => ({
                ...item,
                // Replace the JSON placeholder ID with the actual DB ID
                sellerId: userMap[item.sellerId] || item.sellerId,
                embedding: generateDummyVector(),
                createdAt: new Date(),
                updatedAt: new Date(),
            }))
        );

        console.log("✅ Seed completed successfully!");
    } catch (error) {
        console.error("❌ Seed failed:", error);
    } finally {
        await pool.end();
    }
}

main();
