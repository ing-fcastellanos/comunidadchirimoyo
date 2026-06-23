import type { MetadataRoute } from "next";

/* robots.ts — robots del catálogo de fauna. Permite indexar el contenido público
   y apunta al sitemap absoluto del dominio (ADR-0024, fauna.chirimoyo.org). */

/** Generación estática en build (output: "export"). */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://fauna.chirimoyo.org/sitemap.xml",
  };
}
