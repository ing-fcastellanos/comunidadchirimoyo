# Tasks — noticias-foundation

## 1. ADR + dependencias

- [x] 1.1 Escribir `docs/decisions/0026-renderizador-markdown.md` (Accepted): contexto (parsers caseros, necesidad editorial), decisión (`react-markdown` + `remark-gfm`), alcance de elementos permitidos, **sanitización segura por construcción** (sin `rehype-raw`; regla futura: `rehype-sanitize` si se permite HTML), convivencia con `splitSecciones`/`parseSecciones`, alternativas descartadas (MDX, markdown-to-jsx, marked+sanitize)
- [x] 1.2 Añadir la entrada de ADR-0026 en `docs/adr/_index.md`
- [x] 1.3 Instalar deps en `apps/sitio`: `npm i react-markdown remark-gfm` (verificar que quedan en `dependencies`)
- [x] 1.4 Nota menor en `CLAUDE.md`: ya existe una dependencia de markdown (deja de ser cierto "cero deps de markdown"; remite a ADR-0026)

## 2. Componente Markdown

- [x] 2.1 `apps/sitio/components/ui/Markdown.tsx` — Server Component `({ children, className }: { children: string; className?: string })`; usa `ReactMarkdown` con `remarkPlugins={[remarkGfm]}`, **sin** `rehype-raw`/`dangerouslySetInnerHTML`
- [x] 2.2 `components` mapeados a tokens: `h2`/`h3` (serif, forest-deep), `p`, `ul`/`ol`/`li`, `blockquote`, `strong`/`em`, `code`/`pre`, `hr`; degradar `h1` del cuerpo a estilo `h2`
- [x] 2.3 `a` → enlace seguro: externos (`http(s)://` fuera del dominio) con `target="_blank" rel="noopener noreferrer"`; internos con `next/link`
- [x] 2.4 `img` → `next/image` con `fill` en contenedor `aspect-[16/9]` ancho completo, `object-cover`, `rounded`; `alt` del markdown; resolver `src` de bucket con `mediaUrl` si aplica

## 3. Esquema + loader de noticias

- [x] 3.1 `apps/sitio/lib/noticias.ts` — `NOTICIAS_DIR = CONTENT_ROOT/noticias`; tipos `Noticia` (frontmatter + `cuerpo`) y `NoticiaMeta` (sin cuerpo) exportados; reusa `gray-matter`, `str()`/normalizadores y `mediaUrl` (patrón de `landing.ts`)
- [x] 3.2 `getAllNoticias()` — lee `*.md` (ignora `_*` y `README`), tipa, **ordena por `fecha` desc**, **excluye `borrador` en producción** (`process.env.NODE_ENV === "production"`); en dev incluye borradores
- [x] 3.3 `getNoticia(slug)` — devuelve la nota con su cuerpo markdown crudo, o `null` si no existe

## 4. Contenido

- [x] 4.1 `content/noticias/README.md` — esquema (campos, `fecha` ISO, `slug` kebab-case, `estado`, imágenes optimizadas en bucket ADR-0021), convenciones y relación con el renderer
- [x] 4.2 Una nota de ejemplo `content/noticias/<slug>.md` (`estado: borrador`) que ejercite el renderer: encabezados, párrafos, **negrita**/_énfasis_, lista, enlace externo, una imagen y una cita

## 5. Verificación

- [x] 5.1 `npm run build` (o `typecheck`) en `apps/sitio` sin errores; tipos de `noticias.ts` y `Markdown.tsx` correctos
- [x] 5.2 Render de prueba: montar `Markdown` con el cuerpo de la nota de ejemplo (ruta temporal o test ad-hoc) → enlaces externos con `rel/target`, imagen vía `next/image`, lista/cita con estilo; sin HTML crudo ejecutado
- [x] 5.3 `getAllNoticias()` devuelve la nota de ejemplo en dev; con `NODE_ENV=production` la excluye por ser `borrador`; `getNoticia(slug)` la encuentra
- [x] 5.4 Confirmar que el landing (`/`) y `/privacidad` siguen renderizando igual (parsers caseros intactos)