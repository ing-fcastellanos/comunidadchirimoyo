import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Catálogo 100% estático (ADR-0005, ADR-0014): export a out/, sin servidor.
  output: "export",
  images: {
    // En export no hay optimizador de next/image en servidor.
    // Las fotos se optimizan en build (sharp) — ver #10.
    unoptimized: true,
  },
};

export default nextConfig;
