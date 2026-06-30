/* inscripcion-validacion.ts — reglas de validación del formulario de inscripción
   de voluntarios. Fuente única compartida por el Client Component (UX inmediata)
   y el Server Action (revalidación). Espejan las reglas del backend
   (services/api, #21): nombre ≤120, correo con formato, telefono opcional,
   jornada opcional ≤160, acompañantes entero 0..20, consentimiento obligatorio.
   El API sigue siendo la autoridad final. */

export const LIMITES = {
  nombre: 120,
  telefono: 40,
  jornada: 160,
  acompanantesMax: 20,
} as const;

export type CamposInscripcion = {
  nombre: string;
  correo: string;
  /** Opcional. */
  telefono: string;
  /** Opcional, texto libre (no hay modelo de jornadas todavía). */
  jornada: string;
  /** Opcional, como valor de input (string numérica) — el backend lo coacciona. */
  acompanantes: string;
  consent: boolean;
  /** Honeypot anti-spam. Vacío en envíos legítimos. */
  website: string;
};

export type CampoConError = "nombre" | "correo" | "telefono" | "jornada" | "acompanantes" | "consent";
export type ErroresInscripcion = Partial<Record<CampoConError, string>>;

const CORREO_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEL_RE = /^[0-9+()\-\s]+$/;

export const VALORES_VACIOS: CamposInscripcion = {
  nombre: "",
  correo: "",
  telefono: "",
  jornada: "",
  acompanantes: "",
  consent: false,
  website: "",
};

/** Devuelve solo los campos inválidos con su mensaje. Vacío = todo válido. */
export function validarInscripcion(v: CamposInscripcion): ErroresInscripcion {
  const e: ErroresInscripcion = {};

  if (!v.nombre.trim()) e.nombre = "Escribe tu nombre.";
  else if (v.nombre.trim().length > LIMITES.nombre)
    e.nombre = `El nombre no puede pasar de ${LIMITES.nombre} caracteres.`;

  if (!v.correo.trim()) e.correo = "Escribe tu correo.";
  else if (!CORREO_RE.test(v.correo.trim())) e.correo = "El correo no es válido.";

  const tel = v.telefono.trim();
  if (tel && (tel.length > LIMITES.telefono || !TEL_RE.test(tel)))
    e.telefono = "El teléfono no es válido.";

  if (v.jornada.trim().length > LIMITES.jornada)
    e.jornada = `Usa como máximo ${LIMITES.jornada} caracteres.`;

  const ac = v.acompanantes.trim();
  if (ac) {
    if (!/^\d+$/.test(ac) || Number(ac) > LIMITES.acompanantesMax)
      e.acompanantes = `Indica un número entre 0 y ${LIMITES.acompanantesMax}.`;
  }

  if (!v.consent) e.consent = "Debes aceptar el aviso de privacidad para continuar.";

  return e;
}
