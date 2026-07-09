import type { MetadataRoute } from "next";
import { getAllNoticiasCached } from "@/lib/noticias-cache";
import { totalPaginas } from "@/lib/noticias-paginacion";

/* sitemap.ts — sitemap único del dominio (ADR-0023: todas las secciones son
   paths de chirimoyo.org, sin ruteo por host). URLs absolutas resueltas contra
   el origen canónico. Incluye las rutas estáticas públicas y las de noticias
   derivadas de Firestore (listado, paginación y detalle por slug), para que las
   notas —el contenido más fresco— se descubran por sitemap. DINÁMICO (Fase 6,
   #136): lee Firestore en runtime con revalidación; `force-dynamic` para que el
   build NO acceda a Firestore. Al agregar una sección pública nueva, súmala a
   RUTAS. No se incluyen rutas no indexables (not-found, error). */

export const dynamic = "force-dynamic";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const notas = await getAllNoticiasCached();

  const estaticas = RUTAS.map((ruta) => ({
    url: `${BASE}${ruta === "/" ? "" : ruta}`,
  }));

  // Listado de noticias (pág. 1) + páginas 2..N (la 1 vive en la ruta base).
  const total = totalPaginas(notas.length);
  const rutasListado = ["/comunidad/noticias"];
  for (let n = 2; n <= total; n++) rutasListado.push(`/comunidad/noticias/pagina/${n}`);
  const listado = rutasListado.map((ruta) => ({ url: `${BASE}${ruta}` }));

  // Detalle de cada nota, con lastModified = fecha de publicación (único
  // timestamp disponible; no hay fecha de actualización en el esquema).
  const detalle = notas.map((n) => ({
    url: `${BASE}/comunidad/noticias/${n.slug}`,
    ...(n.fecha ? { lastModified: new Date(n.fecha) } : {}),
  }));

  return [...estaticas, ...listado, ...detalle];
}
