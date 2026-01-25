import { Suspense } from "react";
import EditorNavbar from "@/components/items/EditorNavbar";

export default function EditorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <Suspense fallback={null}>
                <EditorNavbar />
            </Suspense>
            <main>{children}</main>
        </div>
    );
}
