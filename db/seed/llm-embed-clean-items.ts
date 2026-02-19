import { loadEnvConfig } from "@next/env";
const projectDir = process.cwd();
loadEnvConfig(projectDir);

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, isNull } from "drizzle-orm";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

import * as schema from "../schema";

if (!process.env.DATABASE_URL || !process.env.OPENAI_API_KEY) {
    throw new Error("DATABASE_URL or OPENAI_API_KEY is missing.");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : false,
    max: 1,
});

const db = drizzle(pool, { schema });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateListingDetails = async (rawTitle: string) => {
    const prompt = `You are helping to create realistic listings for a local peer-to-peer marketplace. 
    Here is a raw, SEO-stuffed product title: "${rawTitle}"
    
    Tasks:
    1. Extract a short, natural-sounding title a normal human would use (maximum 5-6 words). Example: "Apple iPhone 13 Pro Max" or "Vintage Cast Iron Skillet".
    2. Write a 2-sentence casual description as if you are clearing out your closet or garage. Do not sound like a marketer.
    
    Respond STRICTLY in JSON format with the keys "title" and "description".`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || "{}";

    try {
        const parsed = JSON.parse(content);
        return {
            title: parsed.title || rawTitle.substring(0, 40) + "...",
            description:
                parsed.description ||
                "Selling this item locally. Let me know if you are interested!",
        };
    } catch (e) {
        return {
            title: rawTitle.substring(0, 40) + "...",
            description:
                "Selling this item locally. Let me know if you are interested!",
        };
    }
};

const generateEmbedding = async (text: string) => {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text.replace(/\n/g, " "),
    });
    return response.data[0].embedding;
};

async function main() {
    console.log("🚀 Starting Stage 2: AI Transformation & Embeddings...");

    try {
        // Fetch all items from the database to ensure we are working with the source of truth
        const allItems = await db.select().from(schema.items);
        console.log(`📊 Found ${allItems.length} total items in the database.`);

        let processedCount = 0;
        let skippedCount = 0;

        for (let i = 0; i < allItems.length; i++) {
            const item = allItems[i];

            // Safety Check: Skip if the item already has an embedding
            if (item.embedding && item.embedding.length > 0) {
                console.log(
                    ` ⏩ [${i + 1}/${allItems.length}] Skipping: Already processed (${item.title.substring(0, 20)}...)`,
                );
                skippedCount++;
                continue;
            }

            console.log(
                ` ✨ [${i + 1}/${allItems.length}] Processing: ${item.title.substring(0, 40)}...`,
            );

            try {
                // 1. Generate Clean Title & Description
                const details = await generateListingDetails(item.title);

                // 2. Generate Vector Embedding
                const embedding = await generateEmbedding(
                    `${details.title} ${details.description}`,
                );

                // 3. Update the Database Row immediately
                await db
                    .update(schema.items)
                    .set({
                        title: details.title,
                        description: details.description,
                        embedding: embedding,
                    })
                    .where(eq(schema.items.id, item.id));

                console.log(` ✅ Successfully updated item in DB.`);
                processedCount++;

                // Small delay to prevent hitting OpenAI's rate limits (HTTP 429)
                await sleep(500);
            } catch (error) {
                console.error(
                    ` ❌ Failed to process item ${item.id}. Moving to next...`,
                    error,
                );
                // Script continues to the next item so a single failure doesn't ruin the batch
            }
        }

        console.log(`\n🎉 Transformation Complete!`);
        console.log(`   - Processed & Updated: ${processedCount}`);
        console.log(`   - Skipped (Already Done): ${skippedCount}`);

        // Final Step: Dump the updated database back to items.json to keep files perfectly in sync
        console.log(`💾 Syncing final database state to items.json...`);
        const finalItems = await db.select().from(schema.items);
        const itemsFilePath = path.join(__dirname, "items.json");
        fs.writeFileSync(itemsFilePath, JSON.stringify(finalItems, null, 2));
        console.log(`✅ items.json updated with ${finalItems.length} items.`);
    } catch (error) {
        console.error("❌ Fatal Script Error:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
