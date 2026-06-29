"use server";
/* inscripcion.ts — Server Action del formulario de inscripción de voluntarios.
   El navegador llama a esta acción; el servidor revalida y reenvía a
   services/api (`POST /api/voluntarios`, #21). La URL del API vive solo aquí
   (server), nunca en el cliente. No se loguea PII: solo se reenvía. */

import { voluntariosEndpoint } from "@/lib/api";
import {
  validarInscripcion,
  type CamposInscripcion,
  type ErroresInscripcion,
} from "@/lib/inscripcion-validacion";

export type ResultadoInscripcion =
  | { ok: true }
  | { ok: false; tipo: "validacion"; errores: ErroresInscripcion }
  | { ok: false; tipo: "servidor" };

export async function enviarInscripcion(
  valores: CamposInscripcion,
): Promise<ResultadoInscripcion> {
  // Revalidación de autoridad intermedia (un cliente puede saltarse el JS).
  const errores = validarInscripcion(valores);
  if (Object.keys(errores).length > 0) {
    return { ok: false, tipo: "validacion", errores };
  }

  try {
    const res = await fetch(voluntariosEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // El honeypot se reenvía para que el API aplique su decisión anti-spam.
      body: JSON.stringify({
        nombre: valores.nombre.trim(),
        correo: valores.correo.trim(),
        telefono: valores.telefono.trim(),
        jornada: valores.jornada.trim(),
        acompanantes: valores.acompanantes.trim(),
        consentimiento: valores.consent,
        website: valores.website,
      }),
      cache: "no-store",
    });

    // 201 éxito · 200 honeypot (éxito aparente) → ambos son éxito para la UI.
    if (res.status === 201 || res.status === 200) return { ok: true };
    // 400: el backend rechazó por validación. Sin detalle por campo desde aquí.
    if (res.status === 400) return { ok: false, tipo: "validacion", errores: {} };
    // 5xx u otro → error de servidor.
    return { ok: false, tipo: "servidor" };
  } catch {
    // Fallo de red / API caído.
    return { ok: false, tipo: "servidor" };
  }
}
