import { notFound } from "next/navigation";
import { getItemById } from "@/data/items";
import BuyItem from "@/components/buy/BuyItem";

export default async function CheckoutPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const item = await getItemById(id);

    if (!item) {
        notFound();
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BuyItem item={item} />
        </main>
    );
}
