/* read.ts — lectura de jornadas para el admin (#141). Espejo de
   apps/admin/lib/noticias/read.ts, pero sin ningún concepto de estado: toda
   jornada en la colección está siempre vigente (design.md D3). Server-only. */
import type { DocumentData } from "firebase-admin/firestore";

import { getDb } from "../firestore";
import type { Jornada, Recurrencia } from "./types";

const COLECCION = "jornadas";

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function aJornada(id: string, d: DocumentData): Jornada | null {
  const base = {
    slug: str(d.slug) || id,
    titulo: str(d.titulo),
    tipo: str(d.tipo) as Jornada["tipo"],
    hora: str(d.hora),
    lugar: str(d.lugar) || undefined,
    inscripcion: typeof d.inscripcion === "boolean" ? d.inscripcion : undefined,
    descripcion: str(d.descripcion) || undefined,
  };

  if (d.kind === "recurrente" && d.recurrencia) {
    return { ...base, kind: "recurrente", recurrencia: d.recurrencia as Recurrencia };
  }
  if (d.kind === "evento" && str(d.fecha)) {
    return { ...base, kind: "evento", fecha: str(d.fecha) };
  }
  return null; // kind desconocido o datos incompletos: se ignora, igual que jornadas-db.ts del sitio
}

/** Todas las jornadas (recurrentes + eventos), sin orden particular (la lista
    del admin las agrupa/ordena en cliente si hace falta). */
export async function getAllJornadasAdmin(): Promise<Jornada[]> {
  const snap = await getDb().collection(COLECCION).get();
  const jornadas: Jornada[] = [];
  for (const doc of snap.docs) {
    const j = aJornada(doc.id, doc.data());
    if (j) jornadas.push(j);
  }
  return jornadas;
}

/** Una jornada por slug, o null si no existe. */
export async function getJornadaAdmin(slug: string): Promise<Jornada | null> {
  const doc = await getDb().collection(COLECCION).doc(slug).get();
  if (!doc.exists) return null;
  return aJornada(doc.id, doc.data() as DocumentData);
}

/** ¿Existe ya un documento con este slug? Para el chequeo de unicidad al crear. */
export async function existeJornada(slug: string): Promise<boolean> {
  const doc = await getDb().collection(COLECCION).doc(slug).get();
  return doc.exists;
}
