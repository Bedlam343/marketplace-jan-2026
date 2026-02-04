import PusherClient from "pusher-js";

const publicPusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

if (!publicPusherKey || !pusherCluster) {
    throw new Error("Pusher client environment variables not found");
}

// listens to pusher events
export const pusherClient = new PusherClient(publicPusherKey, {
    cluster: pusherCluster,
    forceTLS: true,
});
