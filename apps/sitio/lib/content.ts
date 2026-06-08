/* content.ts — acceso al contenido (content/) desde la raíz del repo, en build.
   STUB tipado. El parseo real (comunidad, noticias, jornadas) va en Fase 3/4. */
import path from "node:path";

export const CONTENT_ROOT =
  process.env.CONTENT_DIR ?? path.resolve(process.cwd(), "../../content");

export const COMUNIDAD_DIR = path.join(CONTENT_ROOT, "comunidad");
export const NOTICIAS_DIR = path.join(CONTENT_ROOT, "noticias");
export const JORNADAS_DIR = path.join(CONTENT_ROOT, "jornadas");

/** STUB: lista de noticias. Implementación real en Fase 3. */
export async function getNoticias(): Promise<unknown[]> {
  // TODO(Fase 3): leer NOTICIAS_DIR según el formato de contenido.
  return [];
}
