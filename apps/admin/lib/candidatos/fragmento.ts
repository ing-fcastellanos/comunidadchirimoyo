/* fragmento.ts — genera el fragmento JSON para copiar a mano en
   content/landing/{logros,aliados}.json al aprobar un candidato de tipo
   logro o aliado (design.md D6 — sin CRUD nuevo para estos dos tipos,
   ADR-0004). El humano copia el fragmento, lo pega en el arreglo
   correspondiente (`hitos` o `aliados`) y abre su propio PR. */
import type { Candidato } from "./types";

/** Fragmento con la forma exacta de un elemento de `hitos` o `aliados`,
    listo para copiar. Los campos que la IA no puede inferir con confianza
    (título editorial, slug, tipo cerrado) quedan como PLACEHOLDER, mismo
    criterio que los PLACEHOLDER ya usados en content/landing/aliados.json. */
export function armarFragmentoJson(candidato: Candidato): string {
  if (candidato.tipo === "logro") {
    return JSON.stringify(
      {
        fecha: candidato.fechaMensaje ?? "PLACEHOLDER",
        titulo: "PLACEHOLDER — completar título",
        descripcion: candidato.resumen,
        tipo: "hito",
        foto: null,
      },
      null,
      2,
    );
  }

  return JSON.stringify(
    {
      slug: "PLACEHOLDER-slug",
      nombre: "PLACEHOLDER — completar nombre",
      descripcion: candidato.resumen,
      tipo: "independiente",
      url: null,
      logo: null,
    },
    null,
    2,
  );
}
