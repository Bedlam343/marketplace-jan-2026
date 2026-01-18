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
) {}
