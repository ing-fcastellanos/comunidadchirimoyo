/* contacto-validacion.ts — reglas de validación del formulario de contacto.
   Fuente única compartida por el Client Component (UX inmediata) y el Server
   Action (revalidación). Espejan las reglas del backend (services/api, #46):
   nombre ≤120, correo con formato, asunto ≤160, mensaje ≤5000 (mín. 10),
   consentimiento obligatorio. El API sigue siendo la autoridad final. */

export const LIMITES = {
  nombre: 120,
  asunto: 160,
  mensaje: 5000,
  mensajeMin: 10,
} as const;

export type CamposContacto = {
  nombre: string;
  correo: string;
  asunto: string;
  mensaje: string;
  consent: boolean;
  /** Honeypot anti-spam. Vacío en envíos legítimos. */
  website: string;
};

export type CampoConError = "nombre" | "correo" | "asunto" | "mensaje" | "consent";
export type ErroresContacto = Partial<Record<CampoConError, string>>;

const CORREO_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const VALORES_VACIOS: CamposContacto = {
  nombre: "",
  correo: "",
  asunto: "",
  mensaje: "",
  consent: false,
  website: "",
};

/** Devuelve solo los campos inválidos con su mensaje. Vacío = todo válido. */
export function validarContacto(v: CamposContacto): ErroresContacto {
  const e: ErroresContacto = {};

  if (!v.nombre.trim()) e.nombre = "Escribe tu nombre.";
  else if (v.nombre.trim().length > LIMITES.nombre)
    e.nombre = `El nombre no puede pasar de ${LIMITES.nombre} caracteres.`;

  if (!v.correo.trim()) e.correo = "Escribe tu correo.";
  else if (!CORREO_RE.test(v.correo.trim())) e.correo = "El correo no es válido.";

  if (!v.asunto.trim()) e.asunto = "Escribe un asunto.";
  else if (v.asunto.trim().length > LIMITES.asunto)
    e.asunto = `El asunto no puede pasar de ${LIMITES.asunto} caracteres.`;

  if (!v.mensaje.trim()) e.mensaje = "Escribe tu mensaje.";
  else if (v.mensaje.trim().length < LIMITES.mensajeMin)
    e.mensaje = "Cuéntanos un poco más (mínimo 10 caracteres).";
  else if (v.mensaje.trim().length > LIMITES.mensaje)
    e.mensaje = `El mensaje no puede pasar de ${LIMITES.mensaje} caracteres.`;

  if (!v.consent) e.consent = "Debes aceptar el aviso de privacidad para continuar.";

  return e;
}
