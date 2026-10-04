import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev resources are blocked cross-origin by default; the dev server is
  // commonly opened via 127.0.0.1 as well as localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
