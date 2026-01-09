"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { type ResponseContext } from "better-auth/react";
import { revalidatePath } from "next/cache";

import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/db/validation";

type LoginFieldErrors = ReturnType<typeof z.flattenError>["fieldErrors"];

export type LoginActionResponse = {
    success?: boolean;
    message?: string;
    errors?: LoginFieldErrors;
};

// 'prevState' required when using useActionState hook in the frontend
export const loginAction = async (
    prevState: LoginActionResponse | undefined,
    formData: FormData
): Promise<LoginActionResponse> => {
    const rawData = Object.fromEntries(formData.entries());

    const validationFields = loginSchema.safeParse(rawData);
    if (!validationFields.success) {
        const flattenedErrors = z.flattenError(validationFields.error);
        return {
            success: false,
            errors: flattenedErrors.fieldErrors,
        };
    }

    const { email, password } = validationFields.data;

    // call Better Auth
    const { data, error } = await authClient.signIn.email({
        email,
        password,
        // prevents Better Auth from handling redirects automatically
        fetchOptions: {
            onResponse: (context: ResponseContext) => {
                // can intercept the response here if needed
            },
        },
    });

    if (error) {
        console.error("Login error:", error);
        return {
            success: false,
            message: error.message || "Something went wrong during login.",
        };
    }

    // must be outside try/catch because redirect throws an internal error
    // that Next.js automatically handles
    redirect("/dashboard");
};

export const logoutAction = async () => {
    await authClient.signOut();

    // tell Next.js the data on the current page is now stale
    revalidatePath("/");

    redirect("/login");
};
