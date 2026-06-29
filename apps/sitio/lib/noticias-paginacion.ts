/* noticias-paginacion.ts — utilidades PURAS del listado de noticias (#71): no
   importan node:fs, así que son seguras en cliente y servidor. La carga de datos
   vive en lib/noticias.ts (server-only). */
import type { NoticiaMeta } from "./noticias";

/** Tamaño de página del listado (grilla 3×3 en desktop). */
export const NOTICIAS_POR_PAGINA = 9;

/** Total de páginas para un número de notas (mínimo 1, aunque esté vacío). */
export function totalPaginas(total: number): number {
  return Math.max(1, Math.ceil(total / NOTICIAS_POR_PAGINA));
}

/** Devuelve el slice de la página `pagina` (1-based) y el total de páginas. */
export function paginar(
  notas: NoticiaMeta[],
  pagina: number,
): { slice: NoticiaMeta[]; totalPaginas: number } {
  const total = totalPaginas(notas.length);
  const inicio = (pagina - 1) * NOTICIAS_POR_PAGINA;
  return { slice: notas.slice(inicio, inicio + NOTICIAS_POR_PAGINA), totalPaginas: total };
}

/** Formatea una fecha ISO `YYYY-MM-DD` en español, estable respecto de la zona
    horaria (`timeZone: "UTC"` evita el corrimiento de un día). Si el parseo
    falla, devuelve el string crudo. */
export function formatearFecha(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeZone: "UTC" }).format(d);
}
