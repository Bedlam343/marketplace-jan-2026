"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { authenticatedAction } from "@/lib/safe-action";
import { db } from "@/db";
import { items } from "@/db/schema";
import { insertItemSchema, CreateItemFieldErrors } from "@/db/validation";

export type CreateItemActionResponse = {
    success?: boolean;
    message?: string;
    errors?: CreateItemFieldErrors;
};

export const createItemAction = async (
    prevState: CreateItemActionResponse | undefined,
    formData: FormData
): Promise<CreateItemActionResponse> => {
    return authenticatedAction(formData, async (data, session) => {
        // The frontend loop must append them like: formData.append('images', url1); formData.append('images', url2);
        const imageUrls = data.getAll("images") as string[];

        const rawData = {
            title: data.get("title"),
            description: data.get("description"),
            price: data.get("price"),
            condition: data.get("condition"),
            images: imageUrls.length > 0 ? imageUrls : [], // Pass empty array if none
        } as const;

        const validationFields = insertItemSchema.safeParse(rawData);
        if (!validationFields.success) {
            return {
                success: false,
                errors: z.flattenError(validationFields.error).fieldErrors,
            };
        }

        try {
            await db.insert(items).values({
                ...validationFields.data,
                sellerId: session.user.id,
            });
        } catch (error) {
            return {
                success: false,
                message: "An error occurred while creating the item.",
            };
        }

        // **TEMPORARY
        revalidatePath("/dashboard");
        redirect("/dashboard");
    });
};
