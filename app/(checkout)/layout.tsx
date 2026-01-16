import { LockIcon } from "lucide-react";
import { ThirdwebProvider } from "thirdweb/react";
import Link from "next/link";

export default function CheckoutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThirdwebProvider>
            <div className="min-h-screen">
                <nav className="h-16 border-b flex items-center justify-between px-8">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 transition-opacity hover:opacity-90"
                    >
                        <div
                            className="w-8 h-8 bg-primary rounded-lg flex 
                        items-center justify-center text-primary-foreground
                        font-bold text-lg shadow-sm"
                        >
                            M
                        </div>
                        <span
                            className="text-xl font-bold text-foreground 
                        tracking-tight hidden sm:block"
                        >
                            Marketplace
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-primary">
                            Secure Checkout
                        </span>
                        <LockIcon className="w-4 h-4 text-primary" />
                    </div>
                    {/* Wallet connection button would go here */}
                </nav>
                <main>{children}</main>
            </div>
        </ThirdwebProvider>
    );
}
