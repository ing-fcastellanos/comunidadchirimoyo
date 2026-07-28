/* prellenado.ts — construye la URL del formulario de creación ya existente
   (noticia o jornada) con los campos disponibles de un candidato prellenados
   vía query string (design.md D6). No escribe en noticias/jornadas: el
   humano revisa/edita y confirma con el mismo Server Action de creación que
   ya existe (crearNoticia/crearJornada), sin tocar su contrato.

   Nota sobre "jornada" vs "evento": la IA no puede inferir con confianza una
   regla de recurrencia (día de la semana, semanal/mensual) a partir de una
   mención casual en el chat — solo una fecha puntual, si acaso. Por eso
   ambos tipos de candidato prellenan el formulario de jornadas como
   `kind=evento`; si el staff sabe que en realidad es recurrente, lo ajusta
   a mano en el formulario. */
import type { Candidato } from "./types";

export function armarPrellenado(candidato: Candidato): string {
  const params = new URLSearchParams({ resumen: candidato.resumen });
  if (candidato.fechaMensaje) params.set("fecha", candidato.fechaMensaje);

  if (candidato.tipo === "noticia") {
    if (candidato.redaccion) params.set("cuerpo", candidato.redaccion);
    return `/noticias/nueva?${params.toString()}`;
  }

  // jornada / evento
  params.set("kind", "evento");
  return `/jornadas/nueva?${params.toString()}`;
}
