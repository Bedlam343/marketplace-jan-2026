"use client";

import { Check, Circle } from "lucide-react";

interface RequirementProps {
    label: string;
    met: boolean;
}

const Requirement = ({ label, met }: RequirementProps) => (
    <div
        className={`flex items-center gap-2 text-xs transition-colors ${
            met ? "text-emerald-600" : "text-muted-foreground"
        }`}
    >
        {met ? <Check className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
        <span>{label}</span>
    </div>
);

export function PasswordRequirements({ value }: { value: string }) {
    const requirements = [
        { label: "At least 8 characters", met: value.length >= 8 },
        { label: "One uppercase letter", met: /[A-Z]/.test(value) },
        { label: "One number", met: /[0-9]/.test(value) },
    ];

    return (
        <div className="mt-2 space-y-1.5 px-1">
            {requirements.map((req) => (
                <Requirement key={req.label} label={req.label} met={req.met} />
            ))}
        </div>
    );
}
