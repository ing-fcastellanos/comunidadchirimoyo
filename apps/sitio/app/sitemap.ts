import type { MetadataRoute } from "next";

/* sitemap.ts — sitemap único del dominio (ADR-0023: todas las secciones son
   paths de chirimoyo.org, sin ruteo por host). URLs absolutas resueltas contra
   el origen canónico. Al agregar una sección pública nueva, súmala a RUTAS.
   No se incluyen rutas no indexables (not-found, error). */

const BASE = "https://chirimoyo.org";

const RUTAS = [
  "/",
  "/comunidad",
  "/voluntarios",
  "/aliados",
  "/galeria",
  "/contacto",
  "/privacidad",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return RUTAS.map((ruta) => ({
    url: `${BASE}${ruta === "/" ? "" : ruta}`,
  }));
}
