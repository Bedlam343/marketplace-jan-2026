"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { authClient, betterAuthErrorCodes } from "@/lib/auth-client";
import {
    loginSchema,
    insertUserSchema,
    LoginFieldErrors,
    SignupFieldErrors,
} from "@/db/validation";

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
            errors: validationFields.error.flatten().fieldErrors,
        };
    }

    const { name, email, password } = validationFields.data;

    const { error } = await authClient.signUp.email({
        email,
        password,
        name,
    });

    if (error) {
        if (
            error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" ||
            error.status === 422
        ) {
            return {
                success: false,
                errors: {
                    // Use the message from our centralized mapping
                    email: [
                        betterAuthErrorCodes
                            .USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL.message,
                    ],
                },
            };
        }

        return {
            success: false,
            message: error.message || "Signup failed.",
        };
    }

    redirect("/dashboard");
};

export const logoutAction = async () => {
    await authClient.signOut();
    revalidatePath("/");
    redirect("/login");
};
