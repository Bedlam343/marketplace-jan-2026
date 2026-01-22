import { redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { ArrowLeft, ShoppingBag } from "lucide-react";

import { auth } from "@/lib/auth";
import { getOrders } from "@/data/orders";
import HistoryList from "@/components/history/HistoryList";
import PaginationControl from "@/components/ui/PaginationControl";

export const metadata = {
    title: "Purchase History | Marketplace",
};

export default async function PurchaseHistoryPage({
    searchParams,
}: {
    searchParams: { page?: string };
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) return redirect("/login");

    const page = Number(searchParams.page) || 1;

    // Fetch only "buyer" role orders
    const { data: orders, pagination } = await getOrders(
        session.user.id,
        "buyer",
        page,
    );

    return (
        <div className="min-h-screen bg-background font-sans text-foreground py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-left-4 duration-500">
                    <Link
                        href="/dashboard"
                        className="p-2 -ml-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <ShoppingBag className="w-6 h-6 text-primary" />
                            Purchase History
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            View and manage your past orders
                        </p>
                    </div>
                </div>

                {/* Content State */}
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-2xl bg-card animate-in zoom-in-95 duration-500">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <ShoppingBag className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <h2 className="text-lg font-medium text-foreground">
                            No purchases yet
                        </h2>
                        <p className="text-muted-foreground text-sm mb-6 max-w-sm text-center">
                            You haven&apos;t bought anything yet. Explore the
                            marketplace to find unique items.
                        </p>
                        <Link
                            href="/search"
                            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                        >
                            Browse Marketplace
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <HistoryList orders={orders} />

                        <div className="border-t border-border pt-4">
                            <PaginationControl
                                currentPage={pagination.currentPage}
                                totalPages={pagination.pages}
                                baseUrl="/history"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
