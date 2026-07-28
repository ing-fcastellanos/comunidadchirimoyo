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

/** Cliente de OpenAI server-only (lazy singleton). */
export function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) throw new OpenAINoConfiguradoError();
  if (!globalForOpenAI.__chirimoyoOpenAI) {
    globalForOpenAI.__chirimoyoOpenAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return globalForOpenAI.__chirimoyoOpenAI;
}
