/* redaccion.ts — llamada 2 de la IA (candidatos-admin, design.md D4/D6):
   redacta el cuerpo de una noticia en el tono elegido por el humano, a partir
   del resumen de un candidato. Se dispara solo al interactuar con un
   candidato de tipo noticia — NUNCA durante la extracción en lote (el tono se
   elige al revisar, no antes). */
import { getOpenAIClient } from "./openai-client";
import { TONOS, type TonoNoticia } from "./types";

const MODELO = "gpt-4o-mini";

function descripcionTono(tono: TonoNoticia): string {
  return TONOS.find((t) => t.id === tono)?.descripcion ?? "";
}

const INSTRUCCIONES = `Eres un asistente de redacción para el sitio de una comunidad de voluntarios ecologistas (defensa del humedal de Chirimoyo, Veracruz, México). Redacta el cuerpo de una noticia en español, en formato Markdown simple (párrafos, sin encabezados ni listas), a partir del resumen que te da el usuario y en el tono solicitado. Sé conciso: entre 2 y 4 párrafos.`;

/** Redacta el cuerpo de una noticia en el tono solicitado, a partir de un
    resumen ya extraído (nunca del mensaje original completo). */
export async function redactarConTono(resumen: string, tono: TonoNoticia): Promise<string> {
  const respuesta = await getOpenAIClient().chat.completions.create({
    model: MODELO,
    messages: [
      { role: "system", content: INSTRUCCIONES },
      {
        role: "user",
        content: `Tono solicitado: ${tono} (${descripcionTono(tono)}).\n\nResumen del hecho a redactar:\n${resumen}`,
      },
    ],
  });

  return respuesta.choices[0]?.message?.content?.trim() ?? "";
}
