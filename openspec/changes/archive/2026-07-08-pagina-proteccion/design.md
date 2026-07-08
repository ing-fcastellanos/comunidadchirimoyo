## Context

El catálogo (`apps/catalogo`) es un export estático (ADR-0005/0014). Ya existen: el patrón de loader de contenido curado (`lib/colaboradores.ts`, mismo `node:fs` que `lib/content.ts`), los primitivos visuales (`Section`, `SectionTitle`, `Badge`, `Icon`), el diccionario de labels de conservación (`NOM059_LABEL` en `lib/dictionary.ts`), y el campo `conservacion: { nom059, iucn?, notas? }` por ficha (`fauna-schema.ts`). El buscador general (`/busqueda`, `BuscadorGeneral.tsx`) ya soporta un filtro de conservación (`conservaciones: ["NOM-059"]`) vía su quick-filter `nom059`, pero su estado (`useState<Filters>(EMPTY_FILTERS)`) no lee la URL — se verificó que no hay ningún `useSearchParams` en el árbol de búsqueda.

El diseño visual ya se resolvió fuera del código: se armó y aprobó un mockup en Claude Design (proyecto "Guia aves chirimoyo", `components/Proteccion.jsx` + `Proteccion.html`), derivado de los mismos primitivos y tokens que ya usa el catálogo (sin paleta ni tipografía nuevas). La implementación en `apps/catalogo` recrea ese mockup — no es exploración de diseño desde cero.

Los datos verificados contra `content/fauna/` (issue #78): 64 aves + 8 anfibios + 4 reptiles = 76 especies; 9 con categoría NOM-059 (2 "A": Avetoro Norteño y Culebra Listonada; 7 "Pr": Tlaconete, Rana Leopardo, Rana de Orejas Chicas, Iguana Verde, Zambullidor Menor, Polluela Rojiza, Oropéndola de Moctezuma); CITES Apéndice II para Iguana Verde citado textual de su ficha (`content/fauna/reptiles/iguana-iguana/index.md`).

## Goals / Non-Goals

**Goals:**
- Página `/proteccion` estática que explica NOM-059, IUCN y CITES, cruzada con las especies reales del Chirimoyo.
- Reusar el mockup ya aprobado en Claude Design y los primitivos existentes del catálogo, sin diseño nuevo.
- Cruce funcional con la búsqueda: el enlace desde `/proteccion` debe pre-filtrar de verdad, no solo apuntar a `/busqueda` en blanco.
- Contenido rigurosamente verificado contra los datos reales del catálogo (sin cifras ni especies inventadas).

**Non-Goals:**
- Campo `cites` en el schema de fichas, o promover `iucn` a tipo controlado.
- Barra de "escala" de colores por categoría (viola la regla "acentos cálidos solo en insignias").
- Afirmar endemismo real de alguna especie del humedal.
- Cualquier cambio al esquema de fichas o introducción de API (catálogo 100% estático).

## Decisions

**D1 — Contenido curado en JSON, con secciones estructuradas.** `content/fauna/proteccion.json`:
```json
{
  "cifras": { "totalEspecies": 76, "aves": 64, "anfibiosReptiles": 12, "conEstatus": 9 },
  "nom059": [
    { "cat": "pr", "label": "Protección Especial", "resumen": "...", "especies": ["Tlaconete", "..."] },
    { "cat": "a", "label": "Amenazada", "resumen": "...", "especies": ["Avetoro Norteño", "Culebra Listonada"] },
    { "cat": "p", "label": "En Peligro de Extinción", "resumen": "...", "especies": [] },
    { "cat": "e", "label": "Probablemente Extinta", "resumen": "...", "especies": [] }
  ],
  "iucn": [ { "code": "LC", "label": "Preocupación Menor" }, "..." ],
  "cites": { "especie": "Iguana Verde", "apendice": "II", "nota": "..." },
  "fuentes": [ { "rol": "NOM-059 · la ley mexicana", "icono": "scale", "enlaces": [ { "nombre": "...", "fuente": "...", "enlace": "https://..." } ] }, "..." ]
}
```
Los arrays `especies` de cada categoría NOM-059 se mantienen curados a mano (no se derivan automáticamente de las fichas en build) para no acoplar esta página a un recorrido de `getAllFichas()` en cada cambio de contenido; si una ficha cambia su `nom059`, el JSON se actualiza junto con ella (mismo criterio curado que `colaboradores.json`).

**D2 — Loader tipado.** `lib/proteccion.ts`: tipos `ProteccionData`/`Nom059Categoria`/`FuenteGrupo`/etc., y `getProteccion()` que lee el JSON con `node:fs` en build. Sin validación pesada (contenido curado y pequeño, mismo criterio que `getColaboradores()`).

**D3 — Página estática, recreando el mockup de Claude Design.** `app/proteccion/page.tsx` (Server Component): hero con cifras (4 stat-cards), sección NOM-059 (una tarjeta por categoría con `Badge` tono `terra`, ícono distinto por severidad, especies del Chirimoyo listadas o "ninguna especie... buena noticia" si está vacía), sección IUCN (tabla simple código→categoría, sin escala de color), sección CITES (tarjeta única con el ejemplo de Iguana Verde), bloque de cierre narrativo (fondo `pine`, liga con `lucha.md`) con el CTA a la búsqueda filtrada, y sección de fuentes agrupadas por sistema (mismo patrón de tarjetas que `/colaboradores`).

**D4 — `generateMetadata`.** Título, descripción y OpenGraph, mismo patrón que las demás páginas del catálogo.

**D5 — Enlace en el Footer.** Junto al de `/colaboradores`.

**D6 — Deep-link real a la búsqueda filtrada.** `BuscadorGeneral.tsx` SHALL leer `useSearchParams()` una sola vez al montar y, si `conservaciones` está presente en la URL (`?conservaciones=NOM-059`), seedear `Filters` con ese valor en lugar de `EMPTY_FILTERS`. Sin el parámetro, el comportamiento no cambia. Cambio acotado a la inicialización del estado; no se toca `applyQuick`/`toggleVal`/`setOne` ni el resto de la maquinaria de filtrado.

**D7 — Sin v0.dev adicional.** El diseño ya se resolvió y aprobó en Claude Design durante `/opsx:explore`; la implementación traduce ese mockup a `apps/catalogo` reusando los primitivos existentes.

## Risks / Trade-offs

- **[Riesgo] El contenido curado (especies por categoría, ejemplo CITES) puede desincronizarse si una ficha cambia su `conservacion.nom059` y nadie actualiza `proteccion.json`.** → Mitigación: PR checklist / nota en el README de contenido indicando que ambos archivos deben editarse juntos cuando cambie el estatus de una especie.
- **[Riesgo] El campo `iucn` sigue siendo `string` libre en el schema** — la tabla de la página no puede validarse automáticamente contra los valores reales de las fichas. → Mitigación: aceptado como no-goal; posible mejora futura fuera de este change.
- **[Riesgo] El deep-link a `/busqueda` depende de que `conservaciones` siga siendo el nombre del filtro y `"NOM-059"` su valor.** Si `dictionary.ts`/`Filters` cambian esos nombres, el enlace se rompe silenciosamente (sin error, solo deja de pre-filtrar). → Mitigación: cubierto por un escenario de spec explícito (ver specs), verificable en `npm run smoke`.

## Open Questions

Ninguna que bloquee. La redacción final del copy divulgativo (tono, longitud) se ajusta libremente en la implementación sin requerir otra vuelta de diseño.
