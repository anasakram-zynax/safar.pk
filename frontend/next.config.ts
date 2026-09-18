import type { NextConfig } from "next";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const validCloudName = cloudName && /^[a-zA-Z0-9_-]+$/.test(cloudName);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: validCloudName
      ? [
          {
            protocol: "https",
            hostname: "res.cloudinary.com",
            port: "",
            pathname: `/${cloudName}/image/upload/**`,
            search: "",
          },
        ]
      : [],
  },
};

export default nextConfig;
