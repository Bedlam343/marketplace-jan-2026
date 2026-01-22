import Link from "next/link";

export default function NavLink({
    href,
    active,
    children,
}: {
    href: string;
    active: boolean;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className={`
        flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all
        ${active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}
      `}
        >
            {children}
        </Link>
    );
}
