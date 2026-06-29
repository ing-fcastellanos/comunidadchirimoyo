/* noticias.ts — loader SERVER-ONLY de las notas de comunidad (content/noticias/).
   Lee y tipa cada <slug>.md (frontmatter + cuerpo markdown) en build. Importa
   node:fs/path → NO importar desde Client Components (solo los TIPOS son seguros
   en cliente). El cuerpo se renderiza con components/ui/Markdown.tsx (ADR-0026).

   Fuente de verdad: content/noticias/ (ADR-0004). Las imágenes viven en el bucket
   de comunidad (ADR-0021). Las notas son contenido PÚBLICO: sin PII. */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

import { CONTENT_ROOT, mediaUrl } from "@/lib/landing";

export const NOTICIAS_DIR = path.join(CONTENT_ROOT, "noticias");

export type EstadoNota = "borrador" | "publicado";

/** Metadatos de una nota (sin el cuerpo) — para listados, OG, etc. */
export interface NoticiaMeta {
  titulo: string;
  slug: string;
  /** Fecha ISO (YYYY-MM-DD). */
  fecha: string;
  resumen: string;
  autor: string | null;
  /** URL de la portada ya resuelta (bucket), o null. */
  portada: string | null;
  portadaAlt: string | null;
  estado: EstadoNota;
  tags: string[];
}

/** Nota completa: metadatos + cuerpo markdown crudo (lo renderiza la página). */
export interface Noticia extends NoticiaMeta {
  cuerpo: string;
}

/** Normaliza a string no vacío o null (campos opcionales del frontmatter). */
function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

/** ¿Estamos en producción? En prod se ocultan los borradores. */
function esProd(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Normaliza `fecha` a ISO `YYYY-MM-DD`. YAML parsea una fecha sin comillas
    (`fecha: 2026-05-18`) como `Date`, no como string; aquí toleramos ambos. */
function fechaIso(v: unknown): string {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0, 10);
  return str(v) ?? "";
}

function aMeta(data: Record<string, unknown>, slugArchivo: string): NoticiaMeta {
  const estado: EstadoNota = data.estado === "publicado" ? "publicado" : "borrador";
  const tags = Array.isArray(data.tags)
    ? data.tags.filter((t): t is string => typeof t === "string")
    : [];
  return {
    titulo: str(data.titulo) ?? "(sin título)",
    slug: str(data.slug) ?? slugArchivo,
    fecha: fechaIso(data.fecha),
    resumen: str(data.resumen) ?? "",
    autor: str(data.autor),
    portada: mediaUrl(str(data.portada)),
    portadaAlt: str(data.portadaAlt),
    estado,
    tags,
  };
}

/** Lista las notas, ordenadas por fecha descendente. En producción excluye las
    de estado `borrador`; en desarrollo se incluyen para previsualizar. */
export async function getAllNoticias(): Promise<NoticiaMeta[]> {
  let entradas: string[];
  try {
    entradas = await readdir(NOTICIAS_DIR);
  } catch {
    return []; // la carpeta aún no existe
  }

  const metas: NoticiaMeta[] = [];
  for (const nombre of entradas) {
    if (!nombre.endsWith(".md") || nombre.startsWith("_") || nombre === "README.md") continue;
    const raw = await readFile(path.join(NOTICIAS_DIR, nombre), "utf8");
    const { data } = matter(raw);
    metas.push(aMeta(data, nombre.replace(/\.md$/, "")));
  }

  return metas
    .filter((n) => !esProd() || n.estado === "publicado")
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/** Devuelve una nota por slug (con su cuerpo markdown), o null si no existe. */
export async function getNoticia(slug: string): Promise<Noticia | null> {
  let raw: string;
  try {
    raw = await readFile(path.join(NOTICIAS_DIR, `${slug}.md`), "utf8");
  } catch {
    return null;
  }
  const { data, content } = matter(raw);
  return { ...aMeta(data, slug), cuerpo: content.trim() };
}
