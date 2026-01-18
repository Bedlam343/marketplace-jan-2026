import { loadEnvConfig } from "@next/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../schema";
import data from "./data.json";
import { auth } from "@/lib/auth";
import { sql, eq } from "drizzle-orm"; // Added 'eq'

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

const generateDummyVector = () =>
    Array.from({ length: 1536 }, () => Math.random());

async function clearDatabase() {
    console.log("🗑️  Emptying existing data...");
    // Include all new tables in the truncate
    await db.execute(
        sql`TRUNCATE TABLE "orders", "messages", "items", "account", "session", "user" RESTART IDENTITY CASCADE;`,
    );
}

async function main() {
    console.log("🚀 Starting database seed...");

    try {
        await clearDatabase();

        // --- 1. Seed Users ---
        console.log("👤 Creating users...");
        const userMap: Record<string, string> = {};

        for (const u of data.users) {
            try {
                // 1. Create the Auth User
                const res = await auth.api.signUpEmail({
                    body: {
                        email: u.email,
                        password: u.password,
                        name: u.name,
                        image: u.image,
                    },
                });

                if (res?.user?.id) {
                    userMap[u.id] = res.user.id;

                    // 2. UPDATE the user with the Custom Fields (Wallet & Stripe)
                    // We do this immediately after creation
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

        // --- 2. Seed Items ---
        console.log("📦 Seeding items...");
        const itemMap: Record<string, string> = {};

        for (const item of data.items) {
            const [insertedItem] = await db
                .insert(schema.items)
                .values({
                    sellerId: userMap[item.sellerId],
                    title: item.title,
                    description: item.description,
                    price: item.price,
                    condition: item.condition as any,
                    status: item.status as any,
                    images: item.images,
                    embedding: generateDummyVector(),
                })
                .returning({ id: schema.items.id });

            itemMap[item.id] = insertedItem.id;
        }

        // --- 3. Seed Orders ---
        // console.log("💰 Seeding orders...");
        // if (data.orders && data.orders.length > 0) {
        //     await db.insert(schema.orders).values(
        //         data.orders.map((order) => ({
        //             itemId: itemMap[order.itemId],
        //             buyerId: userMap[order.buyerId],
        //             sellerId: userMap[order.sellerId],

        //             // Pricing
        //             amountPaidUsd: order.amountPaidUsd,
        //             amountPaidCrypto: order.amountPaidCrypto,

        //             // Payment Tracking
        //             paymentMethod: order.paymentMethod as any,
        //             status: order.status as any,

        //             // Crypto details (optional in JSON, so we rely on TS undefined)
        //             txHash: order.txHash,
        //             chainId: order.chainId,
        //             walletAddress: order.walletAddress,

        //             // Card details
        //             stripePaymentIntentId: order.stripePaymentIntentId,
        //             cardBrand: order.cardBrand,
        //             cardLast4: order.cardLast4,
        //         })),
        //     );
        // }

        // --- Cleanup ---
        console.log("🧹 Cleaning up seeder sessions...");
        await db.delete(schema.session);

        console.log("✅ Seed completed successfully!");
        console.log(`   - Users created: ${Object.keys(userMap).length}`);
        console.log(`   - Items created: ${Object.keys(itemMap).length}`);
        console.log(`   - Orders created: ${data.orders.length}`);
    } catch (error) {
        console.error("❌ Seed failed:", error);
    } finally {
        await pool.end();
    }
}

main();
