import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    labelColor?: string;
    error?: string[];
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, labelColor, error, className = "", ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label
                        htmlFor={props.id}
                        // Default to foreground, but allow override
                        className={`block text-sm font-medium ${
                            labelColor ? labelColor : "text-foreground"
                        }`}
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        className={`
                            appearance-none block w-full px-3 py-2
                            bg-secondary 
                            border border-input 
                            rounded-lg shadow-sm 
                            text-foreground 
                            placeholder-muted-foreground 
                            focus:outline-none focus:ring-[1px] 
                            focus:ring-ring focus:border-ring 
                            sm:text-sm transition-all
                            disabled:opacity-50 disabled:cursor-not-allowed
              ${
                  error
                      ? "border-destructive focus:border-destructive focus:ring-destructive"
                      : ""
              }
              ${className}
            `}
                        {...props}
                    />
                </div>
                {error && (
                    <p
                        className="text-xs text-destructive font-medium animate-pulse"
                        role="alert"
                    >
                        {error[0]}
                    </p>
                )}
            </div>
        );
    },
);

Input.displayName = "Input";
