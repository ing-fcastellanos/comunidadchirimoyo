/* types.ts — contrato de una jornada (#141). Mismos campos que
   apps/sitio/lib/jornadas.ts (fuente de verdad del esquema, ADR-0028); se
   duplica por copia (ADR-0001, sin tooling de monorepo) en vez de un paquete
   compartido. `kind` es el discriminador de la colección Firestore
   `jornadas` (una sola colección, no dos) — ver contenido-dinamico. */

export type TipoJornada = "limpieza" | "pajareada" | "evento";

/** `dia` en español, minúsculas, sin acentos (coincide con content/jornadas/README.md). */
export type DiaSemana =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

export type Recurrencia =
  | { tipo: "semanal"; dia: DiaSemana }
  | { tipo: "mensual-ordinal"; dia: DiaSemana; ordinales: number[] };

interface JornadaBase {
  slug: string;
  titulo: string;
  tipo: TipoJornada;
  hora: string;
  lugar?: string;
  inscripcion?: boolean;
  descripcion?: string;
}

export interface JornadaRecurrente extends JornadaBase {
  kind: "recurrente";
  recurrencia: Recurrencia;
}

export interface EventoJornada extends JornadaBase {
  kind: "evento";
  /** Fecha ISO (YYYY-MM-DD). */
  fecha: string;
}

export type Jornada = JornadaRecurrente | EventoJornada;

/** Campos editables de un formulario de creación/edición (sin slug ni kind en edición). */
export interface JornadaFormInput {
  titulo: string;
  tipo: TipoJornada | "";
  hora: string;
  lugar: string;
  inscripcion: boolean;
  descripcion: string;
  kind: "recurrente" | "evento" | "";
  recurrenciaTipo: "semanal" | "mensual-ordinal" | "";
  dia: DiaSemana | "";
  ordinales: number[];
  fecha: string;
}
