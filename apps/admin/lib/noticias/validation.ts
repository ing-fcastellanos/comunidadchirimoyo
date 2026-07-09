/* validation.ts — validación server-side manual de los campos editoriales de
   una noticia (#140, D10). Sin zod/yup: sigue la convención actual del repo
   (ninguna librería de validación en ningún package.json todavía). */
import type { NoticiaFormInput } from "./types";

const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;
const TAG_KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export interface ValidacionResultado {
  ok: boolean;
  errores: Partial<Record<keyof NoticiaFormInput, string>>;
}

/** Parsea el textarea de tags (una etiqueta por línea o separadas por coma). */
export function parseTags(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Valida los campos de un formulario de creación/edición de noticia. No toca
    Firestore: solo forma. La unicidad del slug se valida aparte (requiere una
    lectura), ver actions.ts. */
export function validarNoticia(input: NoticiaFormInput): ValidacionResultado {
  const errores: ValidacionResultado["errores"] = {};

  if (!input.titulo.trim()) {
    errores.titulo = "El título es obligatorio.";
  }

  if (!input.resumen.trim()) {
    errores.resumen = "El resumen es obligatorio.";
  }

  if (!FECHA_ISO.test(input.fecha)) {
    errores.fecha = "La fecha debe tener el formato ISO AAAA-MM-DD.";
  }

  const tags = parseTags(input.tags);
  if (tags.some((t) => !TAG_KEBAB.test(t))) {
    errores.tags = "Las etiquetas deben ir en minúsculas y kebab-case (ej. jornada-limpieza).";
  }

  if (input.portada.trim() && !input.portadaAlt.trim()) {
    errores.portadaAlt = "El texto alternativo es obligatorio cuando hay portada.";
  }

  if (!input.cuerpo.trim()) {
    errores.cuerpo = "El cuerpo de la noticia no puede estar vacío.";
  }

  return { ok: Object.keys(errores).length === 0, errores };
}
