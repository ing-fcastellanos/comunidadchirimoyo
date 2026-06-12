## Context

#10 dejó 63 fichas (`content/fauna/aves/<slug>/index.md`) + un loader real `getAllFichas()`
y `fotoUrl()`. El handoff de Claude Design (`docs/design/buscar-aves/`) define la pantalla
de búsqueda + resultados: prototipo en HTML/JSX (React 18 vía CDN + Babel) con
`searchapp.jsx`, `components/search/{SearchPanel,BirdCard,icons}.jsx` y los diccionarios en
`assets/birds-data.js`. Usa **exactamente** nuestros tokens (`theme.js` = `forest/mint/paper/
ink/ochre/terra/teal`, Cormorant + Source Sans 3).

El experto clasificó las 63 especies con los 5 rasgos visuales y se cargaron en el CSV de
origen (validado: 63/63, ids correctos, `;` en `colores`, `true/false` en `featured`). El
catálogo es estático (ADR-0005/0014): no hay API ni endpoint de búsqueda.

## Goals / Non-Goals

**Goals:**
- Recrear el handoff en React/Next como página índice del catálogo, fiel al diseño.
- Filtrado 100% en cliente sobre datos embebidos en build.
- Incorporar los 5 campos de búsqueda (esquema + migración + fichas).

**Non-Goals:**
- Página de detalle (#13), PDF (#14), deploy (#15), anfibios (Fase 2).
- Optimización de imágenes en runtime (se usan los thumbs del bucket, ADR-0014/0016).

## Decisions

### D1 — Server shell + Client search component
La página índice es un Server Component que en build llama `getAllFichas()`, mapea a un
**view-model de búsqueda** y lo pasa como prop a un Client Component (`"use client"`) que
mantiene el estado de filtros y filtra en el navegador. Compatible con `output: export`:
los 63 registros se embeben en el HTML/JS estático. _Alternativa:_ filtrar en servidor —
descartada (ADR-0005, no hay runtime).

### D2 — View-model: `FichaEspecie` → `bird`
Un mapeador (`lib/search.ts`) convierte cada ficha al registro que consumen los componentes:
- `id=slug`, `common=nombreComun`, `sci=nombreCientifico`, `orden`, `familia`.
- `category` = `categoria` en minúsculas (Vadeadoras→`vadeadoras`).
- `shape/size/where/featured` = campos nuevos directos; `colors` = `colores[]`.
- `observation` = `gradoOcurrencia` (`comun`→`Común`, `poco-comun`→`Poco Común`, `rara`→`Raro`).
- `presence`: `estatusDistribucion==='introducida'` → `Introducida`; si no, `estatusMigratorio`
  `residente`→`Residente`, cualquier `migratoria-*`/`transitoria`→`Migratoria`.
- `conservation` = `conservacion.nom059!=='ninguno'` ? `'NOM-059'` : `'Sin Amenaza'`.
- `img` = `fotoUrl(slug, fotos[0].archivo, 'thumb')`; `href` = `/<slug>`.
- `desc` = primera oración de `## Descripción`; `keywords` = común+científico+familia+orden+colores.

### D3 — Diccionario de UI en `lib/dictionary.ts`
Se portan `CATS/PRESENCE/OBSERVATION/SHAPES/SIZES/COLORS/WHERES/QUICKS` de `birds-data.js`
a un módulo TS tipado (etiquetas/iconos/colores de chip). Es **vocabulario de UI**, no
contenido editable, por eso vive en la app (el CSV/fichas guardan solo los ids). Renombramos
la etiqueta de presencia **"Invasora"→"Introducida"** (nuestros datos usan `introducida`;
"invasora" es un término cargado y técnicamente distinto).

### D4 — Iconos
La app usa `lucide-react`. Se mapean los nombres `Ico` del handoff a sus equivalentes lucide
y se porta `ShapeIcon` (7 siluetas de ave) como componentes SVG propios (no existen en lucide).

### D5 — Sin paginación
63 especies (→ crecerá) se renderizan todas, como en el handoff. Se anota revisar si supera
~200. La búsqueda en cliente reduce el set visible sin recargar.

### D6 — Los 5 campos son opcionales/tolerantes
En el esquema se añaden como opcionales (como `creditoUrl`): una ficha sin ellos sigue válida
y simplemente no aparece en filtros visuales. Hoy están 63/63, pero la tolerancia evita
romper especies futuras a medio clasificar.

### D7 — Regeneración con `--force`
Las fichas aún no se editaron a mano, así que tras extender el script corremos
`migrar-fauna.py --force` para reescribir las 63 con los 5 campos. (A futuro, cuando haya
ediciones manuales, conviene un modo merge-solo-faltantes; hoy no aplica.)

## Risks / Trade-offs

- **Etiqueta "presencia" imprecisa** (3 valores del diseño vs 4+2 ejes nuestros) → mitigación:
  el mapeo D2 colapsa de forma explícita; documentado. Si se requiere precisión, se expone el
  eje real en el detalle (#13).
- **`--force` pisaría fichas curadas a mano** → mitigación: hoy no hay ediciones; el flujo de
  "agregar especies" no usa `--force`.
- **Fidelidad visual** (el prototipo es la fuente) → mitigación: contrastar contra los
  screenshots del handoff (`docs/design/buscar-aves/project/screenshots/`).
- **Colores de chip por categoría** exceden los 4 tonos del `Badge` → se portan tal cual del
  diccionario del handoff (cada gremio su color), no se fuerzan a los 4 tonos.
- **Peso del JS embebido** (63 registros + diccionario) → trivial; crece lineal, revisar a ~200.

## Migration Plan

1. Extender el esquema: tipos en `lib/content.ts`, doc en `content/README.md`, campos en
   `_ejemplo.md`.
2. Extender `migrar-fauna.py` (5 mapeos, split `;`, parse boolean, validación) y regenerar
   fichas (`--force`); verificar 63/63.
3. `lib/dictionary.ts` + `lib/search.ts` (view-model).
4. Componentes de búsqueda/resultados + página índice; sustituir la home placeholder.
5. `typecheck` + `build` + contraste visual con los screenshots del handoff.

## Open Questions

- Ruta del detalle: la card enlaza `/<slug>`; confirmar que #13 use la misma.
- Nav del header del handoff ("Componentes", "Ficha destacada") apunta a páginas del prototipo
  → se reemplaza/omite (no existen en la app).
