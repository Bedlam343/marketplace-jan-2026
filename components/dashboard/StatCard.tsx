type StatCardProps = {
    label: string;
    value: string | number;
    sublabel: string;
    icon: React.ReactNode;
    trend?: string;
};

export default function StatCard({
    label,
    value,
    sublabel,
    icon,
    trend,
}: StatCardProps) {
    return (
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-muted rounded-lg border border-border">
                    {icon}
                </div>
                {trend && (
                    <span className="text-xs font-medium text-green-600 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    {label}
                </h3>
                <p className="text-3xl font-bold text-foreground mt-1 tracking-tight">
                    {value}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                    {sublabel}
                </p>
            </div>
        </div>
    );
}
