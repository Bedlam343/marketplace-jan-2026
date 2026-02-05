import { MessageSquareDashed } from "lucide-react";

export default function MessagesPage() {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <MessageSquareDashed className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Your Messages</h2>
            <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                Select a conversation from the left to continue chatting or
                start a new inquiry from the marketplace.
            </p>
        </div>
    );
}
