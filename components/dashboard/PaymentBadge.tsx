import { CreditCard, Wallet } from "lucide-react";

type PaymentBadgeProps = {
    payment: {
        method: "crypto" | "card";
        cardBrand: string | null;
        cardLast4: string | null;
    };
};

export default function PaymentBadge({ payment }: PaymentBadgeProps) {
    const isCrypto = payment.method === "crypto";
    return (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border">
            {isCrypto ? (
                <Wallet className="w-3 h-3" />
            ) : (
                <CreditCard className="w-3 h-3" />
            )}
            <span>
                {isCrypto
                    ? "Crypto"
                    : payment.cardBrand
                      ? `${payment.cardBrand.toUpperCase()} •• ${payment.cardLast4}`
                      : "Card"}
            </span>
        </div>
    );
}
