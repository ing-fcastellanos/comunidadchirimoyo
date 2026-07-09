/* noticias-cache.ts — lecturas de noticias cacheadas en el Data Cache de Next
   (Fase 6, #136). Envuelve los db-readers de Firestore (lib/noticias-db.ts) para
   servir con revalidación en runtime SIN pre-generar en build: las páginas son
   `force-dynamic` (el build no toca Firestore) y estas funciones cachean el
   resultado entre requests. El tag `noticias` permite invalidar TODO on-demand
   desde /api/revalidate al publicar (#140), con un respaldo temporal por si un
   disparo se pierde. Server-only (los db-readers usan firebase-admin). */
import { unstable_cache } from "next/cache";

import { getAllNoticiasDb, getNoticiaDb } from "./noticias-db";

/** Tag único de invalidación de todas las lecturas de noticias. */
export const NOTICIAS_TAG = "noticias";

/** Respaldo temporal (1 h) por si no llega un disparo on-demand. */
const REVALIDATE_S = 3600;

/** Listado de noticias, cacheado y revalidable por tag. */
export const getAllNoticiasCached = unstable_cache(
  () => getAllNoticiasDb(),
  ["noticias:all"],
  { tags: [NOTICIAS_TAG], revalidate: REVALIDATE_S },
);

/** Nota por slug, cacheada por slug (el arg entra en la clave) y revalidable por tag. */
export const getNoticiaCached = unstable_cache(
  (slug: string) => getNoticiaDb(slug),
  ["noticias:one"],
  { tags: [NOTICIAS_TAG], revalidate: REVALIDATE_S },
);
