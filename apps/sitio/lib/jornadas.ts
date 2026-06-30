/* jornadas.ts — loader SERVER-ONLY de las jornadas de voluntariado
   (content/jornadas/jornadas.json). Las jornadas son CONTENIDO en repo
   (ADR-0004); NO se gestionan en el API (ADR-0006, mínimo). Las recurrentes se
   definen por regla y este módulo las expande a las PRÓXIMAS ocurrencias
   relativas a hoy; los eventos son puntuales. Importa node:fs → solo server. */
import { readFile } from "node:fs/promises";
import path from "node:path";

import { CONTENT_ROOT } from "@/lib/landing";

export type TipoJornada = "limpieza" | "pajareada" | "evento";

interface Base {
  slug: string;
  titulo: string;
  tipo: TipoJornada;
  hora: string;
  lugar?: string;
  inscripcion?: boolean;
  descripcion?: string;
}

type Recurrencia =
  | { tipo: "semanal"; dia: string }
  | { tipo: "mensual-ordinal"; dia: string; ordinales: number[] };

export interface JornadaRecurrente extends Base {
  recurrencia: Recurrencia;
}
export interface EventoJornada extends Base {
  /** ISO `YYYY-MM-DD`. */
  fecha: string;
}

interface JornadasData {
  recurrentes?: JornadaRecurrente[];
  eventos?: EventoJornada[];
}

/** Una ocurrencia concreta (jornada con su fecha resuelta). */
export interface Ocurrencia extends Base {
  /** Fecha+hora de la ocurrencia. */
  fecha: Date;
}

const JORNADAS_JSON = path.join(CONTENT_ROOT, "jornadas", "jornadas.json");

/** Lee el contenido curado de jornadas. */
export async function getJornadas(): Promise<JornadasData> {
  try {
    return JSON.parse(await readFile(JORNADAS_JSON, "utf8")) as JornadasData;
  } catch {
    return {};
  }
}

/* ---------- helpers de fechas (puros) ---------- */

const DIAS: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miercoles: 3, "miércoles": 3,
  jueves: 4, viernes: 5, sabado: 6, "sábado": 6,
};

/** Índice JS (domingo=0…sábado=6) de un día en español, o -1 si no existe. */
export function diaIndice(nombre: string): number {
  return DIAS[nombre.trim().toLowerCase()] ?? -1;
}

function aMedianoche(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function conHora(base: Date, hora: string): Date {
  const [h, m] = (hora || "00:00").split(":").map((n) => parseInt(n, 10));
  const x = new Date(base);
  x.setHours(Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0, 0, 0);
  return x;
}

/** Fecha del `ordinal`-ésimo `diaIdx` (0..6) del mes `mes0` (0-based) de `anio`,
    o null si ese mes no tiene tantos (p. ej. un 5º sábado inexistente). */
export function nEsimoDiaDelMes(anio: number, mes0: number, diaIdx: number, ordinal: number): Date | null {
  const primero = new Date(anio, mes0, 1);
  const offset = (diaIdx - primero.getDay() + 7) % 7; // días hasta el primer diaIdx
  const dia = 1 + offset + (ordinal - 1) * 7;
  const fecha = new Date(anio, mes0, dia);
  return fecha.getMonth() === mes0 ? fecha : null;
}

/** Próximas jornadas (ocurrencias) desde `desde` (default hoy), dentro de una
    ventana de `dias`, ordenadas por fecha+hora y acotadas a `max`. Excluye las
    de días pasados. */
export function proximasJornadas(
  data: JornadasData,
  desde: Date = new Date(),
  dias = 60,
  max = 6,
): Ocurrencia[] {
  const inicio = aMedianoche(desde);
  const fin = aMedianoche(new Date(inicio.getTime() + dias * 86400000));
  const ocurrencias: Ocurrencia[] = [];

  const empuja = (b: Base, fecha: Date) => {
    const dia = aMedianoche(fecha);
    if (dia < inicio || dia > fin) return;
    ocurrencias.push({ ...b, inscripcion: b.inscripcion ?? true, fecha: conHora(dia, b.hora) });
  };

  for (const r of data.recurrentes ?? []) {
    const idx = diaIndice(r.recurrencia.dia);
    if (idx < 0) continue;
    if (r.recurrencia.tipo === "semanal") {
      for (let t = new Date(inicio); aMedianoche(t) <= fin; t.setDate(t.getDate() + 1)) {
        if (t.getDay() === idx) empuja(r, new Date(t));
      }
    } else {
      // mensual-ordinal: recorre los meses tocados por la ventana
      const cursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
      while (cursor <= fin) {
        for (const ord of r.recurrencia.ordinales) {
          const f = nEsimoDiaDelMes(cursor.getFullYear(), cursor.getMonth(), idx, ord);
          if (f) empuja(r, f);
        }
        cursor.setMonth(cursor.getMonth() + 1);
      }
    }
  }

  for (const e of data.eventos ?? []) {
    const [y, mo, d] = (e.fecha || "").split("-").map((n) => parseInt(n, 10));
    if (!y || !mo || !d) continue;
    empuja(e, new Date(y, mo - 1, d));
  }

  return ocurrencias.sort((a, b) => a.fecha.getTime() - b.fecha.getTime()).slice(0, max);
}

/** Etiqueta corta de una ocurrencia para las opciones del select del formulario. */
export function etiquetaOcurrencia(o: Ocurrencia): string {
  const fecha = new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short" }).format(o.fecha);
  return `${o.titulo} — ${fecha}${o.hora ? `, ${o.hora}` : ""}`;
}
