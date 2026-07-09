import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloud Run (ADR-0015, mismo patrón que apps/sitio): standalone porque la
  // app necesita servidor (Server Actions, sesión de auth en #139).
  output: "standalone",
};

export default nextConfig;
