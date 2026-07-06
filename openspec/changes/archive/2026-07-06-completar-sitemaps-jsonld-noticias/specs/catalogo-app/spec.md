## MODIFIED Requirements

### Requirement: SEO, sitemap y robots del catálogo de fauna

El catálogo SHALL exponer `sitemap` y `robots` coherentes con el dominio `fauna.chirimoyo.org`, derivando las URLs de la base pública parametrizada. El sitemap SHALL incluir la home (hub), los índices de grupo con fichas (`/aves`, `/anfibios`, `/reptiles`), `/aves/buscador`, la búsqueda general (`/busqueda`), la página de colaboradores (`/colaboradores`) y las fichas `/<grupo>/<slug>` existentes; PUEDE incluir las páginas «próximamente» de grupos sin fichas. Las URLs SHALL ser absolutas sobre `https://fauna.chirimoyo.org`.

#### Scenario: Sitemap sobre el dominio de fauna
- **WHEN** se genera el sitemap del catálogo
- **THEN** sus URLs son absolutas bajo `https://fauna.chirimoyo.org` e incluyen el hub, los índices de grupo con fichas (`/aves`, `/anfibios`, `/reptiles`), `/aves/buscador`, `/busqueda`, `/colaboradores` y las fichas existentes

#### Scenario: Robots coherente con el dominio
- **WHEN** se inspecciona `robots`
- **THEN** referencia el sitemap del dominio `fauna.chirimoyo.org`
