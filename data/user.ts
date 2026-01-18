import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getBuyer(userId: string) {
    return await db.query.user.findFirst({
        where: eq(user.id, userId),
    });
}

export type Buyer = Awaited<ReturnType<typeof getBuyer>>;
export type NonNullBuyer = NonNullable<Buyer>;
