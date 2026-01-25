import type { NextConfig } from "next";
import { GCS_DOMAIN } from "@/utils/constants";

const nextConfig: NextConfig = {
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
        ],
    },
};

export default nextConfig;
