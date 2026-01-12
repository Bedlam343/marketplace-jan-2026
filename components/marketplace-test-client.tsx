"use client";

import { useState } from "react";
import { getItemsAction } from "@/services/items-queries";
import { ItemWithSeller } from "@/data/items";
import { ItemFilters } from "@/db/validation";

interface Props {
    initialData: ItemWithSeller[];
}

type FilterFormState = {
    [K in keyof ItemFilters]: string;
};

export default function MarketplaceTestClient({ initialData }: Props) {
    const [items, setItems] = useState<ItemWithSeller[]>(initialData);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState<FilterFormState>({
        search: "",
        minPrice: "",
        maxPrice: "",
        condition: "",
        page: "1",
        limit: "12",
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const response = await getItemsAction({
            search: filters.search || undefined,
            minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
            maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
            condition: (filters.condition as any) || undefined,
            page: 1,
            limit: 12,
        });

        if (response.success && response.result) {
            setItems(response.result.data);
        } else {
            alert("Failed to fetch items");
        }

        setLoading(false);
    }

    // Consistent Tailwind class for all input fields
    const inputClasses =
        "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black";

    return (
        <div className="max-w-7xl mx-auto p-8 font-sans bg-white min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900">
                    Marketplace
                </h1>
                <p className="text-slate-500">
                    Discover unique items with semantic search.
                </p>
            </header>

            {/* --- Visual Contrast Improvements Here --- */}
            <section className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-10 shadow-sm">
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6"
                >
                    <div className="flex flex-col">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. 'comfy seating'"
                            className={inputClasses}
                            value={filters.search}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    search: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            Condition
                        </label>
                        <select
                            className={inputClasses}
                            value={filters.condition}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    condition: e.target.value,
                                })
                            }
                        >
                            <option value="">All Conditions</option>
                            <option value="new">New</option>
                            <option value="like-new">Like New</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            Min Price
                        </label>
                        <input
                            type="number"
                            placeholder="Min"
                            className={inputClasses}
                            value={filters.minPrice}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    minPrice: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            Max Price
                        </label>
                        <input
                            type="number"
                            placeholder="Max"
                            className={inputClasses}
                            value={filters.maxPrice}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    maxPrice: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="md:col-span-4 flex items-center justify-between pt-4 border-t border-slate-200">
                        <span className="text-sm text-slate-500">
                            {items.length} results found
                        </span>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-black text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-slate-800 transition-all disabled:opacity-50 active:scale-95 shadow-md"
                        >
                            {loading ? "Searching..." : "Apply Filters"}
                        </button>
                    </div>
                </form>
            </section>

            {/* --- Results Grid --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {items.map((item) => (
                    <div key={item.id} className="group cursor-pointer">
                        <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden mb-3 relative border border-slate-100 shadow-sm transition-transform group-hover:shadow-lg">
                            {item.images[0] ? (
                                <img
                                    src={item.images[0]}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    No Image
                                </div>
                            )}
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 text-sm font-bold rounded-full shadow-sm">
                                ${item.price}
                            </div>
                        </div>

                        <div className="px-1">
                            <h3 className="font-semibold text-slate-900 group-hover:text-black transition-colors">
                                {item.title}
                            </h3>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-tighter">
                                    {item.condition}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    {item.seller?.image && (
                                        <img
                                            src={item.seller.image}
                                            className="w-5 h-5 rounded-full border border-slate-200"
                                        />
                                    )}
                                    <span className="text-xs text-slate-600 font-medium">
                                        {item.seller?.name || "Private Seller"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {items.length === 0 && !loading && (
                <div className="py-20 text-center">
                    <div className="text-slate-300 text-6xl mb-4">☹️</div>
                    <p className="text-slate-500 font-medium">
                        No items matched your search criteria.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-black underline text-sm mt-2 hover:text-slate-600"
                    >
                        Reset all filters
                    </button>
                </div>
            )}
        </div>
    );
}
