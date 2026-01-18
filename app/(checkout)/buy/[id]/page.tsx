import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { getItemById } from "@/data/items";
import { getBuyer, type Buyer } from "@/data/user";
import BuyItem from "@/components/buy/BuyItem";
import { headers } from "next/headers";

export default async function CheckoutPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: itemId } = await params;

    // Auth check
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        redirect(`/login?callbackUrl=/buy/${itemId}`);
    }

    const [item, buyer] = await Promise.all([
        getItemById(itemId),
        getBuyer(session.user.id),
    ]);

    if (!item) {
        notFound();
    }

    // theoretically should never happen if session exists
    if (!buyer) {
        redirect("/login");
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BuyItem item={item} buyer={buyer} />
        </main>
    );
}
