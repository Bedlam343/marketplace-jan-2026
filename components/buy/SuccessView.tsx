import { CheckCircle, ArrowRight } from "lucide-react";

export default function SuccessView({
    router,
    itemTitle,
}: {
    router: any;
    itemTitle: string;
}) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md p-8 rounded-2xl shadow-2xl border border-border text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                    Payment Successful!
                </h1>
                <p className="text-muted-foreground mb-8">
                    Your order for{" "}
                    <strong className="text-foreground">{itemTitle}</strong> has
                    been confirmed. The seller has been notified.
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
                    >
                        Return to Dashboard{" "}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => alert("Messaging feature coming soon!")}
                        className="w-full py-3 bg-secondary border border-border text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                    >
                        Message Seller
                    </button>
                </div>
            </div>
        </div>
    );
}
