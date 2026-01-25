export function SearchSkeleton() {
    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Mobile Toggle Skeleton */}
                    <div className="lg:hidden mb-4">
                        <div className="h-10 w-full bg-muted/50 rounded-lg animate-pulse" />
                    </div>

                    {/* Sidebar Skeleton */}
                    <aside className="hidden lg:block lg:w-64 flex-shrink-0 space-y-8">
                        <div className="sticky top-24 space-y-6">
                            {/* Header */}
                            <div className="flex justify-between items-center">
                                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                                <div className="h-3 w-10 bg-muted rounded animate-pulse" />
                            </div>

                            {/* Keywords Input */}
                            <div className="space-y-3">
                                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                                <div className="h-10 w-full bg-muted/50 rounded-lg animate-pulse" />
                            </div>

                            {/* Price Inputs */}
                            <div className="space-y-3">
                                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="h-10 w-full bg-muted/50 rounded-lg animate-pulse" />
                                    <div className="h-10 w-full bg-muted/50 rounded-lg animate-pulse" />
                                </div>
                            </div>

                            {/* Condition Select */}
                            <div className="space-y-3">
                                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                                <div className="h-10 w-full bg-muted/50 rounded-lg animate-pulse" />
                            </div>
                        </div>
                    </aside>

                    {/* Main Grid Skeleton */}
                    <div className="flex-1">
                        {/* Results Header */}
                        <div className="mb-6 flex items-center justify-between">
                            <div className="h-7 w-48 bg-muted rounded animate-pulse" />
                            <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                        </div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-full flex flex-col bg-card border border-border rounded-xl overflow-hidden"
                                >
                                    {/* Image Placeholder */}
                                    <div className="relative aspect-[4/3] bg-muted animate-pulse">
                                        <div className="absolute bottom-3 left-3 h-6 w-16 bg-background/50 rounded-full" />
                                    </div>

                                    {/* Body Placeholder */}
                                    <div className="p-4 flex flex-col flex-1 space-y-4">
                                        {/* Title */}
                                        <div className="space-y-2">
                                            <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                                            <div className="h-4 w-1/4 bg-muted/50 rounded animate-pulse" />
                                        </div>

                                        {/* Price & Condition */}
                                        <div className="flex gap-2">
                                            <div className="h-6 w-24 bg-muted rounded animate-pulse" />
                                        </div>

                                        {/* Footer: Seller & Time */}
                                        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-muted animate-pulse" />
                                                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                                            </div>
                                            <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
