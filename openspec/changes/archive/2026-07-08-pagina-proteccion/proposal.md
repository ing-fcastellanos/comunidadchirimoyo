## Why

El catálogo ya clasifica cada ficha por **IUCN** (`conservacion.iucn`) y **NOM-059-SEMARNAT-2010** (`conservacion.nom059`), con badges visibles en el detalle de especie. Pero no hay ningún lugar que explique **qué significan esas categorías, qué leyes las respaldan, ni por qué importan** para un humedal urbano como el Chirimoyo. Esta página conecta el catálogo con la lucha de la comunidad (`content/landing/lucha.md`): las especies documentadas y su estatus de protección son el argumento central para que el humedal sea reconocido como ecosistema vivo (#78).

## What Changes

- **Nuevo archivo de contenido curado** `content/fauna/proteccion.json`: cifras del catálogo (especies documentadas por grupo, cuántas con categoría NOM-059), las 4 categorías NOM-059 con sus especies del Chirimoyo, la escala IUCN, un ejemplo curado de CITES (Iguana Verde, Apéndice II — ya mencionado en su ficha), y las fuentes oficiales agrupadas por sistema (NOM-059, IUCN, CITES, buscadores de especie).
- **Loader** `apps/catalogo/lib/proteccion.ts` que lee el JSON en build (mismo patrón `node:fs` que `lib/colaboradores.ts`).
- **Ruta `/proteccion`** (`app/proteccion/page.tsx`): Server Component estático. Diseño ya resuelto en Claude Design (proyecto "Guia aves chirimoyo", `components/Proteccion.jsx` + `Proteccion.html`) reutilizando los primitivos existentes del catálogo (`Section`, `SectionTitle`, `Badge`, `Icon`) — no introduce tokens de color, tipografía ni componentes nuevos.
- **`generateMetadata`** (title, description, OpenGraph), mismo patrón que `/colaboradores`.
- **Enlace desde el Footer** del catálogo.
- **Cruce con la búsqueda**: enlace a `/busqueda?conservaciones=NOM-059` para "ver las especies del Chirimoyo bajo protección". Esto requiere una **pequeña adición** en `BuscadorGeneral` (hoy arranca siempre en `EMPTY_FILTERS`, sin leer la URL): inicializar el filtro `conservaciones` desde el parámetro de búsqueda si está presente. Reutiliza el mismo shape de `Filters`/`patch` que ya usa el quick-filter `nom059` de `dictionary.ts`; sin comportamiento nuevo cuando el parámetro está ausente.
- **Documentar el esquema** de `proteccion.json` en el README de contenido.

## No-goals

- **No** se agrega un campo `cites` al schema de fichas (`fauna-schema.ts`). El dato de CITES en esta página es curado a mano en `proteccion.json` (respaldado por el texto ya existente en la ficha de `iguana-iguana`), no se deriva ni se consulta de las fichas.
- **No** se promueve `conservacion.iucn` de `string` libre a un tipo controlado (`Nom059`-like). Quedó identificado como posible mejora futura, pero no es necesario para esta página divulgativa.
- **No** se construye una barra de "escala" de colores por categoría de riesgo. Se sigue la regla ya documentada del sistema de diseño ("los acentos cálidos solo en insignias, nunca como fondo de sección"): NOM-059 usa `Badge` tono `terra` (igual que en la ficha de especie) diferenciado por ícono/orden, e IUCN se presenta como tabla simple.
- **No** se afirma endemismo de ninguna especie del humedal: el schema no rastrea ese dato, así que la sección correspondiente queda como explicación general del concepto, no como dato del catálogo.
- **No** se toca el esquema de fichas existente ni se introduce ningún endpoint (catálogo 100% estático, ADR-0005).

## Capabilities

### New Capabilities
- `pagina-proteccion`: página estática `/proteccion` del catálogo que explica los sistemas de protección de fauna (NOM-059, IUCN, CITES), los cruza con las especies documentadas del humedal del Chirimoyo, y ofrece fuentes oficiales verificadas — contenido curado, enlazada desde el Footer y desde la búsqueda filtrada por NOM-059.

### Modified Capabilities
- `catalogo-busqueda`: el buscador general (`/busqueda`) SHALL aceptar un filtro inicial de conservación desde el parámetro de URL `conservaciones` (p. ej. `?conservaciones=NOM-059`), para permitir deep-linking desde `/proteccion`. Es una adición pura (concern nuevo, `EMPTY_FILTERS` sigue siendo el default sin parámetro) — no cambia el comportamiento existente sin el parámetro.

## Impact

- **Sub-dominio afectado:** aves (catálogo, `fauna.chirimoyo.org`).
- **Contenido:** nuevo `content/fauna/proteccion.json` (cifras, categorías NOM-059/IUCN, ejemplo CITES, fuentes — sin PII).
- **Código (`apps/catalogo`):** `lib/proteccion.ts` (loader + tipos), `app/proteccion/page.tsx` (página + `generateMetadata`), `components/layout/Footer.tsx` (enlace), componente(s) de presentación derivados del mockup de Claude Design, `components/search/BuscadorGeneral.tsx` (leer filtro inicial de la URL).
- **Docs:** `content/README.md` (esquema de `proteccion.json`).
- **Diseño:** ya resuelto y aprobado en Claude Design (proyecto "Guia aves chirimoyo", `Proteccion.jsx`/`Proteccion.html`); la implementación recrea ese mockup, no parte de cero.
- **Sin** cambios en API, esquema de fichas, ni convenciones documentadas → **no requiere ADR**.
