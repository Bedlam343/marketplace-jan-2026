"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { CreditCard, Wallet, ShieldCheck, Loader2 } from "lucide-react";

import { createThirdwebClient, prepareTransaction, toWei } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import {
    ConnectButton,
    useActiveAccount,
    useSendTransaction,
} from "thirdweb/react";

import { type NonNullBuyer } from "@/data/user";
import { type ItemWithSellerWallet } from "@/data/items";
import {
    createPendingCryptoOrder,
    checkOrderStatus,
    debugSimulateWebhook,
} from "@/services/orders/actions";
import { getEthPriceInUsd } from "@/utils/helpers";
import { SEPOLIA_CHAIN_ID } from "@/utils/constants";

import ProcessingView from "@/components/buy/ProcessingView";
import SuccessView from "@/components/buy/SuccessView";

// --- CONFIGURATION ---
const IS_MOCK_MODE = true;

const thirdWebClientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
if (!thirdWebClientId) {
    throw new Error("Thirdweb Client ID not found");
}

const client = createThirdwebClient({ clientId: thirdWebClientId });
const chain = defineChain(SEPOLIA_CHAIN_ID);

type BuyItemProps = {
    item: ItemWithSellerWallet;
    buyer: NonNullBuyer;
};

type ViewState = "form" | "processing" | "success";

