import type { MetadataRoute } from "next";

/* robots.ts — robots único del dominio. Permite indexar todo el contenido
   público y apunta al sitemap absoluto (ADR-0023, dominio único). */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://chirimoyo.org/sitemap.xml",
  };
}
