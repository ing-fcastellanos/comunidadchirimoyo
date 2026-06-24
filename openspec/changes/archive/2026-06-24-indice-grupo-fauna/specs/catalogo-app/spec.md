## ADDED Requirements

### Requirement: Índice de grupo con grilla de especies

El índice de un grupo (`/<grupo>`) que tiene fichas y no es `aves` SHALL renderizar, como Server Component sin JavaScript de cliente, un **encabezado de grupo** (eyebrow `Catálogo de fauna · <Grupo>`, título, conteo de especies e intro breve) seguido de una **grilla plana** con **todas** las especies del grupo, ordenadas por `nombreComun`, donde cada tarjeta enlaza a `/<grupo>/<slug>`. La tarjeta SHALL ser group-agnostic: SHALL mostrar los atributos que la especie declara (tamaño, colores, categoría, presencia, ocurrencia, NOM-059) y SHALL omitir los atributos que no aplican (p. ej. `forma`/`dónde` de la herpetofauna) sin dejar huecos. El grupo `aves` SHALL conservar su landing curado propio (hero + secciones), sin ser sustituido por la grilla. Un grupo válido **sin fichas** SHALL seguir mostrando el placeholder «Próximamente»; un grupo **fuera del conjunto válido** SHALL dar 404 (acotado por `generateStaticParams` + `dynamicParams = false`). El índice NO SHALL enlazar todavía al buscador del grupo (`/<grupo>/buscador`), pendiente de su implementación.

#### Scenario: Índice de herpetofauna lista sus especies
- **WHEN** se abre `/anfibios` (grupo con fichas, distinto de aves)
- **THEN** se muestra el encabezado del grupo con el conteo y una grilla con todas las especies del grupo, cada tarjeta enlazando a `/anfibios/<slug>`

#### Scenario: Tarjeta group-aware sin huecos
- **WHEN** una tarjeta corresponde a una especie de herpetofauna que no declara `forma` ni `dónde`
- **THEN** la tarjeta muestra los atributos presentes (tamaño, colores, categoría, estatus) y omite los aviares, sin huecos visuales

#### Scenario: Aves conserva su landing
- **WHEN** se abre `/aves`
- **THEN** se renderiza el landing curado de aves (hero + secciones), no la grilla de índice de grupo

#### Scenario: Grupo válido sin fichas
- **WHEN** se abre el índice de un grupo válido que aún no tiene fichas en disco
- **THEN** se muestra el placeholder «Próximamente», sin error

#### Scenario: Grupo inexistente
- **WHEN** se solicita `/<grupo>` fuera del conjunto válido
- **THEN** no existe ruta estática para él (404)

## MODIFIED Requirements

### Requirement: SEO, sitemap y robots del catálogo de fauna

El catálogo SHALL exponer `sitemap` y `robots` coherentes con el dominio `fauna.chirimoyo.org`, derivando las URLs de la base pública parametrizada. El sitemap SHALL incluir la home (hub), los índices de grupo con fichas (`/aves`, `/anfibios`, `/reptiles`), `/aves/buscador` y las fichas `/<grupo>/<slug>` existentes; PUEDE incluir las páginas «próximamente» de grupos sin fichas. Las URLs SHALL ser absolutas sobre `https://fauna.chirimoyo.org`.

#### Scenario: Sitemap sobre el dominio de fauna
- **WHEN** se genera el sitemap del catálogo
- **THEN** sus URLs son absolutas bajo `https://fauna.chirimoyo.org` e incluyen el hub, los índices de grupo con fichas (`/aves`, `/anfibios`, `/reptiles`), `/aves/buscador` y las fichas existentes

#### Scenario: Robots coherente con el dominio
- **WHEN** se inspecciona `robots`
- **THEN** referencia el sitemap del dominio `fauna.chirimoyo.org`
