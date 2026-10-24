import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingIncludes: {
    "/api/private-images/[...path]": [
      "./birthday-private/**/*",
    ],
  },
};

export default nextConfig;
