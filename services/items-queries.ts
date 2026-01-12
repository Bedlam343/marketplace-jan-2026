"use server";

import { getItems, GetItemResult } from "@/data/items";
import { ItemFilters } from "@/db/validation";

export type GetItemsActionResponse = {
    success: boolean;
    result?: GetItemResult;
    error?: string;
};

export const getItemsAction = async (
    filters: ItemFilters
): Promise<GetItemsActionResponse> => {
    try {
        const result = await getItems(filters);
        return {
            success: true,
            result,
        };
    } catch (error) {
        console.error("Server action error fetching items:", error);
        return {
            success: false,
            error: "Failed to fetch items.",
        };
    }
};
