/* validation.ts — validación server-side manual de los campos de una jornada
   (#141, D10 del design). Sin zod/yup, misma convención que noticias. */
import type { DiaSemana, JornadaFormInput, TipoJornada } from "./types";

const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Enum CERRADO — apps/sitio/components/voluntarios/ProximasJornadas.tsx
    indexa un mapa con exactamente estas 3 llaves; un valor fuera de este
    conjunto rompe /voluntarios en runtime (ver design.md D6). */
export const TIPOS_VALIDOS: readonly TipoJornada[] = ["limpieza", "pajareada", "evento"];

export const DIAS_VALIDOS: readonly DiaSemana[] = [
  "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo",
];

export interface ValidacionResultado {
  ok: boolean;
  errores: Partial<Record<keyof JornadaFormInput, string>>;
}

/** Valida los campos de un formulario de creación/edición de jornada. No toca
    Firestore: solo forma. La unicidad del slug se valida aparte (requiere una
    lectura), ver actions.ts. */
export function validarJornada(input: JornadaFormInput): ValidacionResultado {
  const errores: ValidacionResultado["errores"] = {};

  if (!input.titulo.trim()) {
    errores.titulo = "El título es obligatorio.";
  }

  if (!input.tipo || !TIPOS_VALIDOS.includes(input.tipo)) {
    errores.tipo = "Selecciona un tipo válido.";
  }

  if (!input.hora.trim()) {
    errores.hora = "La hora es obligatoria.";
  }

  if (input.kind === "recurrente") {
    if (!input.dia || !DIAS_VALIDOS.includes(input.dia)) {
      errores.dia = "Selecciona un día válido.";
    }
    if (input.recurrenciaTipo === "mensual-ordinal" && input.ordinales.length === 0) {
      errores.ordinales = "Selecciona al menos un ordinal (1º, 2º, etc.).";
    }
  } else if (input.kind === "evento") {
    if (!FECHA_ISO.test(input.fecha)) {
      errores.fecha = "La fecha debe tener el formato ISO AAAA-MM-DD.";
    }
  }

  return { ok: Object.keys(errores).length === 0, errores };
}