export default function BuyItem({ item, buyer }: BuyItemProps) {
    const router = useRouter();

    // --- STATE ---
    const [view, setView] = useState<ViewState>("form");
    const [processingStep, setProcessingStep] = useState(1); // 1=Sent, 2=Confirming, 3=Finalizing

    const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto">(
        buyer.cryptoWalletAddress && !buyer.savedCardLast4 ? "crypto" : "card",
    );

    // Data State
    const [txHash, setTxHash] = useState<string>("");
    const [ethPrice, setEthPrice] = useState<number | null>(null);

    // Loading States
    const [isProcessingCard, setIsProcessingCard] = useState(false);
    const [isFetchingPrice, setIsFetchingPrice] = useState(false);

    const isCryptoDisabled = !item.seller?.cryptoWalletAddress;

    // Costs
    const shippingCost = 8.0;
    const totalUsd = Number(item.price) + shippingCost;
    const totalEth = ethPrice ? (totalUsd / ethPrice).toFixed(6) : "0.00";

    // Web3 Hooks
    const account = useActiveAccount();
    const { mutate: sendTransaction, isPending: isTxPending } =
        useSendTransaction();

    // --- EFFECTS ---
    useEffect(() => {
        if (paymentMethod === "crypto" && !ethPrice) {
            setIsFetchingPrice(true);
            getEthPriceInUsd().then((price) => {
                setEthPrice(price);
                setIsFetchingPrice(false);
            });
        }
    }, [paymentMethod, ethPrice]);

    // --- HANDLERS ---

    const startPolling = async (orderId: string) => {
        // VISUAL: Immediately jump to Step 2
        setProcessingStep(2);

        const maxAttempts = 30; // ~90 seconds
        let attempts = 0;

        const interval = setInterval(async () => {
            attempts++;
            try {
                const result = await checkOrderStatus(orderId);
                let status = result?.data?.status || "failed";

                if (status === "completed") {
                    clearInterval(interval);

                    // VISUAL: Jump to Step 3
                    setProcessingStep(3);

                    // ARTIFICIAL DELAY: Wait 2.5s before showing success screen
                    setTimeout(() => {
                        setView("success");
                    }, 2500);
                } else if (status === "failed") {
                    clearInterval(interval);
                    alert("Order verification failed. Please contact support.");
                    setView("form");
                }

                if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    alert(
                        "Transaction is taking a while. Check dashboard later.",
                    );
                    router.push("/dashboard");
                }
            } catch (err) {
                console.error("Polling error", err);
            }
        }, 3000);
    };

    const handleMockPayment = async () => {
        if (!account) return alert("Please connect wallet (Mock Mode)");

        // FIX: Generate a valid-length hex string so Zod validation passes
        const randomHex = Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16),
        ).join("");
        const mockHash = `0x${randomHex}`;

        console.log("Mock Tx Sent:", mockHash);
        setTxHash(mockHash);

        // VISUAL: Enter processing mode at Step 1
        setView("processing");
        setProcessingStep(1);

        // Create DB Order
        const result = await createPendingCryptoOrder({
            itemId: item.id,
            amountPaidCrypto: totalEth,
            amountPaidUsd: String(totalUsd),
            txHash: mockHash,
            buyerWalletAddress: account.address,
        });

        if (result.success && result.data) {
            const orderId = result.data.orderId;

            // Start Polling (Will update UI to Step 2)
            startPolling(orderId);

            // TRIGGER: Simulate Webhook after 4 seconds
            setTimeout(async () => {
                console.log("Simulating Webhook Event...");
                await debugSimulateWebhook(orderId);
            }, 4000);
        } else {
            // ERROR HANDLING: If mock fails, alert the user so it doesn't just hang
            alert(
                "Mock Order Creation Failed: " +
                    JSON.stringify(result.errors || result.message),
            );
            setView("form");
        }
    };

    const handleCryptoPayment = () => {
        if (!account) return alert("Please connect your wallet first");
        const sellerWallet = item.seller?.cryptoWalletAddress;
        if (!sellerWallet) return alert("Seller has no crypto wallet");

        const weiValue = toWei(totalEth.toString());
        const transaction = prepareTransaction({
            to: sellerWallet,
            chain: chain,
            client: client,
            value: weiValue,
        });

        sendTransaction(transaction, {
            onSuccess: async (txResult) => {
                console.log("Tx Sent:", txResult.transactionHash);
                setTxHash(txResult.transactionHash);
                setView("processing");
                setProcessingStep(1);

                const result = await createPendingCryptoOrder({
                    itemId: item.id,
                    amountPaidCrypto: totalEth,
                    amountPaidUsd: String(totalUsd),
                    txHash: txResult.transactionHash,
                    buyerWalletAddress: account.address,
                });

                if (result.success && result.data) {
                    startPolling(result.data.orderId);
                } else {
                    alert(
                        "Payment sent, but order creation failed. Save Tx Hash: " +
                            txResult.transactionHash,
                    );
                }
            },
            onError: (error) => {
                console.error("Tx Failed", error);
                alert("Transaction Failed. Check console.");
            },
        });
    };

    const handleCardPayment = async (e: FormEvent) => {
        e.preventDefault();
        setIsProcessingCard(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsProcessingCard(false);
        setView("success");
    };

    if (view === "success") {
        return <SuccessView router={router} itemTitle={item.title} />;
    }

    return (
        <div className="min-h-screen bg-background text-foreground py-12 font-sans">
            <div className="max-w-5xl mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-6">
                        {view === "processing" ? (
                            <ProcessingView
                                txHash={txHash}
                                step={processingStep}
                            />
                        ) : (
                            <>
                                <div className="bg-card p-1 rounded-xl border border-border flex gap-1 shadow-sm relative z-0">
                                    <button
                                        onClick={() => setPaymentMethod("card")}
                                        className={`flex-1 py-3 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
                                            paymentMethod === "card"
                                                ? "bg-primary text-primary-foreground shadow-md font-bold"
                                                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                        }`}
                                    >
                                        <CreditCard className="w-4 h-4" />{" "}
                                        Credit Card
                                    </button>
                                    <div className="relative flex-1 group">
                                        <button
                                            disabled={isCryptoDisabled}
                                            onClick={() =>
                                                setPaymentMethod("crypto")
                                            }
                                            className={`w-full h-full py-3 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
                                                paymentMethod === "crypto"
                                                    ? "bg-primary text-primary-foreground shadow-md font-bold"
                                                    : isCryptoDisabled
                                                      ? "cursor-not-allowed opacity-50 text-muted-foreground"
                                                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                            }`}
                                        >
                                            <Wallet className="w-4 h-4" /> Pay
                                            with Crypto
                                        </button>
                                        {isCryptoDisabled && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-popover text-popover-foreground text-xs font-medium rounded-md border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                Seller does not accept crypto
                                            </div>
                                        )}
                                    </div>
                                </div>

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
                                                    className="w-full p-3 bg-secondary border border-input rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
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
                                                        className="w-full p-3 pl-10 bg-secondary border border-input rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-ring transition-all font-mono"
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
                                                        className="w-full p-3 bg-secondary border border-input rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-ring transition-all font-mono"
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
                                                        className="w-full p-3 bg-secondary border border-input rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-ring transition-all font-mono"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                disabled={isProcessingCard}
                                                className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-70 transition-colors shadow-lg shadow-primary/20"
                                            >
                                                {isProcessingCard ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <ShieldCheck className="w-4 h-4" />
                                                )}
                                                {isProcessingCard
                                                    ? "Processing..."
                                                    : `Pay $${totalUsd.toFixed(2)}`}
                                            </button>
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
                                                    Send {totalEth} ETH to
                                                    complete purchase
                                                </p>
                                            </div>
                                            <div className="w-full max-w-xs space-y-3">
                                                {!account ? (
                                                    <ConnectButton
                                                        client={client}
                                                        chain={chain}
                                                        theme="dark"
                                                    />
                                                ) : (
                                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                        <div className="flex items-center justify-center gap-2 mb-3 text-xs text-muted-foreground bg-secondary/50 py-1.5 px-3 rounded-full w-max mx-auto border border-border">
                                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                            <span>
                                                                Wallet:{" "}
                                                                <span className="font-mono text-foreground">
                                                                    {account.address.slice(
                                                                        0,
                                                                        6,
                                                                    )}
                                                                    ...
                                                                    {account.address.slice(
                                                                        -4,
                                                                    )}
                                                                </span>
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={
                                                                IS_MOCK_MODE
                                                                    ? handleMockPayment
                                                                    : handleCryptoPayment
                                                            }
                                                            disabled={
                                                                !IS_MOCK_MODE &&
                                                                isTxPending
                                                            }
                                                            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-70 transition-all shadow-lg shadow-primary/20"
                                                        >
                                                            {!IS_MOCK_MODE &&
                                                            isTxPending ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Wallet className="w-4 h-4" />
                                                            )}
                                                            {IS_MOCK_MODE
                                                                ? "Pay (MOCK MODE)"
                                                                : isTxPending
                                                                  ? "Confirming..."
                                                                  : "Send Transaction"}
                                                        </button>
                                                        <div className="mt-3 bg-accent/10 border border-accent/20 rounded-lg p-3 text-xs text-accent text-center">
                                                            <strong>
                                                                Note:
                                                            </strong>{" "}
                                                            This uses the
                                                            Sepolia Testnet. Do
                                                            not send real ETH.
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="lg:col-span-1">
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-24">
                            <h3 className="font-bold text-card-foreground mb-4">
                                Order Summary
                            </h3>
                            <div className="flex gap-4 mb-6 pb-6 border-b border-border">
                                <div className="w-16 h-16 bg-secondary rounded-lg overflow-hidden relative border border-border">
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
                                    <span>${shippingCost}</span>
                                </div>
                                <div className="flex justify-between font-bold text-foreground pt-3 border-t border-border text-base">
                                    <span>Total</span>
                                    <span>${totalUsd.toFixed(2)}</span>
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
