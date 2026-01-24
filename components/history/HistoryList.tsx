"use client";

import { type OrderWithDetails } from "@/data/orders";
import { Package, CreditCard, Wallet, ExternalLink, User } from "lucide-react";
import Image from "next/image";

export default function HistoryList({
    orders,
}: {
    orders: OrderWithDetails[];
}) {
    return (
        <div className="grid gap-4">
            {orders.map((order) => {
                const isCrypto = order.payment.method === "crypto";

                return (
                    <div
                        key={order.id}
                        className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6"
                    >
                        {/* Image Section */}
                        <div className="w-full md:w-24 h-24 bg-muted rounded-lg border border-border overflow-hidden shrink-0 relative">
                            {order.item?.image ? (
                                <Image
                                    src={order.item.image}
                                    alt={order.item.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <Package className="w-8 h-8" />
                                </div>
                            )}
                        </div>

                        {/* Main Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    {/* Status Badge */}
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide mb-2 ${
                                            order.status === "completed"
                                                ? "bg-green-500/10 text-green-600"
                                                : order.status === "pending"
                                                  ? "bg-amber-500/10 text-amber-600"
                                                  : "bg-slate-500/10 text-slate-600"
                                        }`}
                                    >
                                        {order.status}
                                    </span>

                                    <h3 className="font-bold text-lg text-foreground truncate">
                                        {order.item?.title || "Unknown Item"}
                                    </h3>
                                </div>

                                <div className="text-right shrink-0">
                                    {isCrypto &&
                                    order.payment.amountPaidCrypto ? (
                                        <>
                                            <div className="text-xl font-black text-foreground flex items-center justify-end gap-1">
                                                {order.payment.amountPaidCrypto}
                                                <span className="text-sm font-bold text-muted-foreground">
                                                    ETH
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                ≈ ${order.payment.amountPaidUsd}{" "}
                                                USD
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-xl font-bold text-foreground">
                                            ${order.payment.amountPaidUsd}
                                        </div>
                                    )}

                                    <div className="text-xs text-muted-foreground mt-1">
                                        {new Date(
                                            order.createdAt,
                                        ).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                {/* Seller Info */}
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>
                                        Seller:{" "}
                                        <span className="text-foreground font-medium">
                                            {order.counterparty?.name ||
                                                "Unknown"}
                                        </span>
                                    </span>
                                </div>

                                <div className="w-px h-4 bg-border hidden md:block" />

                                {/* Payment Method */}
                                <div className="flex items-center gap-2">
                                    {isCrypto ? (
                                        <Wallet className="w-4 h-4" />
                                    ) : (
                                        <CreditCard className="w-4 h-4" />
                                    )}
                                    <span>
                                        {isCrypto
                                            ? "Crypto (ETH)"
                                            : order.payment.cardBrand
                                              ? `${order.payment.cardBrand.toUpperCase()} •••• ${
                                                    order.payment.cardLast4
                                                }`
                                              : "Card"}
                                    </span>
                                </div>

                                {/* Crypto Explorer Link */}
                                {isCrypto && order.payment.txHash && (
                                    <a
                                        href={`https://sepolia.etherscan.io/tx/${order.payment.txHash}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1 text-primary hover:underline ml-auto md:ml-0"
                                    >
                                        Explorer{" "}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
