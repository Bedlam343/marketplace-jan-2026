import { desc, eq, count } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { orders, items, user } from "@/db/schema";
import { ORDER_LIMIT_DEFAULT, ORDER_LIMIT_MAX } from "@/utils/constants";

export type OrderRole = "buyer" | "seller";

export async function getOrders(
    userId: string,
    role: OrderRole,
    page = 1,
    limit = ORDER_LIMIT_DEFAULT,
) {
    const numOrders = Math.min(limit, ORDER_LIMIT_MAX);
    const offset = (page - 1) * numOrders;

    const whereCondition =
        role === "buyer"
            ? eq(orders.buyerId, userId)
            : eq(orders.sellerId, userId);

    // We need to join the 'user' table to get the name of the OTHER person.
    // We use an alias to avoid confusion with the logged-in user.
    const counterparty = alias(user, "counterparty");

    const counterpartyJoinId =
        role === "buyer" ? orders.sellerId : orders.buyerId;

    const [totalResult, rows] = await Promise.all([
        // Query A: Total Count
        db.select({ count: count() }).from(orders).where(whereCondition),
        // Query B: The Data
        db
            .select({
                id: orders.id,
                status: orders.status,
                createdAt: orders.createdAt,
                payment: {
                    amountPaidUsd: orders.amountPaidUsd,
                    amountPaidCrypto: orders.amountPaidCrypto,
                    method: orders.paymentMethod,
                    txHash: orders.txHash,
                    walletAddress: orders.walletAddress,
                    stripePaymentIntentId: orders.stripePaymentIntentId,
                    cardBrand: orders.cardBrand,
                    cardLast4: orders.cardLast4,
                },
                // Item Details (Snapshot)
                item: {
                    id: items.id,
                    title: items.title,
                    image: items.images, // We'll take the first one in the UI
                },
                // The "Other Person" involved in the trade
                counterparty: {
                    name: counterparty.name,
                    image: counterparty.image,
                    email: counterparty.email,
                },
            })
            .from(orders)
            .leftJoin(items, eq(orders.itemId, items.id))
            .leftJoin(counterparty, eq(counterpartyJoinId, counterparty.id))
            .where(whereCondition)
            .limit(numOrders)
            .offset(offset)
            .orderBy(desc(orders.createdAt)),
    ]);

    return {
        data: rows,
        pagination: {
            total: totalResult[0].count,
            pages: Math.ceil(totalResult[0].count / limit),
            currentPage: page,
        },
    };
}

export type GetOrdersResult = Awaited<ReturnType<typeof getOrders>>;
export type OrderWithDetails = GetOrdersResult["data"][number];
