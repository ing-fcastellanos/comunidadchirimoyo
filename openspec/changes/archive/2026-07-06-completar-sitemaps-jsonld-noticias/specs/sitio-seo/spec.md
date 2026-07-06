## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Datos estructurados de noticias

El detalle de nota (`/comunidad/noticias/<slug>`) SHALL incluir datos estructurados JSON-LD de tipo `NewsArticle`, inyectados en el servidor como Server Component sin costo en cliente. El objeto SHALL declarar al menos `headline` (título de la nota) y, cuando el dato exista, `description` (resumen), `datePublished` (fecha de publicación en ISO), `author` (Person con el nombre del autor), `image` (URL absoluta de la portada), `publisher` (Organization del proyecto) y `mainEntityOfPage` (URL canónica absoluta de la nota). Los campos cuyo dato no exista SHALL omitirse (no emitir claves vacías o `undefined`), de modo que el JSON-LD siga siendo válido.

#### Scenario: NewsArticle en el detalle de nota
- **WHEN** se inspecciona el HTML de una nota (`/comunidad/noticias/<slug>`)
- **THEN** existe un `<script type="application/ld+json">` con un objeto `NewsArticle` válido cuyo `headline` es el título de la nota y cuyo `mainEntityOfPage` apunta a la URL canónica de la nota

#### Scenario: Campos opcionales omitidos cuando faltan
- **WHEN** una nota no tiene autor o no tiene portada
- **THEN** el `NewsArticle` omite las claves correspondientes (`author` / `image`) y permanece siendo JSON válido
