/* noticias-db.ts — LECTURA de noticias desde Firestore (Fase 6, #134).
   Fuente de verdad: colección `noticias`, doc ID = slug (capability OpenSpec
   `contenido-dinamico`, ADR-0028). Server-only (usa lib/firestore.ts, que es
   Node-only). Devuelve los MISMOS tipos que lib/noticias.ts para que las páginas
   (#136) cambien lo mínimo al pasar del loader de archivos a este.

   Los campos de sistema (createdAt/updatedAt/publishedAt) no se exponen: el
   sitio solo necesita la vista editorial. `portada` guarda la ruta relativa al
   bucket y se resuelve con mediaUrl(), igual que en el loader de archivos. */
import type { DocumentData } from "firebase-admin/firestore";

import { getDb } from "./firestore";
import { mediaUrl } from "./landing";
import type { Noticia, NoticiaMeta } from "./noticias";

const COLECCION = "noticias";

/** ¿Producción? En prod se ocultan los borradores (igual que el loader fs). */
function esProd(): boolean {
  return process.env.NODE_ENV === "production";
}

/** String no vacío o null (tolerante a campos ausentes del documento). */
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
    portada: mediaUrl(str(d.portada)),
    portadaAlt: str(d.portadaAlt),
    estado,
    tags,
  };
}

/** Lista las noticias por `fecha` descendente. En producción solo publicadas
    (consulta `estado == "publicado"` + orden, servida por el índice compuesto de
    firestore.indexes.json); en desarrollo incluye borradores para previsualizar. */
export async function getAllNoticiasDb(): Promise<NoticiaMeta[]> {
  const col = getDb().collection(COLECCION);
  const q = esProd()
    ? col.where("estado", "==", "publicado").orderBy("fecha", "desc")
    : col.orderBy("fecha", "desc");
  const snap = await q.get();
  return snap.docs.map((doc) => aMeta(doc.id, doc.data()));
}

/** Una noticia por slug (con su cuerpo markdown), o null si no existe. En
    producción, un borrador se trata como inexistente. */
export async function getNoticiaDb(slug: string): Promise<Noticia | null> {
  const doc = await getDb().collection(COLECCION).doc(slug).get();
  if (!doc.exists) return null;
  const d = doc.data() as DocumentData;
  const meta = aMeta(doc.id, d);
  if (esProd() && meta.estado !== "publicado") return null;
  return { ...meta, cuerpo: str(d.cuerpo) ?? "" };
}
