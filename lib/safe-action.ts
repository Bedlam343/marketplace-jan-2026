// wrapped that protects routes or actions that require authentication

"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type AuthenticatedActionLogic<T, R> = (
    data: T,
    session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>
) => Promise<R>;

export async function authenticatedAction<T, R>(
    data: T,
    logic: AuthenticatedActionLogic<T, R>
): Promise<R | { success: false; message: string }> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return { success: false, message: "Unauthorized. Please log in." };
    }

    return logic(data, session);
}
