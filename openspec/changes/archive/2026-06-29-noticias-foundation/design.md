## Context

`apps/sitio` corre en **Cloud Run** (`output: "standalone"`, ADR-0015) y ya tiene `images.remotePatterns` para el bucket de comunidad (ADR-0021) → `next/image` optimiza de verdad (a diferencia del catálogo, que es export estático). El contenido vive en `content/` (ADR-0004); `lib/landing.ts` ya define el patrón de loader server-only (`gray-matter`, `CONTENT_ROOT`, `mediaUrl`, normalizador `str()`, campo `estado: borrador`). Hoy no hay renderizador markdown en el repo: solo parsers por `##` (`splitSecciones`, `parseSecciones`) y un convertidor de `**negritas**` a mano. Las notas de comunidad necesitan markdown editorial completo.

## Goals / Non-Goals

**Goals:**
- Un renderizador markdown reutilizable, seguro y con el estilo del proyecto.
- Esquema + loader tipado de la nota, base para las páginas (#71–#74).
- Una nota de ejemplo que ejercite el renderer end-to-end.

**Non-Goals:**
- Páginas de noticias; migrar landing/privacidad; HTML crudo; tocar el catálogo; `@tailwindcss/typography`.

## Decisions

**D1 — `react-markdown` + `remark-gfm`.** React-native (sin `dangerouslySetInnerHTML`), renderiza en **Server Component**, permite mapear cada elemento (`components={{...}}`) a tokens. `remark-gfm` añade tablas, listas de tareas, autolinks y tachado. *Alternativas descartadas:* MDX (ejecuta JSX → riesgo + overkill), `markdown-to-jsx` (menos ecosistema/control), `marked`+sanitize (regresa a `dangerouslySetInnerHTML`).

**D2 — Sanitización segura por construcción.** El contenido lo escribe el equipo en el repo (revisado en PR). `react-markdown` **no** renderiza HTML embebido salvo que se active `rehype-raw` → **no se activa**. Por tanto no se necesita `rehype-sanitize`. El ADR-0026 lo deja explícito y registra la regla: *si alguna vez se permite HTML en el cuerpo, añadir `rehype-sanitize` con allowlist*.

**D3 — `components/ui/Markdown.tsx` mapeado a tokens.** Server Component que recibe `{ children: string }` (el markdown) y un `className` opcional para el contenedor. Define el estilo de `h2/h3`, `p`, `ul/ol/li`, `a`, `blockquote`, `strong/em`, `code/pre`, `hr`, `img` con las clases/tokens del proyecto (familia serif para títulos, `text-ink`/`text-forest-deep`, etc.). NO añade `@tailwindcss/typography` (disciplina de tokens). Los `h1` del cuerpo se degradan a `h2` visual (el `h1` de la página lo pone la plantilla).

**D4 — Enlaces seguros.** `a` → si el `href` es externo (`http(s)://` y no es el dominio propio) abre con `target="_blank" rel="noopener noreferrer"`; internos (`/...`) usan `next/link`. Sin `javascript:`/esquemas raros (react-markdown ya filtra URLs peligrosas por defecto).

**D5 — Imágenes con `next/image` (opción a).** `img` → `next/image` con `fill` dentro de un contenedor con **aspect-ratio fijo** (p. ej. `aspect-[16/9]`, ancho completo del cuerpo, `rounded`, `object-cover`). El `alt` viene del markdown. El `src` se resuelve con `mediaUrl()` si es ruta de bucket; los `remotePatterns` ya cubren el host. Convención: imágenes de cuerpo = banda ancha. *Descartada (b):* `<img loading=lazy>` plano — más simple pero renuncia a la optimización que el sitio sí puede dar.

**D6 — Esquema de nota.** `content/noticias/<slug>.md` frontmatter:
| Campo | Tipo | Nota |
|---|---|---|
| `titulo` | str req | |
| `slug` | str req | kebab-case; debe coincidir con el nombre de archivo |
| `fecha` | str req | ISO `YYYY-MM-DD` |
| `resumen` | str req | para el listado/OG |
| `autor` | str opc | |
| `portada` | str opc | ruta en el bucket (vía `mediaUrl`) |
| `portadaAlt` | str opc | obligatorio si hay `portada` |
| `estado` | `borrador`\|`publicado` | default `borrador` |
| `tags` | str[] opc | |
Cuerpo: markdown editorial. Sin PII (contenido público).

**D7 — Loader `lib/noticias.ts`.** Espejo de `landing.ts`: `NOTICIAS_DIR = CONTENT_ROOT/noticias`. `getAllNoticias()` lee todos los `*.md` (ignora `_*` y `README`), tipa el frontmatter, **ordena por `fecha` desc**, y **excluye `estado: borrador` cuando es producción** (`process.env.NODE_ENV === "production"` o `ENV`/flag equivalente; en dev se muestran para previsualizar). `getNoticia(slug)` devuelve una nota (o null) con su cuerpo markdown crudo (lo renderiza la página con `Markdown.tsx`). Tipos `Noticia`/`NoticiaMeta` exportados (seguros en cliente; el loader es server-only).

**D8 — Convivencia.** `splitSecciones`/`parseSecciones` se quedan: dirigen *layout* estructurado (hero, secciones-tarjeta), no markdown libre. `Markdown.tsx` es para cuerpos editoriales. Migrar `/privacidad` es opcional y futuro.

**D9 — ADR-0026 + índice.** Nuevo ADR Accepted (número 0026, el siguiente). Entrada en `docs/adr/_index.md`. Nota en CLAUDE.md de que ya hay una dependencia de markdown (deja de ser cierto "cero deps").

## Risks / Trade-offs

- **react-markdown en RSC** → funciona (render puro, sin hooks de cliente); si una página futura necesita interactividad, se aísla aparte. Sin riesgo aquí.
- **next/image con ratio fijo** → recorta imágenes que no sean ~16:9. Mitigación: es convención editorial (banda ancha); el `alt` se conserva. Si se necesita otra proporción, se parametriza después.
- **Peso de la dependencia** → react-markdown + remark-gfm añaden ~Kb al bundle del sitio. Aceptable: el sitio es server-rendered y el contenido editorial lo justifica. El ADR lo documenta.
- **`borrador` filtrado por entorno** → un borrador no aparece en prod pero sí en dev. Riesgo: olvidar publicarlo. Mitigación: el listado de dev los marca; criterio explícito en el README.

## Migration Plan

Sin migración de datos: `content/noticias/` es nuevo (README + nota de ejemplo). Instalar deps en `apps/sitio` (`npm i react-markdown remark-gfm`). Sin cambios en build/deploy más allá del bundle. Rollback = revertir el commit (no hay datos productivos; las páginas aún no existen).

## Open Questions

- **Proporción exacta de la imagen de cuerpo** (16:9 propuesto) — se fija en el componente; ajustable luego sin romper contenido.
- **Bandera de entorno para `borrador`** — se usa `NODE_ENV === "production"`; si el deploy define otra señal, se alinea en la implementación.
