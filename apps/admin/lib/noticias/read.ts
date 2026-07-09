/* read.ts — lectura de noticias para el admin (#140). A diferencia de
   apps/sitio/lib/noticias-db.ts: (1) siempre incluye TODOS los estados (el
   panel necesita ver y editar borradores, no solo lo publicado); (2) NO
   resuelve `portada` con mediaUrl — el admin edita/persiste la ruta relativa
   cruda tal cual se guarda en Firestore (ver design.md D7). Server-only. */
import type { DocumentData } from "firebase-admin/firestore";

import { getDb } from "../firestore";
import type { Noticia, NoticiaMeta } from "./types";

const COLECCION = "noticias";

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function aMeta(id: string, d: DocumentData): NoticiaMeta {
  const estado = d.estado === "publicado" ? "publicado" : "borrador";
  const tags = Array.isArray(d.tags)
    ? d.tags.filter((t: unknown): t is string => typeof t === "string")
    : [];
  return {
    titulo: str(d.titulo) ?? "(sin título)",
    slug: str(d.slug) ?? id,
    fecha: str(d.fecha) ?? "",
    resumen: str(d.resumen) ?? "",
    autor: str(d.autor),
    portada: str(d.portada),
    portadaAlt: str(d.portadaAlt),
    estado,
    tags,
  };
}

/** Todas las noticias (borrador + publicado), por `fecha` descendente. */
export async function getAllNoticiasAdmin(): Promise<NoticiaMeta[]> {
  const snap = await getDb().collection(COLECCION).orderBy("fecha", "desc").get();
  return snap.docs.map((doc) => aMeta(doc.id, doc.data()));
}

/** Una noticia por slug (con cuerpo), o null si no existe. Sin filtrar por estado. */
export async function getNoticiaAdmin(slug: string): Promise<Noticia | null> {
  const doc = await getDb().collection(COLECCION).doc(slug).get();
  if (!doc.exists) return null;
  const d = doc.data() as DocumentData;
  return { ...aMeta(doc.id, d), cuerpo: str(d.cuerpo) ?? "" };
}

/** ¿Existe ya un documento con este slug? Para el chequeo de unicidad al crear. */
export async function existeNoticia(slug: string): Promise<boolean> {
  const doc = await getDb().collection(COLECCION).doc(slug).get();
  return doc.exists;
}
