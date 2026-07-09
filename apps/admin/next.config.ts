import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloud Run (ADR-0015, mismo patrón que apps/sitio): standalone porque la
  // app necesita servidor (Server Actions, sesión de auth en #139).
  output: "standalone",
  images: {
    // Permite optimizar (next/image) las fotos del bucket de comunidad (ADR-0021)
    // en la vista previa del editor de noticias (#140). Espejo de apps/sitio.
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
