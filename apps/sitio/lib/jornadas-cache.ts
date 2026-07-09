/* jornadas-cache.ts — lecturas de jornadas cacheadas en el Data Cache de Next
   (Fase 6, #137). Envuelve el db-reader de Firestore (lib/jornadas-db.ts) para
   servir con revalidación en runtime SIN pre-generar en build: `/voluntarios` es
   `force-dynamic` (el build no toca Firestore) y esta función cachea el
   resultado entre requests. El tag `jornadas` permite invalidar on-demand desde
   /api/revalidate al publicar (#141), con un respaldo temporal por si un disparo
   se pierde. Server-only (el db-reader usa firebase-admin). Espejo de
   noticias-cache.ts. */
import { unstable_cache } from "next/cache";

import { getJornadasDb } from "./jornadas-db";

/** Tag único de invalidación de todas las lecturas de jornadas. */
export const JORNADAS_TAG = "jornadas";

/** Respaldo temporal (1 h) por si no llega un disparo on-demand. */
const REVALIDATE_S = 3600;

/** Jornadas (recurrentes + eventos), cacheadas y revalidables por tag. La
    expansión a próximas ocurrencias (proximasJornadas) sigue en el front. */
export const getJornadasCached = unstable_cache(
  () => getJornadasDb(),
  ["jornadas:all"],
  { tags: [JORNADAS_TAG], revalidate: REVALIDATE_S },
);
