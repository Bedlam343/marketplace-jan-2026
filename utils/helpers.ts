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
