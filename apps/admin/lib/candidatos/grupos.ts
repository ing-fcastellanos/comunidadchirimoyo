/* grupos.ts — corte de fecha por grupo de WhatsApp
   (`candidatos_grupos/{grupoId}.ultimoCorte`). Server-only (usa Firestore) —
   el catálogo puro de grupos (`getGrupos`/`getGrupo`, seguro para Client
   Components) vive en ./types.ts, NO aquí. El documento de corte se crea de
   forma perezosa en la primera subida de un grupo (`set({merge:true})`) — no
   requiere un seed previo. */
import { getDb } from "../firestore";

const COLECCION = "candidatos_grupos";

/** Corte de fecha ya procesado para un grupo, o `null` si nunca se procesó
    nada (primera subida: se analizan todos los mensajes del export). */
export async function getUltimoCorte(grupoId: string): Promise<Date | null> {
  const doc = await getDb().collection(COLECCION).doc(grupoId).get();
  const valor = doc.data()?.ultimoCorte;
  if (valor && typeof valor.toDate === "function") return valor.toDate();
  return null;
}

/** Actualiza el corte de un grupo tras un análisis exitoso, a la fecha del
    mensaje más reciente incluido en ese lote. */
export async function actualizarUltimoCorte(grupoId: string, fecha: Date): Promise<void> {
  await getDb().collection(COLECCION).doc(grupoId).set({ ultimoCorte: fecha }, { merge: true });
}
