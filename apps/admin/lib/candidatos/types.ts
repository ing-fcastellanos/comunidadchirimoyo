/* types.ts — contrato de un candidato extraído de WhatsApp (candidatos-admin).
   Los 3 grupos de origen son una constante de código (D2/D9 del design.md —
   sin UI de administración de grupos en esta primera versión): el único dato
   de un grupo que vive en Firestore es su corte de fecha
   (`candidatos_grupos/{grupoId}.ultimoCorte`, ver grupos.ts), para no
   reprocesar mensajes ya analizados en una subida anterior. */

export type TipoCandidato = "noticia" | "jornada" | "evento" | "logro" | "aliado";
export type EstadoCandidato = "pendiente" | "aprobado" | "descartado";
export type Confianza = "alta" | "media" | "baja";
export type TonoNoticia =
  | "informativo"
  | "convocatoria"
  | "celebratorio"
  | "urgente"
  | "divulgativo"
  | "agradecimiento";

export interface GrupoWhatsapp {
  id: string;
  nombre: string;
}

/** Los 3 grupos de WhatsApp de la comunidad (constante de código, D2/D9 del
    design.md — sin UI de administración de grupos en esta primera versión).
    `id` es el que persiste en Firestore; `nombre` puede cambiar libremente
    después sin migrar datos. */
export const GRUPOS_WHATSAPP: readonly GrupoWhatsapp[] = [
  { id: "grupo-1", nombre: "Voluntarios del Chirimoyo" },
  { id: "grupo-2", nombre: "Organización interna Chirimoyo" },
  { id: "grupo-3", nombre: "Abogados chirimoyo" },
];

/** Catálogo puro (sin Firestore) — a diferencia de lib/candidatos/grupos.ts,
    seguro de importar desde un Client Component (SubirExportForm, FiltrosBar). */
export function getGrupos(): readonly GrupoWhatsapp[] {
  return GRUPOS_WHATSAPP;
}

export function getGrupo(grupoId: string): GrupoWhatsapp | null {
  return GRUPOS_WHATSAPP.find((g) => g.id === grupoId) ?? null;
}

/** Catálogo fijo de tonos de redacción para candidatos de tipo noticia
    (D6 del proposal — se elige al interactuar con el candidato, no antes). */
export const TONOS: ReadonlyArray<{ id: TonoNoticia; etiqueta: string; descripcion: string }> = [
  { id: "informativo", etiqueta: "Informativo", descripcion: "Reporta los hechos con neutralidad, sin editorializar." },
  { id: "convocatoria", etiqueta: "Convocatoria", descripcion: "Invita a la comunidad a participar en una actividad." },
  { id: "celebratorio", etiqueta: "Celebratorio", descripcion: "Resalta un logro o reconocimiento con tono positivo." },
  { id: "urgente", etiqueta: "Urgente / denuncia", descripcion: "Alerta sobre una amenaza o agresión al humedal, con tono de urgencia." },
  { id: "divulgativo", etiqueta: "Divulgativo", descripcion: "Explica o educa sobre un tema con lenguaje accesible." },
  { id: "agradecimiento", etiqueta: "Agradecimiento", descripcion: "Reconoce públicamente a personas o aliados por su apoyo." },
];

export interface Candidato {
  id: string;
  grupoId: string;
  /** Denormalizado al crear el candidato, para no hacer join al listar. */
  grupoNombre: string;
  tipo: TipoCandidato;
  /** Resumen/extracto generado por la IA — nunca el mensaje original completo. */
  resumen: string;
  /** Fecha ISO (YYYY-MM-DD) del mensaje origen, si la IA la identificó. */
  fechaMensaje: string | null;
  confianza: Confianza;
  estado: EstadoCandidato;
  /** Solo se llena si `tipo === "noticia"` y ya se redactó (fase 2). */
  tono: TonoNoticia | null;
  redaccion: string | null;
  /** ISO, resuelto desde el Timestamp de servidor. */
  creadoEn: string;
  revisadoEn: string | null;
}
