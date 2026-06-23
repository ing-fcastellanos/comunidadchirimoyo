import type { MetadataRoute } from "next";
import { getAllFichas } from "@/lib/content";

/* sitemap.ts — sitemap del catálogo de fauna (ADR-0024: dominio único
   fauna.chirimoyo.org, grupos por path). URLs absolutas sobre la base pública.
   Incluye el hub, el landing y buscador de aves, y la ficha de cada especie
   existente (`/<grupo>/<slug>`). No se incluyen los placeholders «próximamente»
   ni las rutas no indexables (not-found, error). */

/** Generación estática en build (output: "export"). */
export const dynamic = "force-static";

const BASE = "https://fauna.chirimoyo.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fichas = await getAllFichas();
  const rutas = ["/", "/aves", "/aves/buscador"];
  const fichasUrls = fichas.map((f) => `/${f.grupo}/${f.slug}`);
  return [...rutas, ...fichasUrls].map((ruta) => ({
    url: `${BASE}${ruta === "/" ? "" : ruta}`,
  }));
}
