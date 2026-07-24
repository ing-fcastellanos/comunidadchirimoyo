/* types.ts — contrato de una inscripción de voluntario para el admin
   (voluntarios-suscripcion-panel-admin). Espejo parcial de
   services/api/app/models/inscripcion.py (mismos campos que persiste el API);
   el admin nunca escribe estos campos de inscripción, solo los lee y alterna
   `suscrito`. */

export interface Voluntario {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  jornada: string;
  acompanantes: number;
  /** ISO. Ausente en documentos muy viejos (antes de este cambio) — se trata como "" en la UI. */
  creadoEn: string;
  /** Ausente = no suscrito (D2, design.md): las inscripciones previas a este
      cambio nunca se migran retroactivamente. */
  suscrito: boolean;
}

export interface Contacto {
  id: string;
  /** Email del usuario admin que registró el contacto. */
  quien: string;
  /** ISO. */
  fecha: string;
  nota: string;
}

export type FiltroSuscripcion = "todos" | "suscritos" | "no-suscritos";
export type FiltroContacto = "todos" | "contactados" | "sin-contactar";

export interface FiltrosVoluntarios {
  jornada?: string;
  suscripcion: FiltroSuscripcion;
  contacto: FiltroContacto;
}
