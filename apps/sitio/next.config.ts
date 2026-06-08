import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloud Run (ADR-0008): servidor para el ruteo por host (middleware).
  output: "standalone",
};

export default nextConfig;
