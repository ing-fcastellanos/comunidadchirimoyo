# ADR-0026 — Renderizador de markdown editorial (`react-markdown`)

- **Estado:** Accepted
- **Fecha:** 2026-06-26
- **Decisores:** @ing-fcastellanos
- **Issue:** #69

## Contexto

El contenido del repo (ADR-0004) se renderiza hoy con **parsers caseros**: `splitSecciones` en `apps/sitio/lib/landing.ts` y `parseSecciones` en `apps/catalogo/lib/ficha.ts`, que solo entienden encabezados `## H2` y un convertidor de `**negritas**` a `<strong>` hecho a mano (`ElCaso.tsx`). Esos parsers dirigen **layout estructurado** (hero, secciones-tarjeta del landing, bloques de la ficha), no markdown libre.

Las **notas de comunidad** (épica #20, issue #70) necesitan contenido **editorial real**: enlaces, listas, imágenes embebidas, citas y subtítulos. Extender el parser casero equivaldría a reimplementar markdown —frágil y costoso—. Hace falta un renderizador de markdown de verdad.

El repo no tenía hasta ahora ninguna dependencia de markdown (solo `gray-matter` para el frontmatter). Adoptar un renderizador **rompe esa convención** y por eso se documenta como ADR (CLAUDE.md).

Restricciones/fuerzas:
- **Seguridad:** el cuerpo no debe permitir inyección de HTML/JS.
- **Estilo:** debe usar los **tokens de diseño** del proyecto, no estilos genéricos.
- **App Router / RSC:** debe renderizar en Server Components (el sitio es App Router).
- **Imágenes:** el sitio corre en Cloud Run (`output: "standalone"`, ADR-0015) y tiene `images.remotePatterns` para el bucket de comunidad (ADR-0021) → `next/image` optimiza.

## Decisión

Adoptar **`react-markdown` + `remark-gfm`** como renderizador de markdown editorial en `apps/sitio`, encapsulado en un componente reutilizable `components/ui/Markdown.tsx` (Server Component) que **mapea cada elemento a los tokens de diseño** del proyecto.

**Alcance de elementos:** encabezados (`##`/`###`), párrafos, énfasis (`**`/`_`), listas ordenadas/no ordenadas, enlaces, citas (`>`), código en línea y bloque, reglas horizontales, imágenes, y los extras de GFM (tablas, listas de tareas, autolinks, tachado).

**Sanitización — segura por construcción:** el contenido es de **autoría confiable del repo** (escrito y revisado en PR). `react-markdown` **no** renderiza HTML embebido salvo que se habilite `rehype-raw`, que **no se habilita**; además neutraliza por defecto URLs peligrosas (`javascript:`). Por tanto **no** se incorpora `rehype-sanitize`. **Regla futura:** si alguna vez se permite HTML crudo en el cuerpo (p. ej. contenido de terceros), SHALL añadirse `rehype-sanitize` con allowlist antes de habilitar `rehype-raw`.

**Convivencia:** `splitSecciones` y `parseSecciones` **se conservan** (dirigen layout estructurado). `Markdown.tsx` es para **cuerpos editoriales** (notas de comunidad). Migrar `/privacidad` u otros textos al nuevo renderizador es opcional y futuro.

## Alternativas consideradas

- **`react-markdown` + `remark-gfm` (elegida):** React-native, sin `dangerouslySetInnerHTML`, renderiza en RSC, mapeo elemento→componente para tokens, seguro por defecto (sin HTML crudo). Ecosistema remark/rehype maduro.
- **MDX:** permite ejecutar JSX dentro del contenido — innecesario para notas y con superficie de seguridad mayor (el contenido podría ejecutar código). Descartada.
- **`markdown-to-jsx`:** más ligera, pero menos control/ecosistema (plugins, GFM) y menos idiomática para mapear a tokens. Descartada.
- **`marked`/`markdown-it` + sanitizador + `dangerouslySetInnerHTML`:** rápido, pero vuelve a inyectar HTML como string y obliga a sanitizar manualmente; contradice la postura "sin HTML crudo". Descartada.
- **Seguir extendiendo el parser casero:** reimplementar markdown a mano; frágil y sin fin. Descartada.

## Consecuencias

### Positivas

- Contenido editorial completo (enlaces, listas, imágenes, citas, tablas) con el estilo del proyecto.
- Seguridad por construcción (sin HTML crudo, sin `dangerouslySetInnerHTML`).
- Componente reutilizable; base para las páginas de noticias (#71–#74) y, si se quiere, para migrar otros textos.

### Negativas

- Primera dependencia de markdown en el repo (deja de ser cierto "cero deps de markdown"); ~peso extra en el bundle del sitio.
- Dos formas de renderizar contenido coexisten temporalmente (parsers caseros + markdown), hasta una eventual unificación.

### Neutras

- El renderizador vive en `apps/sitio`; compartirlo con `apps/catalogo` sería un paso futuro (no hay librería compartida, ADR-0001).

## Plan de revisión

Reconsiderar si: se necesita HTML crudo o interactividad en el cuerpo (entonces añadir `rehype-sanitize` y, quizá, aislar en Client Component), si el peso del bundle se vuelve un problema, o si se decide unificar el render del catálogo bajo el mismo componente.
