## ADDED Requirements

### Requirement: Sitemap global del sitio

`apps/sitio` SHALL exponer un `sitemap.xml` válido generado por la convención nativa de Next (`app/sitemap.ts`), con **URLs absolutas** bajo `https://chirimoyo.org` para las rutas públicas: `/`, `/comunidad`, `/voluntarios`, `/aliados`, `/galeria`, `/contacto` y `/privacidad`. El sitemap SHALL excluir rutas no indexables (`not-found`, `error`). Al ser dominio único (ADR-0023), SHALL existir **un solo** sitemap, sin lógica condicional por host.

#### Scenario: Sitemap servido y válido
- **WHEN** se solicita `https://chirimoyo.org/sitemap.xml`
- **THEN** responde un XML válido que lista las rutas públicas con URLs absolutas bajo `https://chirimoyo.org`

#### Scenario: Rutas no públicas excluidas
- **WHEN** se inspecciona el sitemap
- **THEN** no incluye rutas de error (`not-found`, `error`) ni hosts de subdominio vanity

### Requirement: Robots del sitio

`apps/sitio` SHALL exponer un `robots.txt` válido generado por la convención nativa de Next (`app/robots.ts`) que permita la indexación del contenido público y referencie el sitemap absoluto (`https://chirimoyo.org/sitemap.xml`). SHALL existir un único `robots.txt` para el dominio.

#### Scenario: Robots servido y referencia el sitemap
- **WHEN** se solicita `https://chirimoyo.org/robots.txt`
- **THEN** responde un robots válido que permite indexar el contenido público y declara `Sitemap: https://chirimoyo.org/sitemap.xml`

### Requirement: Canónico explícito por página

Cada página pública de `apps/sitio` SHALL declarar su URL canónica explícita mediante `alternates.canonical`, anclada a `https://chirimoyo.org` por su path (el landing usa `/`). El canónico SHALL apuntar siempre al dominio único `chirimoyo.org`, de modo que los hosts vanity (`comunidad.*`, `voluntarios.*`) no generen contenido duplicado aunque su redirect 301 aún no esté configurado.

#### Scenario: Cada página emite su canónico
- **WHEN** se renderiza cualquier página pública (`/`, `/comunidad`, `/voluntarios`, `/aliados`, `/galeria`, `/contacto`, `/privacidad`)
- **THEN** su `<head>` incluye un `<link rel="canonical">` hacia `https://chirimoyo.org/<path>` correspondiente

#### Scenario: Canónico ancla en el dominio único
- **WHEN** la misma ruta es servida desde un host vanity sin 301
- **THEN** el canónico declarado sigue apuntando a `https://chirimoyo.org/<path>`, no al host vanity

### Requirement: Twitter cards en la metadata

La metadata base de `apps/sitio` SHALL incluir Twitter cards (`card: summary_large_image`) con título, descripción e imagen de portada del humedal (`og-default.jpg`), heredadas por todas las páginas junto con el OpenGraph base ya existente.

#### Scenario: Twitter card presente al compartir
- **WHEN** se inspecciona el `<head>` de cualquier página
- **THEN** existen las metaetiquetas `twitter:card` (= `summary_large_image`), `twitter:title`, `twitter:description` y `twitter:image`

### Requirement: Metadata propia del landing raíz

El landing raíz (`app/page.tsx`) SHALL declarar su propia `metadata` con título y descripción intencionales del landing y su canónico `/`, en lugar de heredar únicamente el default del layout.

#### Scenario: Landing con metadata propia
- **WHEN** se comparte o se inspecciona `https://chirimoyo.org/`
- **THEN** muestra el título y la descripción propios del landing y su canónico apunta a `https://chirimoyo.org/`

### Requirement: Datos estructurados Organization

El landing SHALL incluir datos estructurados JSON-LD de tipo `Organization` (nombre, URL, logo y, cuando aplique, redes en `sameAs`), inyectados en build como Server Component sin costo en cliente.

#### Scenario: JSON-LD Organization en el landing
- **WHEN** se inspecciona el HTML del landing
- **THEN** existe un `<script type="application/ld+json">` con un objeto `Organization` válido (nombre, URL y logo del proyecto)

### Requirement: Compartibilidad verificada

El OpenGraph y las Twitter cards del sitio SHALL renderizar correctamente al compartir una URL en plataformas de mensajería y redes (WhatsApp, Facebook), mostrando título, descripción e imagen.

#### Scenario: Vista previa correcta al compartir
- **WHEN** se comparte una URL del sitio en WhatsApp o Facebook (o su validador de OG/cards)
- **THEN** la vista previa muestra el título, la descripción y la imagen de portada esperados
