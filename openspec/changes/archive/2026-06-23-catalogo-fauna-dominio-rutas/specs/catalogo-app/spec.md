## MODIFIED Requirements

### Requirement: Layout y metadata del catálogo

La app SHALL tener un `app/layout.tsx` con `Header` y `Footer` (en `components/layout/`, portados del handoff) y `metadata`/OpenGraph base con `metadataBase` apuntando a `https://fauna.chirimoyo.org`. La página de inicio (`/`) SHALL renderizar el **hub de fauna** (capacidad `catalogo-hub-fauna`) —no el landing de aves ni la pantalla de búsqueda— usando los tokens y primitivas del sistema de diseño. El `Header` SHALL presentar el catálogo como guía de **fauna** (sin nombrarlo "Guía de Aves" como conjunto completo) e incluir un enlace de búsqueda a `/busqueda`, visible como elemento accesible tanto en escritorio como en móvil. Mientras `/busqueda` sea el stub «próximamente», ese enlace conduce al stub. Los strings SHALL quedar preparados para i18n (ADR-0011), sin hardcodearlos de forma que impida traducir.

#### Scenario: Home sirve el hub de fauna
- **WHEN** se ejecuta `npm run dev` y se abre la home
- **THEN** se muestra el hub de fauna (carrusel, tarjetas de grupo y acceso a búsqueda), no el landing de aves ni la pantalla de búsqueda, usando la paleta, tipografía y primitivas del sistema de diseño

#### Scenario: Metadata apunta al dominio de fauna
- **WHEN** se inspecciona la metadata base del catálogo
- **THEN** `metadataBase` resuelve a `https://fauna.chirimoyo.org` y los OpenGraph absolutos se componen sobre esa base

#### Scenario: Acceso al buscador desde el Header
- **WHEN** se abre cualquier página del catálogo
- **THEN** el `Header` ofrece un enlace de búsqueda que navega a `/busqueda`

#### Scenario: El catálogo se nombra como fauna
- **WHEN** se revisa el `Header` y los títulos del catálogo
- **THEN** el conjunto del catálogo se presenta como guía de fauna, reservando "aves" para el grupo, no para el catálogo completo

### Requirement: Configuración de despliegue estático

La app SHALL incluir `firebase.json` con `"public": "out"` y un único target de hosting `prod` (sin Cloud Run), `.firebaserc` con el proyecto `chirimoyo` y el target del site de `fauna.chirimoyo.org`, y un script `deploy_prod` que ejecute `next build` seguido de `firebase deploy --only hosting:prod`. El rename efectivo del site en la consola de Firebase y el DNS son pasos manuales fuera del repo.

#### Scenario: Deploy sirve estáticos
- **WHEN** se revisa `firebase.json`
- **THEN** publica el directorio `out/` directamente, sin rewrite a un servicio de Cloud Run

#### Scenario: Target apunta al site de fauna
- **WHEN** se revisa `.firebaserc`
- **THEN** el target de hosting referencia el site de `fauna.chirimoyo.org`

## ADDED Requirements

### Requirement: Ruta generalizada por grupo

La app SHALL exponer la estructura de rutas del catálogo bajo un segmento dinámico de grupo, de modo que `/<grupo>` (índice del grupo), `/<grupo>/buscador` (buscador del grupo) y `/<grupo>/<slug>` (detalle) compartan una única jerarquía `app/[grupo]/…` válida para `aves`, `anfibios` y `reptiles` y extensible a grupos futuros (insectos, mamíferos) sin crear carpetas estáticas por grupo. `generateStaticParams` SHALL acotar los grupos válidos y, junto con `dynamicParams = false`, SHALL generar solo las rutas existentes (export estático).

#### Scenario: Grupos válidos generados
- **WHEN** se ejecuta `npm run build`
- **THEN** se generan las rutas de los grupos válidos (`/aves`, `/anfibios`, `/reptiles`) desde la jerarquía `app/[grupo]/…`, sin carpetas estáticas duplicadas por grupo

#### Scenario: Grupo inexistente no se genera
- **WHEN** se solicita un grupo fuera del conjunto válido
- **THEN** no existe una ruta estática para él (acotado por `generateStaticParams` + `dynamicParams = false`)

### Requirement: SEO, sitemap y robots del catálogo de fauna

El catálogo SHALL exponer `sitemap` y `robots` coherentes con el dominio `fauna.chirimoyo.org`, derivando las URLs de la base pública parametrizada. El sitemap SHALL incluir la home (hub), `/aves`, `/aves/buscador` y las fichas `/<grupo>/<slug>` existentes; PUEDE incluir las páginas «próximamente». Las URLs SHALL ser absolutas sobre `https://fauna.chirimoyo.org`.

#### Scenario: Sitemap sobre el dominio de fauna
- **WHEN** se genera el sitemap del catálogo
- **THEN** sus URLs son absolutas bajo `https://fauna.chirimoyo.org` e incluyen el hub, `/aves`, `/aves/buscador` y las fichas existentes

#### Scenario: Robots coherente con el dominio
- **WHEN** se inspecciona `robots`
- **THEN** referencia el sitemap del dominio `fauna.chirimoyo.org`
