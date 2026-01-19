import "server-only";

import { Alchemy, type AlchemySettings, Network } from "alchemy-sdk";
import { createHmac, timingSafeEqual } from "crypto";

const settings: AlchemySettings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    authToken: process.env.ALCHEMY_AUTH_TOKEN,
    network: Network.ETH_SEPOLIA,
};

const alchemy = new Alchemy(settings);

const webhookId = process.env.ALCHEMY_WEBHOOK_ID;
if (!webhookId) {
    throw new Error("Missing Alchemy Webhook ID");
}

const alchemySigningKey = process.env.ALCHEMY_SIGNING_KEY;

export function verifyAlchemySignature(
    request: Request,
    body: string,
    signature: string,
): boolean {
    if (!alchemySigningKey) {
        console.error("ALCHEMY_SIGNING_KEY is missing");
        return false;
    }

    const hmac = createHmac("sha256", alchemySigningKey)
        .update(body)
        .digest("hex");

    console.log("Hmac", hmac);
    console.log("Signature", signature);

    const expectedBuffer = Buffer.from(hmac);
    const receivedBuffer = Buffer.from(signature);

    if (expectedBuffer.length !== receivedBuffer.length) {
        return false;
    }

    return timingSafeEqual(expectedBuffer, receivedBuffer);
}

// called whenever new seller registers their crypto walllet
export async function subscribeCryptoWallet(walletAddress: string) {
    try {
        await alchemy.notify.updateWebhook(webhookId!, {
            newAddresses: [walletAddress],
            removeAddresses: [],
        });
    } catch (error) {
        console.error("Failed to subscribe new seller", error);
    }
}

export async function unsubscribeCryptoWallet(walletAddress: string) {}
