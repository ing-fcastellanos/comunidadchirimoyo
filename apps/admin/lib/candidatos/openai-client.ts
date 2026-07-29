/* openai-client.ts — cliente de la API de OpenAI, server-only (candidatos-admin,
   design.md D8). Requiere `OPENAI_API_KEY` en el entorno de Cloud Run — NUNCA
   en un .env versionado (mismo patrón que MAIL_PASSWORD en services/api).
   Init lazy + singleton en globalThis, mismo criterio que los demás clientes
   server-only del admin (lib/firestore.ts, lib/storage.ts). NUNCA importar
   desde un Client Component. */
import OpenAI from "openai";

const globalForOpenAI = globalThis as unknown as {
  __chirimoyoOpenAI?: OpenAI;
};

/** Distingue "falta la credencial" de cualquier otro fallo de la API, para que
    quien llama pueda reportar un mensaje claro en vez de un error genérico
    (design.md, riesgo de tasks.md 3.6). */
export class OpenAINoConfiguradoError extends Error {
  constructor() {
    super("OPENAI_API_KEY no está configurada en el entorno.");
    this.name = "OpenAINoConfiguradoError";
  }
}

/** Resumen seguro de un error para logs (Cloud Run, nunca al cliente): NUNCA
    se loguea el error crudo. Un error de conexión/HTTP inválido puede traer
    el header `Authorization` (con la API key completa) en su mensaje o
    `cause` — pasó en producción con un valor de secret con salto de línea,
    ver PR de este fix — así que además de tomar solo nombre+mensaje, se
    redacta cualquier cosa con forma de Bearer token o de API key de OpenAI. */
export function resumenErrorSeguro(err: unknown): string {
  const partes: string[] = [];
  if (err instanceof Error) {
    partes.push(`${err.name}: ${err.message}`);
    const cause = (err as { cause?: unknown }).cause;
    if (cause instanceof Error) partes.push(`cause: ${cause.name}: ${cause.message}`);
  } else {
    partes.push(String(err));
  }
  return partes
    .join(" | ")
    .replace(/Bearer\s+\S+/gi, "Bearer [REDACTADO]")
    .replace(/sk-[A-Za-z0-9_-]{10,}/gi, "[REDACTADO]");
}

/** Cliente de OpenAI server-only (lazy singleton). `trim()` defensivo: un
    salto de línea colado al cargar el secret (p. ej. al pegarlo por stdin en
    `gcloud secrets versions add`) vuelve el header `Authorization: Bearer
    <key>` inválido y el SDK falla con un TypeError de bajo nivel en vez de un
    401 claro — visto en producción, ver PR de este fix. */
export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new OpenAINoConfiguradoError();
  if (!globalForOpenAI.__chirimoyoOpenAI) {
    globalForOpenAI.__chirimoyoOpenAI = new OpenAI({ apiKey });
  }
  return globalForOpenAI.__chirimoyoOpenAI;
}
