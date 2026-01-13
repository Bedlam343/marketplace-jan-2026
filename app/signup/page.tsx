import { headers } from "next/headers";
import { auth } from "@/lib/auth"; // If you need to redirect logged-in users

import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupForm } from "@/components/auth/SignupForm";

export default async function SignupPage() {
    // Redirect if already logged in
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session) {
        redirect("/dashboard");
    }

    return (
        <AuthLayout
            title="Create an account"
            subtitle="Already have an account?"
            linkText="Sign in"
            linkHref="/login"
        >
            <SignupForm />
        </AuthLayout>
    );
}
