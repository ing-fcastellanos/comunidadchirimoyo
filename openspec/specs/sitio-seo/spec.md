# sitio-seo Specification

## Purpose
Definir el SEO, la descubribilidad y la compartibilidad de `apps/sitio` bajo el dominio único `chirimoyo.org` (ADR-0023): sitemap y robots globales, canónicos explícitos por página anclados al dominio único, Twitter cards y OpenGraph heredados, metadata propia del landing raíz y datos estructurados Organization, de modo que las URLs del sitio se indexen y se previsualicen correctamente al compartirse.
## Requirements
### Requirement: Sitemap global del sitio

`apps/sitio` SHALL exponer un `sitemap.xml` válido generado por la convención nativa de Next (`app/sitemap.ts`), con **URLs absolutas** bajo `https://chirimoyo.org`. El sitemap SHALL incluir las rutas públicas estáticas (`/`, `/comunidad`, `/voluntarios`, `/aliados`, `/galeria`, `/contacto`, `/privacidad`) **y** las rutas de noticias derivadas del contenido: el listado `/comunidad/noticias`, el detalle `/comunidad/noticias/<slug>` de cada nota existente, y las páginas de paginación `/comunidad/noticias/pagina/<n>` (n = 2..total de páginas). Las URLs de nota SHALL declarar `lastModified` con la fecha de publicación de la nota. El sitemap SHALL derivar las noticias de la misma fuente de verdad que el ruteo (para no desincronizarse) y SHALL excluir rutas no indexables (`not-found`, `error`). Al ser dominio único (ADR-0023), SHALL existir **un solo** sitemap, sin lógica condicional por host.

#### Scenario: Sitemap servido y válido
- **WHEN** se solicita `https://chirimoyo.org/sitemap.xml`
- **THEN** responde un XML válido que lista las rutas públicas con URLs absolutas bajo `https://chirimoyo.org`

#### Scenario: Noticias incluidas en el sitemap
- **WHEN** se inspecciona el sitemap y existen notas publicadas
- **THEN** incluye `/comunidad/noticias`, una entrada por cada `/comunidad/noticias/<slug>` existente (con `lastModified` = fecha de la nota) y las páginas `/comunidad/noticias/pagina/<n>` para n = 2..total de páginas

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

### Requirement: Datos estructurados de noticias

El detalle de nota (`/comunidad/noticias/<slug>`) SHALL incluir datos estructurados JSON-LD de tipo `NewsArticle`, inyectados en el servidor como Server Component sin costo en cliente. El objeto SHALL declarar al menos `headline` (título de la nota) y, cuando el dato exista, `description` (resumen), `datePublished` (fecha de publicación en ISO), `author` (Person con el nombre del autor), `image` (URL absoluta de la portada), `publisher` (Organization del proyecto) y `mainEntityOfPage` (URL canónica absoluta de la nota). Los campos cuyo dato no exista SHALL omitirse (no emitir claves vacías o `undefined`), de modo que el JSON-LD siga siendo válido.

#### Scenario: NewsArticle en el detalle de nota
- **WHEN** se inspecciona el HTML de una nota (`/comunidad/noticias/<slug>`)
- **THEN** existe un `<script type="application/ld+json">` con un objeto `NewsArticle` válido cuyo `headline` es el título de la nota y cuyo `mainEntityOfPage` apunta a la URL canónica de la nota

#### Scenario: Campos opcionales omitidos cuando faltan
- **WHEN** una nota no tiene autor o no tiene portada
- **THEN** el `NewsArticle` omite las claves correspondientes (`author` / `image`) y permanece siendo JSON válido

