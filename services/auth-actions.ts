"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { authClient, betterAuthErrorCodes } from "@/lib/auth-client";
import {
    loginSchema,
    insertUserSchema,
    LoginFieldErrors,
    SignupFieldErrors,
} from "@/db/validation";
import { APIError } from "better-auth";

export type LoginActionResponse = {
    success?: boolean;
    message?: string;
    errors?: LoginFieldErrors;
};

export type SignupActionResponse = {
    success?: boolean;
    message?: string;
    errors?: SignupFieldErrors;
};

export const loginAction = async (
    prevState: LoginActionResponse | undefined,
    formData: FormData
): Promise<LoginActionResponse> => {
    const rawData = Object.fromEntries(formData.entries());

    const validationFields = loginSchema.safeParse(rawData);
    if (!validationFields.success) {
        return {
            success: false,
            errors: validationFields.error.flatten().fieldErrors,
        };
    }

    const { email, password } = validationFields.data;

    const { error } = await authClient.signIn.email({
        email,
        password,
    });

    if (error) {
        // Use the centralized mapping for a clean, consistent message
        const customError =
            betterAuthErrorCodes[
                error.code as keyof typeof betterAuthErrorCodes
            ];

        return {
            success: false,
            message: customError?.message || error.message || "Login failed.",
        };
    }

    redirect("/dashboard");
};

export const signupAction = async (
    prevState: SignupActionResponse | undefined,
    formData: FormData
): Promise<SignupActionResponse> => {
    const rawData = Object.fromEntries(formData.entries());

    const validationFields = insertUserSchema.safeParse(rawData);
    if (!validationFields.success) {
        return {
            success: false,
            errors: z.flattenError(validationFields.error).fieldErrors,
        };
    }

    const { name, email, password } = validationFields.data;

    try {
        await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
            },
        });
    } catch (error) {
        console.error("Signup error:", error);

        if (error instanceof APIError) {
            const code = error.body?.code || error.status.toString();

            if (
                code === "USER_ALREADY_EXISTS" ||
                code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
            ) {
                return {
                    success: false,
                    errors: {
                        email: [
                            betterAuthErrorCodes
                                .USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL.message,
                        ],
                    },
                };
            }

            if (code === "PASSWORD_TOO_SHORT") {
                return {
                    success: false,
                    errors: {
                        password: [
                            betterAuthErrorCodes.PASSWORD_TOO_SHORT.message,
                        ],
                    },
                };
            }

            return {
                success: false,
                message:
                    error.message || "Something went wrong. Please try again.",
            };
        }

        return {
            success: false,
            message: "An unexpected error occurred. Please try again.",
        };
    }

    redirect("/dashboard");
};

export const logoutAction = async () => {
    await authClient.signOut();
    revalidatePath("/");
    redirect("/login");
};
