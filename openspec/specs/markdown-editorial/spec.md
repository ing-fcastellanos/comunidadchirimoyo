# markdown-editorial Specification

## Purpose
TBD - created by archiving change noticias-foundation. Update Purpose after archive.
## Requirements
### Requirement: Renderizador de markdown editorial

`apps/sitio` SHALL proveer un componente reutilizable (`components/ui/Markdown.tsx`) que renderice contenido markdown editorial a React, basado en `react-markdown` con `remark-gfm` (tablas, listas, autolinks, tachado). El componente SHALL ser un Server Component y NO SHALL usar `dangerouslySetInnerHTML`. La decisión de introducir la dependencia SHALL quedar registrada en un ADR (rompe la convención de "cero dependencias de markdown").

#### Scenario: Markdown editorial renderiza
- **WHEN** se pasa al componente un markdown con encabezados, párrafos, enlaces, listas, citas e imágenes
- **THEN** se renderiza el contenido equivalente en React con el estilo del proyecto, sin inyectar HTML crudo

#### Scenario: GFM soportado
- **WHEN** el markdown usa elementos GFM (p. ej. una tabla o una lista de tareas)
- **THEN** se renderizan correctamente

### Requirement: Seguridad por construcción (sin HTML crudo)

El renderizador NO SHALL habilitar HTML embebido en el markdown (no se usa `rehype-raw`); el contenido es de autoría confiable del repo. Las URLs peligrosas (p. ej. `javascript:`) SHALL ser neutralizadas por el comportamiento por defecto del renderizador. Si en el futuro se permitiera HTML en el cuerpo, SHALL añadirse una etapa de sanitización con allowlist.

#### Scenario: HTML embebido no se ejecuta
- **WHEN** un markdown contiene una etiqueta HTML cruda (p. ej. `<script>` o `<img onerror=...>`)
- **THEN** no se renderiza como HTML activo (se ignora o se escapa), sin ejecución

### Requirement: Estilo con tokens, enlaces seguros e imágenes optimizadas

El componente SHALL mapear los elementos markdown (`h2`/`h3`, `p`, listas, `a`, `blockquote`, `strong`/`em`, `code`, `hr`, `img`) a los **tokens de diseño** del proyecto, sin depender de `@tailwindcss/typography`. Los enlaces **externos** SHALL abrirse de forma segura (`target="_blank"` + `rel="noopener noreferrer"`); los internos PUEDEN usar la navegación de Next. Las imágenes del cuerpo SHALL renderizarse con `next/image` (optimización del sitio en Cloud Run), con su texto alternativo del markdown.

#### Scenario: Enlace externo seguro
- **WHEN** el markdown incluye un enlace a un dominio externo
- **THEN** el enlace renderizado abre en una pestaña nueva con `rel="noopener noreferrer"`

#### Scenario: Imagen con next/image
- **WHEN** el markdown incluye una imagen
- **THEN** se renderiza mediante `next/image` con su `alt`, dentro de un contenedor de proporción definida

