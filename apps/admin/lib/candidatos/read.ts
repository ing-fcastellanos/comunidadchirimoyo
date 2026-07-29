/* read.ts — lectura de candidatos para el admin (candidatos-admin). Server-only
   vía Firebase Admin SDK (deny-all para el client SDK, mismo patrón que
   noticias/jornadas/voluntarios). */
import type { DocumentData } from "firebase-admin/firestore";

import { getDb } from "../firestore";
import type { Candidato, Confianza, EstadoCandidato, TipoCandidato, TonoNoticia } from "./types";

const COLECCION = "candidatos";

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function timestampIso(v: unknown): string | null {
  if (v && typeof v === "object" && "toDate" in v && typeof (v as { toDate: () => Date }).toDate === "function") {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
}

function aCandidato(id: string, d: DocumentData): Candidato {
  return {
    id,
    grupoId: str(d.grupoId),
    grupoNombre: str(d.grupoNombre),
    tipo: d.tipo as TipoCandidato,
    resumen: str(d.resumen),
    fechaMensaje: typeof d.fechaMensaje === "string" ? d.fechaMensaje : null,
    confianza: (d.confianza as Confianza) ?? "media",
    estado: (d.estado as EstadoCandidato) ?? "pendiente",
    tono: (d.tono as TonoNoticia | null) ?? null,
    redaccion: typeof d.redaccion === "string" ? d.redaccion : null,
    creadoEn: timestampIso(d.creadoEn) ?? "",
    revisadoEn: timestampIso(d.revisadoEn),
  };
}

export interface FiltrosCandidatos {
  tipo?: TipoCandidato | "todos";
  grupoId?: string | "todos";
  estado?: EstadoCandidato | "todos";
  /** 1-indexado. */
  pagina?: number;
}

export const TAMANO_PAGINA_CANDIDATOS = 20;

export interface PaginaCandidatos {
  candidatos: Candidato[];
  paginaActual: number;
  totalPaginas: number;
  total: number;
}

/** Candidatos que coinciden con los filtros, paginados (más recientes
    primero). A diferencia de noticias/jornadas/voluntarios (volumen bajo,
    sin paginación), candidatos puede acumular cientos por grupo tras varias
    subidas — sí pagina. */
export async function getAllCandidatosAdmin(filtros: FiltrosCandidatos = {}): Promise<PaginaCandidatos> {
  const db = getDb();
  let query: FirebaseFirestore.Query = db.collection(COLECCION);
  if (filtros.tipo && filtros.tipo !== "todos") query = query.where("tipo", "==", filtros.tipo);
  if (filtros.grupoId && filtros.grupoId !== "todos") query = query.where("grupoId", "==", filtros.grupoId);
  if (filtros.estado && filtros.estado !== "todos") query = query.where("estado", "==", filtros.estado);

  const conteo = await query.count().get();
  const total = conteo.data().count;
  const totalPaginas = Math.max(1, Math.ceil(total / TAMANO_PAGINA_CANDIDATOS));
  const paginaActual = Math.min(Math.max(1, Math.trunc(filtros.pagina ?? 1) || 1), totalPaginas);

  const snap = await query
    .orderBy("creadoEn", "desc")
    .offset((paginaActual - 1) * TAMANO_PAGINA_CANDIDATOS)
    .limit(TAMANO_PAGINA_CANDIDATOS)
    .get();

  return {
    candidatos: snap.docs.map((doc) => aCandidato(doc.id, doc.data())),
    paginaActual,
    totalPaginas,
    total,
  };
}

/** Un candidato por ID, o `null` si no existe. */
export async function getCandidatoAdmin(id: string): Promise<Candidato | null> {
  const doc = await getDb().collection(COLECCION).doc(id).get();
  if (!doc.exists) return null;
  return aCandidato(doc.id, doc.data() as DocumentData);
}
