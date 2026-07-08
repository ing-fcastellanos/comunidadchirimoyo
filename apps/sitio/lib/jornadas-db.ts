/* jornadas-db.ts — LECTURA de jornadas desde Firestore (Fase 6, #134).
   Colección única `jornadas` con discriminador `kind` (`recurrente`|`evento`),
   doc ID = slug (capability `contenido-dinamico`, ADR-0028). Server-only.

   Devuelve la MISMA forma `{ recurrentes, eventos }` que produce lib/jornadas.ts,
   de modo que `proximasJornadas()` y las páginas (#137) no cambian: la expansión
   de la recurrencia a fechas se queda en el front; Firestore guarda solo la regla. */
import type { DocumentData } from "firebase-admin/firestore";

import { getDb } from "./firestore";
import type { EventoJornada, JornadaRecurrente, TipoJornada } from "./jornadas";

const COLECCION = "jornadas";

/** Misma forma que el `JornadasData` (interno) de lib/jornadas.ts. */
export interface JornadasData {
  recurrentes: JornadaRecurrente[];
  eventos: EventoJornada[];
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function base(id: string, d: DocumentData) {
  return {
    slug: str(d.slug) || id,
    titulo: str(d.titulo),
    tipo: (str(d.tipo) || "evento") as TipoJornada,
    hora: str(d.hora),
    lugar: str(d.lugar) || undefined,
    inscripcion: typeof d.inscripcion === "boolean" ? d.inscripcion : undefined,
    descripcion: str(d.descripcion) || undefined,
  };
}

/** Lee la colección `jornadas` y la separa por `kind` en la forma que el front
    espera. Documentos con `kind` desconocido se ignoran. */
export async function getJornadasDb(): Promise<JornadasData> {
  const snap = await getDb().collection(COLECCION).get();
  const recurrentes: JornadaRecurrente[] = [];
  const eventos: EventoJornada[] = [];

  for (const doc of snap.docs) {
    const d = doc.data() as DocumentData;
    if (d.kind === "recurrente" && d.recurrencia) {
      recurrentes.push({ ...base(doc.id, d), recurrencia: d.recurrencia as JornadaRecurrente["recurrencia"] });
    } else if (d.kind === "evento" && str(d.fecha)) {
      eventos.push({ ...base(doc.id, d), fecha: str(d.fecha) });
    }
  }

  return { recurrentes, eventos };
}
