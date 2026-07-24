/* read.ts — lectura de voluntarios inscritos para el admin
   (voluntarios-suscripcion-panel-admin). Server-only, vía Firebase Admin SDK
   (deny-all para el client SDK, mismo patrón que noticias/jornadas). */
import type { DocumentData } from "firebase-admin/firestore";

import { getDb } from "../firestore";
import type { Contacto, FiltrosVoluntarios, Voluntario } from "./types";

const COLECCION = "voluntarios_inscripciones";

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function timestampIso(v: unknown): string {
  if (v && typeof v === "object" && "toDate" in v && typeof (v as { toDate: () => Date }).toDate === "function") {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  return "";
}

function aVoluntario(id: string, d: DocumentData): Voluntario {
  return {
    id,
    nombre: str(d.nombre),
    correo: str(d.correo),
    telefono: str(d.telefono),
    jornada: str(d.jornada),
    acompanantes: typeof d.acompanantes === "number" ? d.acompanantes : 0,
    creadoEn: timestampIso(d.creado_en),
    suscrito: d.suscrito === true,
  };
}

export interface VoluntarioConContactos extends Voluntario {
  totalContactos: number;
  /** ISO de la fecha del contacto más reciente, o null si nunca se contactó. */
  ultimoContacto: string | null;
}

/** Todos los voluntarios que coinciden con los filtros, con el conteo de
    contactos de cada uno (para la columna "Contacto" y el filtro homónimo).
    Sin paginación — volumen bajo, mismo criterio que noticias/jornadas. */
export async function getAllVoluntariosAdmin(
  filtros: FiltrosVoluntarios,
): Promise<VoluntarioConContactos[]> {
  const db = getDb();
  let query: FirebaseFirestore.Query = db.collection(COLECCION);
  if (filtros.suscripcion === "suscritos") query = query.where("suscrito", "==", true);
  if (filtros.suscripcion === "no-suscritos") query = query.where("suscrito", "==", false);

  const snap = await query.get();
  const voluntarios = snap.docs.map((doc) => aVoluntario(doc.id, doc.data()));

  const conContactos = await Promise.all(
    voluntarios.map(async (v) => {
      const contactosRef = db.collection(COLECCION).doc(v.id).collection("contactos");
      const [agg, ultimo] = await Promise.all([
        contactosRef.count().get(),
        contactosRef.orderBy("fecha", "desc").limit(1).get(),
      ]);
      const ultimoContacto = ultimo.empty ? null : timestampIso(ultimo.docs[0].data().fecha) || null;
      return { ...v, totalContactos: agg.data().count, ultimoContacto };
    }),
  );

  return conContactos.filter((v) => {
    if (filtros.jornada && v.jornada !== filtros.jornada) return false;
    if (filtros.contacto === "contactados" && v.totalContactos === 0) return false;
    if (filtros.contacto === "sin-contactar" && v.totalContactos > 0) return false;
    return true;
  });
}

/** Un voluntario por ID, o null si no existe. */
export async function getVoluntarioAdmin(id: string): Promise<Voluntario | null> {
  const doc = await getDb().collection(COLECCION).doc(id).get();
  if (!doc.exists) return null;
  return aVoluntario(doc.id, doc.data() as DocumentData);
}

/** Historial completo de contactos de un voluntario, más reciente primero. */
export async function getContactosVoluntario(id: string): Promise<Contacto[]> {
  const snap = await getDb()
    .collection(COLECCION)
    .doc(id)
    .collection("contactos")
    .orderBy("fecha", "desc")
    .get();

  return snap.docs.map((doc) => {
    const d = doc.data();
    return { id: doc.id, quien: str(d.quien), fecha: timestampIso(d.fecha), nota: str(d.nota) };
  });
}
