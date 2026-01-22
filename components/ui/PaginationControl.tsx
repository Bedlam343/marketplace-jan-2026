"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginationControl({
    currentPage,
    totalPages,
    baseUrl,
}: {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
}) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-4 py-4 mt-4">
            <Link
                href={`${baseUrl}?page=${currentPage - 1}`}
                className={`p-2 rounded-lg border border-border transition-colors ${
                    currentPage <= 1
                        ? "pointer-events-none opacity-50 bg-muted"
                        : "hover:bg-muted bg-card"
                }`}
            >
                <ChevronLeft className="w-5 h-5" />
            </Link>

            <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
            </span>

            <Link
                href={`${baseUrl}?page=${currentPage + 1}`}
                className={`p-2 rounded-lg border border-border transition-colors ${
                    currentPage >= totalPages
                        ? "pointer-events-none opacity-50 bg-muted"
                        : "hover:bg-muted bg-card"
                }`}
            >
                <ChevronRight className="w-5 h-5" />
            </Link>
        </div>
    );
}
