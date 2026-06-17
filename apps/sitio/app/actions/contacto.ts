"use server";
/* contacto.ts — Server Action del formulario de contacto (decisión B2).
   El navegador llama a esta acción; el servidor revalida y reenvía a
   services/api (`POST /api/contacto`). La URL del API vive solo aquí (server),
   nunca en el cliente. No se loguea PII: solo se reenvía. */

import { contactoEndpoint } from "@/lib/api";
import {
  validarContacto,
  type CamposContacto,
  type ErroresContacto,
} from "@/lib/contacto-validacion";

export type ResultadoContacto =
  | { ok: true }
  | { ok: false; tipo: "validacion"; errores: ErroresContacto }
  | { ok: false; tipo: "servidor" };

export async function enviarContacto(
  valores: CamposContacto,
): Promise<ResultadoContacto> {
  // Revalidación de autoridad intermedia (un cliente puede saltarse el JS).
  const errores = validarContacto(valores);
  if (Object.keys(errores).length > 0) {
    return { ok: false, tipo: "validacion", errores };
  }

  try {
    const res = await fetch(contactoEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // El honeypot se reenvía para que el API aplique su decisión anti-spam.
      body: JSON.stringify({
        nombre: valores.nombre.trim(),
        correo: valores.correo.trim(),
        asunto: valores.asunto.trim(),
        mensaje: valores.mensaje.trim(),
        consentimiento: valores.consent,
        website: valores.website,
      }),
      cache: "no-store",
    });

    // 201 éxito · 200 honeypot (éxito aparente) → ambos son éxito para la UI.
    if (res.status === 201 || res.status === 200) return { ok: true };
    // 400: el backend rechazó por validación (más estricto). Sin detalle por
    // campo desde aquí → error de validación genérico.
    if (res.status === 400) return { ok: false, tipo: "validacion", errores: {} };
    // 5xx u otro → error de servidor.
    return { ok: false, tipo: "servidor" };
  } catch {
    // Fallo de red / API caído.
    return { ok: false, tipo: "servidor" };
  }
}
