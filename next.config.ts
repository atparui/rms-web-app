import type { NextConfig } from "next";

// Standalone output only for Docker/production builds (set NEXT_STANDALONE_BUILD=true in Dockerfile).
// Local `next build` + `next start` runs without standalone to avoid the warning.
const nextConfig: NextConfig = {
  ...(process.env.NEXT_STANDALONE_BUILD === "true" && { output: "standalone" }),
};

export default nextConfig;
