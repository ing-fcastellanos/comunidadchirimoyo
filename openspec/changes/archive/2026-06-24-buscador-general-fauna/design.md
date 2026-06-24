## Context

El buscador de aves (`/aves/buscador`) es un Client Component `BuscadorAves` que mantiene el estado `Filters`, llama `filterAndSort(especies, filters, sort, catLabel)` y renderiza `SearchPanel` (UI de filtros **aviar**: forma/talla/color/dónde/gremios + quick-presets), `ResultsBar`, los pills de filtros activos y una grilla de `EspecieCard`. Tras el rename de #84, `Especie`, `fichaToEspecie`, `filterAndSort` y `EspecieCard` son group-agnostic. `/busqueda` es un stub `Proximamente`.

El **núcleo común** del esquema (ADR-0025), aplicable a los 3 grupos: texto, taxonomía (orden/familia), conservación (NOM-059), presencia y grado de ocurrencia. La faceta de **grupo** (`Especie.group`) es el filtro que distingue al general.

## Goals / Non-Goals

**Goals:**
- Un buscador general 100% cliente sobre las 76 especies, con filtros del núcleo común + faceta de grupo.
- Reutilizar la maquinaria genérica (filtrado, resultados, card, pills) sin tocar el buscador de aves.

**Non-Goals:**
- Buscadores especializados de herps; filtros aviares en el general; hub `/` (#83); endpoint.

## Decisions

### Decisión 1 — `BuscadorGeneral` standalone, reusando un módulo compartido

Se construye `components/search/BuscadorGeneral.tsx` (client) en vez de parametrizar `SearchPanel`. El panel general es estructuralmente distinto (facetas planas + grupo, sin acordeón «búsqueda detallada» ni presets aviares), así que forzar un solo panel multiplicaría condicionales. `BuscadorGeneral` reutiliza:

```
  lib/search.ts        filterAndSort()           (ya genérico)
  módulo compartido    ResultsBar, EmptyState,   (extraídos de BuscadorAves)
                       helpers de pills
  components/search/   EspecieCard               (group-agnostic)
  nuevo                PanelGeneral              (panel reducido + faceta grupo)
```

**Extracción mínima:** hoy `ResultsBar`, `EmptyState` y los helpers de pills (`PILL_KEYS`, `GROUP_NAME`, `labelFor`) viven dentro de `BuscadorAves.tsx`. Se mueven a un módulo compartido (p. ej. `components/search/shared.tsx`) y `BuscadorAves` los importa — refactor mecánico, sin cambio de comportamiento, verificable por `tsc` y por el smoke del buscador de aves.

### Decisión 2 — `Filters.grupos` aditivo

`Filters` no tiene faceta de grupo. Se añade `grupos: string[]` (y a `EMPTY_FILTERS`), con una cláusula en `filterAndSort`: `if (!arrOk(f.grupos, b.group)) return false`. Es aditivo: el buscador de aves nunca setea `grupos`, así que su comportamiento es idéntico.

### Decisión 3 — Núcleo común del panel + faceta de grupo con atajo

`PanelGeneral` ofrece, como facetas multiselección sobre el conjunto presente en los datos:

```
  texto          (input + autocompletar por nombre/familia, como el de aves)
  grupo          aves · anfibios · reptiles   + atajo "Herpetofauna" → {anfibios,reptiles}
  orden          (derivado de las especies)
  familia        (derivado de las especies)
  presencia      Residente · Migratoria · Introducida
  conservación   Protección NOM-059 · Sin amenaza
  ocurrencia     Común · Poco común · Raro
```

El atajo «Herpetofauna» es un botón que setea `grupos: ["anfibios","reptiles"]` (no un valor de enum nuevo). Las etiquetas de grupo salen de `GRUPO_LABEL`. Se incluye **ocurrencia** por ser núcleo común y barata; se excluyen forma/talla/color/dónde/gremios por ser aviares.

### Decisión 4 — `/busqueda` server page + sitemap

`app/busqueda/page.tsx` deja de renderizar `Proximamente`: carga `getAllFichas()` → `fichaToEspecie` → `<BuscadorGeneral especies={...} />`, con metadata propia (title/description). Es estática (sin API, datos embebidos en build), como `/aves/buscador`. Se añade `/busqueda` al `sitemap`. El enlace de navegación al buscador general es responsabilidad de #83 (hub); aquí solo se deja la página alcanzable por URL y crawlable.

### Decisión 5 — Limpiar el drift de specs de #84 al pasar

Los requisitos de `catalogo-hub-fauna` aún describen `/anfibios`, `/reptiles` y `/busqueda` como placeholders «próximamente». #84 ya hizo reales los índices de grupo; #85 hace real `/busqueda`. Se actualizan esos requisitos para que la spec deje de contradecir la realidad (el placeholder `Proximamente` subsiste solo como fallback para grupos válidos **sin** fichas, que hoy no existen entre las rutas generadas).

### Decisión 6 — Hub de la home refleja la fauna real (tarjetas + hero)

Como `/busqueda` y los índices `/anfibios`/`/reptiles` ya son reales, el hub (`app/page.tsx` + `GruposFauna`) dejaba de ser veraz: tarjetas de herps en «próximamente» y hero con CTA único a `/busqueda` y copy "pronto, anfibios y reptiles". Se corrige aquí para que `catalogo-hub-fauna` no contradiga la realidad:

- **`GruposFauna`** deriva el estado de cada tarjeta del **conteo de fichas** del grupo (activo si > 0): conteo + enlace `/<grupo>` + `GRUPO_ICON`; «próximamente» solo para grupos sin datos. `app/page.tsx` calcula los conteos por grupo en build.
- **`Hero`** se generaliza de `primary`/`secondary` a una lista **`ctas[]`** con `variant` (`primary` verde + flecha, `secondary` blanco); internos → `Link`, externos → `<a>`. El hub usa 3 CTAs (Buscar aves · Búsqueda general · Conoce la comunidad); el landing de aves migra a `ctas[]` con sus 2 botones (sin cambio visual). Refactor verificado por `tsc` y por el render de ambas home.

## Risks / Trade-offs

- **[Extraer piezas de `BuscadorAves` rompe el buscador de aves]** → Refactor mecánico (mover, no reescribir) + `tsc` + smoke de `/aves/buscador` antes de cerrar.
- **[`Filters.grupos` afecta el filtrado de aves]** → Aditivo; aves nunca setea `grupos`; `arrOk([], …)` es siempre verdadero. Se verifica que `/aves/buscador` sigue idéntico.
- **[Núcleo común se siente pobre comparado con aves]** → Es intencional (ADR-0025): el general es transversal; la riqueza por-grupo vive en el buscador especializado (aves) y en la grilla por grupo (#84).

## Open Questions

- Ninguna que bloquee. (El enlace a `/busqueda` y su lugar en la navegación se deciden en #83.)
