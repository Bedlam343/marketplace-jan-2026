import { Loader2, CheckCircle, ExternalLink, Clock } from "lucide-react";

export default function ProcessingView({
    txHash,
    step,
}: {
    txHash: string;
    step: number;
}) {
    // Enhanced "Pop" Visuals
    const getStepClass = (stepNum: number) => {
        // DONE
        if (step > stepNum)
            return "opacity-50 grayscale transition-all duration-500";
        // ACTIVE (The Pop)
        if (step === stepNum)
            return "opacity-100 border-2 border-primary bg-primary/10 shadow-lg scale-105 transition-all duration-300 ring-2 ring-primary/20";
        // FUTURE
        return "opacity-30 grayscale transition-all duration-500";
    };

    return (
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
                Processing Order
            </h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Please wait while we verify your transaction on the blockchain.
            </p>

            <div className="w-full max-w-md space-y-4 mb-8">
                {/* Step 1 */}
                <div
                    className={`flex items-center gap-4 p-4 rounded-lg border border-border ${getStepClass(1)}`}
                >
                    <div className="w-8 h-8 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-foreground">
                            Payment Sent
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Transaction broadcasted
                        </p>
                    </div>
                </div>

                {/* Step 2 */}
                <div
                    className={`flex items-center gap-4 p-4 rounded-lg border border-border ${getStepClass(2)}`}
                >
                    <div className="w-8 h-8 text-primary flex items-center justify-center shrink-0 bg-secondary rounded-full">
                        {step === 2 ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <div className="w-2 h-2 bg-current rounded-full" />
                        )}
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-foreground">
                            Confirming on Sepolia
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Waiting for blocks...
                        </p>
                    </div>
                </div>

                {/* Step 3 */}
                <div
                    className={`flex items-center gap-4 p-4 rounded-lg border border-border ${getStepClass(3)}`}
                >
                    <div className="w-8 h-8 text-primary flex items-center justify-center shrink-0 bg-secondary rounded-full">
                        {step === 3 ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <div className="w-2 h-2 bg-current rounded-full" />
                        )}
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-foreground">
                            Finalizing Order
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Updating inventory
                        </p>
                    </div>
                </div>
            </div>

            {txHash && (
                <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                    View on Explorer <ExternalLink className="w-3 h-3" />
                </a>
            )}
            <div className="mt-8 pt-6 border-t border-border w-full">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Clock className="w-3 h-3" /> Do not close this window.
                </p>
            </div>
        </div>
    );
}
