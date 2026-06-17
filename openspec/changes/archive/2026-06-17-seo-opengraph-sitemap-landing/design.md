## Context

`apps/sitio` ya tiene la base de metadata en `app/layout.tsx`: `metadataBase = https://chirimoyo.org`, título con `template`, descripción, OpenGraph (`siteName`, `description`, `locale`, `type`, imagen `og-default.jpg`), favicons y `manifest`. Los assets viven en `public/`. Seis de las siete páginas públicas ya exportan `metadata` propia (`/comunidad`, `/voluntarios`, `/aliados`, `/galeria`, `/contacto`, `/privacidad`); el landing raíz (`app/page.tsx`) no.

Con ADR-0023 (implementado en #75/#79) todas las secciones se sirven como **paths de un único dominio** (`chirimoyo.org/comunidad`, etc.) y se eliminó el `middleware.ts` de ruteo por host. Los enlaces internos ya son rutas relativas (`lib/links.ts`). Quedan los subdominios `comunidad.*` y `voluntarios.*` como **redirects 301 vanity**, pero esos 301 **aún no están configurados** (el `firebase.json` solo declara el site `chirimoyo`); su configuración pertenece al deploy #53.

Faltan las piezas de descubribilidad: sitemap, robots, canónicos explícitos, Twitter cards, metadata del landing y datos estructurados.

## Goals / Non-Goals

**Goals:**
- Servir un `sitemap.xml` y un `robots.txt` válidos vía las convenciones nativas de Next 15 (`app/sitemap.ts`, `app/robots.ts`).
- Declarar el **canónico explícito** de cada página pública, anclado a `chirimoyo.org` por path.
- Completar OpenGraph con **Twitter cards** y dar al landing raíz su metadata propia.
- Agregar datos estructurados `Organization` (JSON-LD) básicos en el landing.
- Verificar que compartir cualquier URL muestra título, descripción e imagen correctos.

**Non-Goals:**
- Configurar los redirects 301 de los hosts vanity (deploy #53).
- Analítica/seguimiento (#24, change `analitica-privada-cloudflare`).
- Imágenes OG por página o generadas dinámicamente (se reutiliza `og-default.jpg`).
- Cambiar `metadataBase`, OpenGraph base, favicons o manifest existentes.
- Tocar `apps/catalogo`.

## Decisions

### 1. Sitemap y robots con las convenciones nativas de Next (`app/sitemap.ts`, `app/robots.ts`)
Next 15 genera `sitemap.xml` y `robots.txt` desde archivos `MetadataRoute`. Es la vía idiomática, sin dependencias ni archivos estáticos que mantener a mano.
- **Alternativa descartada:** archivos estáticos en `public/sitemap.xml` y `public/robots.txt` → se desincronizan al agregar rutas y no resuelven URLs absolutas desde `metadataBase`.
- **Nota multi-host (ya resuelta):** como ADR-0023 elimina el ruteo por host, no hace falta lógica condicional por `Host`; un único sitemap/robots de dominio sirve para todo. El antiguo `matcher` del middleware ya no existe, así que no hay interferencia con `/sitemap.xml` ni `/robots.txt`.

### 2. Sitemap global con URLs absolutas bajo `chirimoyo.org`
Lista las rutas públicas: `/`, `/comunidad`, `/voluntarios`, `/aliados`, `/galeria`, `/contacto`, `/privacidad`. Las URLs se construyen contra `https://chirimoyo.org` (consistente con `metadataBase`). Se excluyen rutas no indexables (`not-found`, `error`).
- La lista de rutas se mantiene como un arreglo explícito en `sitemap.ts` (el sitio es pequeño y de rutas conocidas); no se auto-descubre el árbol de `app/`.

### 3. Canónicos explícitos por página (`alternates.canonical`)
Cada página pública declara `alternates: { canonical: "/<ruta>" }` (relativa, resuelta contra `metadataBase`). El landing usa `canonical: "/"`.
- **Por qué explícito y no solo `metadataBase`:** mientras los hosts vanity `comunidad.*`/`voluntarios.*` no tengan su 301 (pendiente de #53), podrían servir el mismo contenido bajo otro host y generar **contenido duplicado**. El canónico apuntando siempre a `chirimoyo.org/<path>` es el seguro que consolida la autoridad en el dominio único, exista o no el 301 todavía.
- **Alternativa descartada:** confiar solo en `metadataBase` + ruta implícita → Next no emite `<link rel="canonical">` salvo que se declare `alternates.canonical`; sin él, los hosts vanity quedan sin señal canónica.

### 4. Twitter cards en el layout (no por página)
Se añade `twitter: { card: "summary_large_image", title, description, images: ["/og-default.jpg"] }` en el `metadata` del layout, heredado por todas las páginas (igual que el OpenGraph base). El `title.template` y los títulos por página siguen aplicando.

### 5. Metadata propia del landing raíz
`app/page.tsx` exporta su `metadata` con título y descripción propios del landing y `alternates.canonical: "/"`. Hoy hereda el default; con esto el landing tiene su par título/descripción intencional para compartir.

### 6. JSON-LD `Organization` en el landing (opcional, incluido)
Se inyecta un `<script type="application/ld+json">` con `Organization` (nombre, URL, logo, `sameAs` con redes desde `content/landing/enlaces.json` si aplica) en el Server Component del landing. Estático en build, sin costo en cliente.
- **Alternativa descartada:** datos estructurados en todas las páginas → innecesario para un sitio pequeño; `Organization` en el home cubre el caso de marca.

## Risks / Trade-offs

- **Hosts vanity sirviendo contenido sin 301 antes de #53** → Mitigación: los canónicos explícitos (decisión 3) consolidan la autoridad en `chirimoyo.org` aunque el 301 aún no exista; el riesgo de duplicado queda acotado.
- **Lista de rutas del sitemap mantenida a mano** → Mitigación: el sitio es pequeño y de rutas conocidas; al agregar una sección pública se actualiza el arreglo (se deja comentario recordatorio en `sitemap.ts`). Coste menor frente a la complejidad de auto-descubrir el árbol de rutas.
- **Validación de OG depende de servicios externos (caché de WhatsApp/Facebook)** → Mitigación: validar con el depurador de OG/Card validator y, si hay caché previa, forzar re-scrape; la verificación es manual y se documenta en tasks.
- **`Organization` con `sameAs` derivado de contenido** → si `enlaces.json` cambia de forma, el JSON-LD podría quedar inconsistente → Mitigación: derivarlo del mismo data-layer que ya usa el Footer, o, si añade complejidad, sembrar un conjunto mínimo y constante de campos.
