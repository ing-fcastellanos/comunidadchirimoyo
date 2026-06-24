## Why

El componente de mapa ya soporta la variante **residente** (zona teal "Presencia anual", ADR-0018/0025) y 49 aves la usan en producción; el fallback honesto sin curaduría también existe. Pero **0 de las 12 fichas de herpetofauna** declaran `distribucion`, así que todas caen al marcador local genérico ("rango por especie pendiente de curar"). #93 cierra ese hueco curando el rango residente de la herpetofauna — trabajo de **contenido**, análogo al #36 que ya se hizo para aves.

La investigación por especie (IUCN, AmphibiaWeb, The Reptile Database, GBIF) reveló que un rango a granularidad de país solo es honesto para las especies de rango **multi-país**; pintar todo México para un microendémico, o el rango nativo de una especie **introducida** localmente, tergiversaría la realidad. Por eso la curaduría es selectiva.

Sub-dominio afectado: **aves** (catálogo de fauna). Sin impacto en sitio, voluntarios ni api.

## What Changes

- **Curar `distribucion.residente`** (códigos ISO 3166-1 alpha-2) en **8** fichas de herpetofauna de rango multi-país, con `notas` aclaratorias:
  - `incilius-valliceps`, `rhinella-horribilis`, `smilisca-baudinii`, `lithobates-berlandieri`, `tlalocohyla-picta` (anfibios)
  - `sceloporus-grammicus`, `thamnophis-proximus`, `trachemys-venusta` (reptiles)
- **Dejar al fallback honesto** (sin `distribucion`) **4** fichas, por decisión editorial fundamentada:
  - `bolitoglossa-platydactyla`, `rheohyla-miotympanum` (endémicas de México)
  - `eleutherodactylus-cystignathoides` (nativa solo de México; la población de Texas es introducida)
  - `iguana-iguana` (marcada `introducida`: pintar su rango nativo sugeriría que su presencia local es natural)
- **Documentar la política de curaduría** del rango residente como requisito de la capability `mapa-distribucion` (multi-país → se pinta; endémica de MX o introducida → fallback honesto).

## Capabilities

### New Capabilities
_(ninguna)_

### Modified Capabilities
- `mapa-distribucion`: nuevo requisito de **política de curaduría del rango residente** — define cuándo una ficha de herpetofauna declara `distribucion.residente` (rango nativo multi-país) y cuándo se apoya en el fallback honesto (endémica de México o `estatusDistribucion: introducida`). No cambia el comportamiento del render (ya soporta residente y el fallback); fija la regla de contenido.

## Impact

- **Contenido (aves):** 8 archivos `content/fauna/{anfibios,reptiles}/<slug>/index.md` editados para añadir `distribucion.residente` + `notas`. 4 fichas sin cambios (se confirman en el fallback).
- **Código:** ninguno — `MapaDistribucion`, `distribucionVista` y el esquema ya soportan el caso residente.
- **Dependencias:** ninguna.
- **Validación:** los códigos ISO no rompen `validate:fichas` (el esquema acepta `distribucion` opcional); se verifica el render en vivo.
- **Visible para el usuario:** las 8 herps de rango amplio muestran su rango pintado (zona residente teal); las 4 restantes muestran el marcador local honesto.

## No-goals

- No cambia el **componente** del mapa, `distribucionVista` ni el esquema (ya soportan residente y fallback).
- No introduce granularidad sub-país (estado/polígono) — sigue la decisión de país de ADR-0018; los microendemismos se modelan con el fallback, no con un país entero.
- No pinta el rango nativo de **especies introducidas** (caso `iguana-iguana`).
- No re-curará la distribución de **aves** (#36, ya cerrado).
- No añade la capa opcional de puntos GBIF (fuera de alcance, ADR-0018).
