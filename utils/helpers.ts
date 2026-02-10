export const getEthPriceInUsd = async (): Promise<number> => {
    try {
        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
        );

        const data = await response.json();
        return data.ethereum.usd;
    } catch (error) {
        console.error("Failed to fetch ETH price: ", error);
        return 2500; // fallback price to prevent UI crash
    }
};

export const getBaseUrl = () => {
    // const codespaceName =
    //     process.env.CODESPACE_NAME || process.env.NEXT_PUBLIC_CODESPACE_NAME;

    // if (codespaceName) {
    //     return `https://${codespaceName}-3000.app.github.dev`;
    // }

    return process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
};
