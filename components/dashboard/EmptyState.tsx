type EmptyStateProps = {
    icon: React.ReactNode;
    message: string;
    subMessage: string;
};

export default function EmptyState({
    icon,
    message,
    subMessage,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center h-48 text-center p-6">
            <div className="bg-muted p-3 rounded-full mb-3 border border-border">
                {icon}
            </div>
            <p className="text-foreground font-medium text-sm">{message}</p>
            <p className="text-muted-foreground text-xs mt-1">{subMessage}</p>
        </div>
    );
}
