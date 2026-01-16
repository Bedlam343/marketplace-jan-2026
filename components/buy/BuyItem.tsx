"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Image from "next/image";
import {
    CreditCard,
    Wallet,
    ShieldCheck,
    Loader2,
    CheckCircle,
    ChevronRight,
} from "lucide-react";

import { createThirdwebClient, prepareTransaction, toWei } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import {
    ConnectButton,
    useActiveAccount,
    useSendTransaction,
} from "thirdweb/react";

import { ItemWithSeller, ItemWithSellerWallet } from "@/data/items";
import { getEthPriceInUsd } from "@/utils/helpers";

const client = createThirdwebClient({ clientId: "YOUR_CLIENT_ID_HERE" });

// Sepolia Testnet
const chain = defineChain(11155111);

export default function BuyItem({ item }: { item: ItemWithSellerWallet }) {
    const router = useRouter();
    const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto">(
        "card",
    );
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // web3 hooks
    const account = useActiveAccount();
    const { mutate: sendTransaction, isPending: isTxPending } =
        useSendTransaction();

    const handleCardPayment = async (e: FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsProcessing(false);
        setIsSuccess(true);
    };

    const handleCryptoPayment = () => {
        if (!account) {
            alert("Please connect your wallet first");
            return;
        }

        const transaction = prepareTransaction({
            to: item.seller?.cryptoWalletAddress!,
            chain: chain,
            client: client,
            // doesn't price need to be in crypto instead of usd?
            value: toWei(item.price.toString()),
        });

        sendTransaction(transaction, {
            onSuccess: () => setIsSuccess(true),
            onError: (error) => {
                console.error("Tx Failed", error);
                alert("Transaction Failed. Check console.");
            },
        });
    };

    if (isSuccess) {
        return null;
        // <SuccessView router={router} /> ??
    }

    return (
        // Base Background: Slate 950
        <div className="min-h-screen bg-background text-foreground py-12 font-sans">
            <div className="max-w-5xl mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* LEFT COL: PAYMENT FORMS */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Payment Method Toggle (Card: Slate 900) */}
                        <div className="bg-card p-1 rounded-xl border border-border flex shadow-sm">
                            <button
                                onClick={() => setPaymentMethod("card")}
                                className={`flex-1 py-3 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
                                    paymentMethod === "card"
                                        ? "bg-primary text-primary-foreground shadow-md font-bold" // Teal + Dark Text
                                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                }`}
                            >
                                <CreditCard className="w-4 h-4" />
                                Credit Card
                            </button>
                            <button
                                onClick={() => setPaymentMethod("crypto")}
                                className={`flex-1 py-3 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
                                    paymentMethod === "crypto"
                                        ? "bg-primary text-primary-foreground shadow-md font-bold" // Teal + Dark Text
                                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                }`}
                            >
                                <Wallet className="w-4 h-4" />
                                Pay with Crypto
                            </button>
                        </div>

                        {/* FORM AREA (Card: Slate 900) */}
                        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                            <h2 className="text-lg font-bold text-card-foreground mb-6">
                                Payment Details
                            </h2>

                            {paymentMethod === "card" ? (
                                <form
                                    onSubmit={handleCardPayment}
                                    className="space-y-5"
                                >
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">
                                            Cardholder Name
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full p-3 bg-secondary border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">
                                            Card Number
                                        </label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                                            <input
                                                required
                                                type="text"
                                                placeholder="0000 0000 0000 0000"
                                                className="w-full p-3 pl-10 bg-secondary border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-muted-foreground uppercase">
                                                Expiry
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="MM/YY"
                                                className="w-full p-3 bg-secondary border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all font-mono"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-muted-foreground uppercase">
                                                CVC
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="123"
                                                className="w-full p-3 bg-secondary border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all font-mono"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        disabled={isProcessing}
                                        className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-70 transition-colors shadow-lg shadow-primary/20"
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <ShieldCheck className="w-4 h-4" />
                                        )}
                                        {isProcessing
                                            ? "Processing..."
                                            : `Pay $${item.price + 8.0}`}
                                    </button>
                                    <p className="text-center text-xs text-muted-foreground">
                                        Payments are secure and encrypted.
                                    </p>
                                </form>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 space-y-6">
                                    <div className="bg-secondary p-4 rounded-full border border-border">
                                        <Image
                                            src="/ethereum-logo.png"
                                            width={40}
                                            height={40}
                                            alt="ETH"
                                        />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-foreground font-medium">
                                            Sepolia Testnet Payment
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            Send {item.price} ETH to complete
                                            purchase
                                        </p>
                                    </div>

                                    {/* Wallet Connection */}
                                    <div className="w-full max-w-xs">
                                        <ConnectButton
                                            client={client}
                                            chain={chain}
                                            theme="dark"
                                        />
                                    </div>

                                    {account && (
                                        <button
                                            onClick={handleCryptoPayment}
                                            disabled={isTxPending}
                                            className="w-full max-w-xs py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-70 transition-all shadow-lg shadow-primary/20"
                                        >
                                            {isTxPending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Wallet className="w-4 h-4" />
                                            )}
                                            {isTxPending
                                                ? "Confirming..."
                                                : "Send Transaction"}
                                        </button>
                                    )}

                                    {/* Warning Box: Orange Accent */}
                                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 text-xs text-accent max-w-sm text-center">
                                        <strong>Note:</strong> This uses the
                                        Sepolia Testnet. Do not send real ETH.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COL: ORDER SUMMARY */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-24">
                            <h3 className="font-bold text-card-foreground mb-4">
                                Order Summary
                            </h3>

                            <div className="flex gap-4 mb-6 pb-6 border-b border-border">
                                <div className="w-16 h-16 bg-secondary rounded-lg overflow-hidden relative border border-border">
                                    {/* Replace with item.image */}
                                    <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground text-xs">
                                        IMG
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-foreground line-clamp-2">
                                        {item.title}
                                    </h4>
                                    <p className="text-muted-foreground text-sm">
                                        Qty: 1
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>${item.price}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Shipping</span>
                                    <span>${8.0}</span>
                                </div>
                                <div className="flex justify-between font-bold text-foreground pt-3 border-t border-border text-base">
                                    <span>Total</span>
                                    <span>${item.price + 8.0}</span>
                                </div>
                            </div>

                            <div className="mt-6 text-xs text-muted-foreground flex gap-2">
                                <ShieldCheck className="w-4 h-4 shrink-0 text-primary" />
                                <span>
                                    Buyer Protection Guarantee included with
                                    every purchase.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SuccessView({ router }: { router: any }) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md p-8 rounded-2xl shadow-2xl border border-border text-center">
                <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                    Payment Successful!
                </h1>
                <p className="text-muted-foreground mb-8">
                    Your order for{" "}
                    <strong className="text-foreground">
                        Vintage Eames Chair
                    </strong>{" "}
                    has been confirmed. The seller has been notified.
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        Return to Dashboard
                    </button>
                    <button
                        onClick={() => router.push("/messages")}
                        className="w-full py-3 bg-secondary border border-border text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                    >
                        Message Seller
                    </button>
                </div>
            </div>
        </div>
    );
}
