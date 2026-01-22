import { eq, sql, count } from "drizzle-orm";
import { db } from "@/db";
import { orders, user } from "@/db/schema";
import { getItems } from "@/data/items";
import { getOrders } from "@/data/orders";

export async function getDashboardData(userId: string) {
    const [userResult, activeListings, recentSales, recentPurchases, stats] =
        await Promise.all([
            db
                .select({
                    name: user.name,
                    image: user.image,
                    email: user.email,
                    joinedAt: user.createdAt,
                })
                .from(user)
                .where(eq(user.id, userId))
                .then((res) => res[0]),

            getItems({ sellerId: userId, limit: 5, page: 1 }),

            getOrders(userId, "seller", 1, 5),

            getOrders(userId, "buyer", 1, 5),

            db
                .select({
                    totalRevenue: sql<string>`coalesce(sum(${orders.amountPaidUsd}), 0)`,
                    totalSalesCount: count(),
                })
                .from(orders)
                .where(eq(orders.sellerId, userId))
                .then((res) => res[0]),
        ]);

    return {
        user: userResult,
        selling: {
            stats: {
                revenue: Number(stats?.totalRevenue || 0),
                ordersCount: Number(stats?.totalSalesCount || 0),
                activeListingCount: activeListings.pagination.total,
            },
            recentListings: activeListings.data,
            recentSales: recentSales.data,
        },
        buying: {
            recentOrders: recentPurchases.data,
            totalOrdersCount: recentPurchases.pagination.total,
        },
    };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
