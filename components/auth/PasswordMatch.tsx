"use client";

import { CheckCircle2, XCircle } from "lucide-react";

interface PasswordMatchProps {
    password?: string;
    confirm?: string;
}

export function PasswordMatch({ password, confirm }: PasswordMatchProps) {
    // Don't show anything if either field is empty
    if (!password || !confirm) return null;

    const isMatching = password === confirm;

    return (
        <div
            className={`mt-2 flex items-center gap-2 text-xs font-medium transition-all ${
                isMatching ? "text-emerald-600" : "text-destructive"
            }`}
        >
            {isMatching ? (
                <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Passwords match</span>
                </>
            ) : (
                <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Passwords do not match.</span>
                </>
            )}
        </div>
    );
}
