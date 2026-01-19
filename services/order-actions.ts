"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { orders, items } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
    CreateCryptoOrderSchema,
    CreateCardOrderSchema,
    type CreateCryptoOrderInput,
    type CreateCardOrderInput,
} from "@/db/validation";

// internal helper function
async function finalizeOrder(
    order: CreateCryptoOrderInput | CreateCardOrderInput,
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized. Please log in to complete purchase.");
    }

    if (order.buyerId !== session.user.id) {
        console.log("Buyer ID mismatch", order.buyerId, session.user.id);
        throw new Error(
            "Unauthorized. You are not authorized to complete this purchase.",
        );
    }

    // create webhook listener instead...
}
