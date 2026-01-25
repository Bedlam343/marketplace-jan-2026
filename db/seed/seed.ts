import { loadEnvConfig } from "@next/env";
const projectDir = process.cwd();
loadEnvConfig(projectDir);

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sql, eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

import * as schema from "../schema";
import data from "./data.json";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined. Check your .env.local file.");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : false,
    max: 1, // only need 1 connection for a seed script
});

const db = drizzle(pool, { schema });

const seedAuth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            ...schema,
            user: schema.user,
            session: schema.session,
            account: schema.account,
        },
    }),
    emailAndPassword: {
        enabled: true,
    },
    // No plugins = No Next.js dependencies crashing the script
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const generateEmbedding = async (text: string) => {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small", // cost/performance optimized model
        input: text.replace(/\n/g, " "), // Clean text for better results
    });

    return response.data[0].embedding;
};

const saveEmbeddingsToDisk = (updatedData: typeof data) => {
    const filePath = path.join(process.cwd(), "src/db/seed/data.json");
    try {
        fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
        console.log("💾 Updated data.json with new embeddings.");
    } catch (error) {
        console.error("❌ Failed to write to data.json:", error);
    }
};

async function clearDatabase() {
    console.log("🗑️  Emptying existing data...");
    // We use CASCADE to wipe everything cleanly
    await db.execute(
        sql`TRUNCATE TABLE "orders", "messages", "items", "account", "session", "user" RESTART IDENTITY CASCADE;`,
    );
}

// 6. MAIN EXECUTION
async function main() {
    console.log("🚀 Starting database seed...");
    console.log(
        `🎯 Target Database: ${process.env.DATABASE_URL?.includes("neon") ? "Neon Cloud ☁️" : "Local Docker 🐳"}`,
    );

    let dataModified = false;

    try {
        await clearDatabase();

        // --- Seed Users (Using Isolated Auth) ---
        console.log("👤 Creating users...");
        const userMap: Record<string, string> = {};

        for (const u of data.users) {
            try {
                // We use our local 'seedAuth' instance, not the global one
                const res = await seedAuth.api.signUpEmail({
                    body: {
                        email: u.email,
                        password: u.password,
                        name: u.name,
                        image: u.image,
                    },
                });

                if (res?.user?.id) {
                    userMap[u.id] = res.user.id;

                    // Manually update extra fields that Auth doesn't handle
                    await db
                        .update(schema.user)
                        .set({
                            cryptoWalletAddress: u.cryptoWalletAddress,
                            stripeCustomerId: u.stripeCustomerId,
                            savedCardBrand: u.savedCardBrand,
                            savedCardLast4: u.savedCardLast4,
                        })
                        .where(eq(schema.user.id, res.user.id));
                }
            } catch (err) {
                console.warn(`⚠️  Failed to create user ${u.email}:`, err);
            }
        }

        // --- Seed Items ---
        console.log("📦 Seeding items...");

        // (Optional) Verify vector extension exists before inserting vectors
        try {
            await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`);
        } catch (e) {
            console.warn(
                "⚠️  Could not enable vector extension. Ignoring if already enabled.",
            );
        }

        const itemMap: Record<string, string> = {};

        for (const item of data.items) {
            const currentItem = item as any;

            // 1. Embedding Logic
            if (!currentItem.embedding || currentItem.embedding.length === 0) {
                console.log(
                    `   ✨ Generating NEW embedding for: "${item.title}"`,
                );
                const textToEmbed = `${item.title} ${item.description}`;

                try {
                    const embedding = await generateEmbedding(textToEmbed);
                    currentItem.embedding = embedding;
                    dataModified = true;
                } catch (error) {
                    console.error(
                        `   ❌ API Error for "${item.title}". Using zero-vector.`,
                    );
                    currentItem.embedding = new Array(1536).fill(0);
                }
            } else {
                console.log(
                    `   ⏩ Using CACHED embedding for: "${item.title}"`,
                );
            }

            // 2. DB Insertion
            // Ensure we have a valid seller ID mapped
            if (!userMap[item.sellerId]) {
                console.error(
                    `❌ Skipping item "${item.title}": Seller ID ${item.sellerId} not found in user map.`,
                );
                continue;
            }

            const [insertedItem] = await db
                .insert(schema.items)
                .values({
                    sellerId: userMap[item.sellerId],
                    title: item.title,
                    description: item.description,
                    price: item.price as string,
                    condition: item.condition as any,
                    status: item.status as any,
                    images: item.images,
                    embedding: currentItem.embedding,
                })
                .returning({ id: schema.items.id });

            itemMap[item.id] = insertedItem.id;
        }

        // --- Save Cache ---
        if (dataModified) {
            saveEmbeddingsToDisk(data);
        }

        // --- Cleanup ---
        // We remove sessions created during seeding so the database is clean
        await db.delete(schema.session);

        console.log("✅ Seed completed successfully!");
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
