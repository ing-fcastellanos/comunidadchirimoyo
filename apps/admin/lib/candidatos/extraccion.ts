/* extraccion.ts — llamada 1 de la IA (candidatos-admin, design.md D4): extrae
   y clasifica candidatos de contenido publicable a partir del lote de
   mensajes NUEVOS de un grupo (ya filtrados por corte de fecha, ver
   grupos.ts/whatsapp-parser.ts — nunca se envía el historial completo).
   Structured Outputs (JSON Schema, `strict: true`) — nunca texto libre a
   parsear con regex. */
import { getOpenAIClient } from "./openai-client";
import type { MensajeWhatsapp } from "./whatsapp-parser";
import type { Confianza, TipoCandidato } from "./types";

const MODELO = "gpt-4o-mini";

export interface CandidatoExtraido {
  tipo: TipoCandidato;
  resumen: string;
  fechaMensaje: string | null;
  confianza: Confianza;
}

const ESQUEMA = {
  name: "candidatos_extraidos",
  strict: true,
  schema: {
    type: "object",
    properties: {
      candidatos: {
        type: "array",
        items: {
          type: "object",
          properties: {
            tipo: { type: "string", enum: ["noticia", "jornada", "evento", "logro", "aliado"] },
            resumen: {
              type: "string",
              description: "Resumen breve y claro del contenido publicable, en español.",
            },
            fechaMensaje: {
              type: ["string", "null"],
              description: "Fecha ISO YYYY-MM-DD del mensaje origen, si se identifica con claridad.",
            },
            confianza: { type: "string", enum: ["alta", "media", "baja"] },
          },
          required: ["tipo", "resumen", "fechaMensaje", "confianza"],
          additionalProperties: false,
        },
      },
    },
    required: ["candidatos"],
    additionalProperties: false,
  },
} as const;

const INSTRUCCIONES = `Eres un asistente que ayuda a una comunidad de voluntarios ecologistas (defensa del humedal de Chirimoyo, Veracruz, México) a descubrir contenido publicable a partir de conversaciones de WhatsApp.

Analiza los mensajes y extrae SOLO menciones de contenido potencialmente publicable, clasificando cada una en uno de estos 5 tipos:
- "noticia": un hecho o suceso relevante para anunciar en el sitio.
- "jornada": una actividad recurrente de voluntariado (limpieza, pajareada) que se menciona.
- "evento": una actividad puntual, de una sola vez (festival, jornada especial, asamblea).
- "logro": un hito, reconocimiento o logro de la comunidad.
- "aliado": la mención de un nuevo proyecto, colectivo u organización aliada.

Ignora saludos, coordinación logística trivial y conversación casual sin contenido publicable. Si no hay nada publicable, responde con una lista vacía. Escribe los resúmenes en español, en tercera persona, sin citar textualmente a ninguna persona.`;

function formatearMensajes(mensajes: MensajeWhatsapp[]): string {
  return mensajes
    .map((m) => `[${m.fecha.toISOString().slice(0, 10)}] ${m.remitente}: ${m.texto}`)
    .join("\n");
}

/** Extrae y clasifica candidatos a partir de un lote de mensajes nuevos.
    Devuelve `[]` si el lote está vacío (sin llamar a la IA) o si la IA no
    encuentra contenido publicable. */
export async function extraerCandidatos(mensajes: MensajeWhatsapp[]): Promise<CandidatoExtraido[]> {
  if (mensajes.length === 0) return [];

  const respuesta = await getOpenAIClient().chat.completions.create({
    model: MODELO,
    messages: [
      { role: "system", content: INSTRUCCIONES },
      { role: "user", content: formatearMensajes(mensajes) },
    ],
    response_format: { type: "json_schema", json_schema: ESQUEMA },
    // Los lotes ya vienen acotados (dividirEnLotes, whatsapp-parser.ts), así
    // que un lote razonable nunca debería necesitar tantos candidatos — este
    // límite es solo un margen de seguridad para no dejar una respuesta JSON
    // truncada (que rompería el JSON.parse de abajo).
    max_tokens: 4096,
  });

  const contenido = respuesta.choices[0]?.message?.content;
  if (!contenido) return [];

  // Si la respuesta viene truncada (finish_reason "length"), NO se traga el
  // error como lote vacío: el llamador (route.ts) necesita que esto explote
  // para que el corte NO avance y el lote se pueda reintentar (mismo
  // criterio que cualquier otro fallo de la IA, ver design.md).
  const parsed = JSON.parse(contenido) as { candidatos: CandidatoExtraido[] };
  return parsed.candidatos ?? [];
}
