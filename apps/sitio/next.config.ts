import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloud Run (ADR-0008): servidor para el ruteo por host (middleware).
  output: "standalone",
  images: {
    // Permite optimizar (next/image) las fotos del bucket de comunidad (ADR-0021).
    // Si la base cambia (CDN/dominio propio), actualizar junto con
    // NEXT_PUBLIC_COMUNIDAD_CDN_BASE.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/comunidad-chirimoyo/**",
      },
    ],
  },
};

export default nextConfig;
