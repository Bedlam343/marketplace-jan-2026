import { getItems } from "@/data/items";
import MarketplaceTestClient from "@/components/marketplace-test-client";
import { ItemFilters } from "@/db/validation";

// Next.js standard type for searchParams
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function MarketplaceTestPage(props: {
    searchParams: SearchParams;
}) {
    const params = await props.searchParams;

    // 1. Parse URL params into our Filter type
    // This ensures that if a user shares a link (e.g. ?search=camera),
    // the initial load respects it.
    const filters: ItemFilters = {
        page: 1, // Default start page
        limit: 12,
        search: typeof params.search === "string" ? params.search : undefined,
        condition:
            typeof params.condition === "string"
                ? (params.condition as any)
                : undefined,
        minPrice: Number(params.minPrice) || undefined,
        maxPrice: Number(params.maxPrice) || undefined,
    };

    // 2. Fetch Data (Directly from Data Layer)
    const { data } = await getItems(filters);

    // 3. Render Client Component
    return <MarketplaceTestClient initialData={data} />;
}
