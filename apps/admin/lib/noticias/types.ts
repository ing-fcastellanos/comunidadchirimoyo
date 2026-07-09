/* types.ts — contrato de una noticia (#140). Mismos campos que
   apps/sitio/lib/noticias.ts (fuente de verdad del esquema, ADR-0028); se
   duplica por copia (ADR-0001, sin tooling de monorepo) en vez de un paquete
   compartido. `portada` aquí es la RUTA RELATIVA cruda del bucket (sin
   resolver con mediaUrl): el admin edita y persiste la ruta, la resolución a
   URL pública es responsabilidad del lector del sitio. */

export type EstadoNota = "borrador" | "publicado";

/** Metadatos editoriales de una noticia (sin el cuerpo). */
export interface NoticiaMeta {
  titulo: string;
  slug: string;
  /** Fecha ISO (YYYY-MM-DD), editorial. */
  fecha: string;
  resumen: string;
  autor: string | null;
  /** Ruta relativa en el bucket de comunidad (ADR-0021), sin resolver. */
  portada: string | null;
  portadaAlt: string | null;
  estado: EstadoNota;
  tags: string[];
}

/** Noticia completa: metadatos + cuerpo markdown crudo. */
export interface Noticia extends NoticiaMeta {
  cuerpo: string;
}

/** Campos editables de un formulario de creación/edición (sin slug en edición). */
export interface NoticiaFormInput {
  titulo: string;
  fecha: string;
  resumen: string;
  autor: string;
  portada: string;
  portadaAlt: string;
  tags: string;
  cuerpo: string;
}
