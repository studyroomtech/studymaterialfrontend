import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  sassOptions: {
    // Shared SCSS lives in src/styles; make it importable without deep relative paths.
    includePaths: ["./src/styles"],
  },
};

export default nextConfig;
