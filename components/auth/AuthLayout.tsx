import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    linkText: string;
    linkHref: string;
}

export async function AuthLayout({
    children,
    title,
    subtitle,
    linkText,
    linkHref,
}: AuthLayoutProps) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-foreground">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo: Teal background, Dark text */}
                <div className="mx-auto h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg shadow-primary/20">
                    M
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground tracking-tight">
                    {title}
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    {subtitle}{" "}
                    <Link
                        href={linkHref}
                        className="font-medium text-accent hover:text-accent/80 transition-colors underline-offset-4 hover:underline"
                    >
                        {linkText}
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                {/* Card: Dark Slate 900 background with border */}
                <div className="bg-card py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-border">
                    {children}
                </div>
            </div>
        </div>
    );
}
