import { Alchemy, type AlchemySettings, Network } from "alchemy-sdk";

const settings: AlchemySettings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    authToken: process.env.ALCHEMY_AUTH_TOKEN,
    network: Network.ETH_SEPOLIA,
};

const alchemy = new Alchemy(settings);

// get this from the alchemy dashboard
const webhookId = process.env.ALCHEMY_WEBHOOK_ID;
if (!webhookId) {
    throw new Error("Missing Alchemy Webhook ID");
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
