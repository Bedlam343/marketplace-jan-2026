"use client";

import { useState, useActionState } from "react";
import { signupAction } from "@/services/auth-actions";
import { Input } from "@/components/ui/input";

export function SignupForm() {
    const [state, action, isPending] = useActionState(signupAction, undefined);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <form action={action} className="space-y-6">
            {state?.message && !state.success && (
                <div className="rounded-md bg-red-50 p-4 border border-red-100">
                    <p className="text-sm font-medium text-red-800">
                        {state.message}
                    </p>
                </div>
            )}

            <Input
                id="name"
                name="name"
                type="text"
                label="Full Name"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={isPending}
                error={state?.errors?.name}
            />

            <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isPending}
                error={state?.errors?.email}
            />

            <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isPending}
                error={state?.errors?.password}
            />

            <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isPending}
                error={state?.errors?.confirmPassword}
            />

            <div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-slate-800 disabled:opacity-70 transition-all cursor-pointer"
                >
                    {isPending ? "Creating account..." : "Create account"}
                </button>
            </div>
        </form>
    );
}
