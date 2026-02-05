import "server-only";

import { eq, or, desc } from "drizzle-orm";
import { db } from "@/db";
import { conversations } from "@/db/schema";
// import { authenticatedQuery } from "@/lib/safe-query";

export async function getUserConversations(userId: string) {
    const results = await db.query.conversations.findMany({
        where: or(
            eq(conversations.participantOneId, userId),
            eq(conversations.participantTwoId, userId),
        ),

        with: {
            item: true,
            participantOne: true,
            participantTwo: true,
            lastMessage: true,
        },
        orderBy: [desc(conversations.updatedAt)],
    });

    const formatted = results.map((conv) => {
        const isUserOne = conv.participantOneId === userId;
        const otherUser = isUserOne ? conv.participantTwo : conv.participantOne;

        return {
            id: conv.id,
            updatedAt: conv.updatedAt,
            item: {
                id: conv.item.id,
                title: conv.item.title,
                image: conv.item.images?.[0] || null,
                price: conv.item.price,
            },
            otherUser: {
                id: otherUser.id,
                name: otherUser.name,
                image: otherUser.image,
            },

            lastMessage: conv.lastMessage?.content || "Started a conversation",
        };
    });

    return formatted;
}

export type ConversationSnippets = Awaited<
    ReturnType<typeof getUserConversations>
>;
