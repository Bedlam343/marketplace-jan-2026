import type { NextConfig } from "next";
import { GCS_DOMAIN } from "@/utils/constants";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: [
                "localhost:3000",
                process.env.CODESPACE_NAME ?? "",
                `https://${process.env.CODESPACE_NAME}`,
                process.env.BETTER_AUTH_URL!,
            ],
        },
    },
    async redirects() {
        return [
            {
                source: "/",
                destination: "/search",
                permanent: true, // cache the redirect (Status 308)
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: GCS_DOMAIN,
            },
            {
                protocol: "https",
                hostname: "api.dicebear.com",
            },
        ],
    },
    env: {
        NEXT_PUBLIC_CODESPACE_NAME: process.env.CODESPACE_NAME,
        NEXT_PUBLIC_BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    },
};

export default nextConfig;
