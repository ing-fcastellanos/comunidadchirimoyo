# catalogo-app Specification

## Purpose
TBD - created by archiving change scaffold-catalogo-app. Update Purpose after archive.
## Requirements
### Requirement: App del catálogo compila a estático

`apps/catalogo` SHALL ser una app Next.js 15 (App Router, TypeScript) configurada con `output: "export"`, de modo que `npm run build` produzca un directorio `out/` con HTML/CSS/JS estático y sin requerir un servidor Node en runtime. La app NO SHALL usar Cloud Run ni Dockerfile.

#### Scenario: Build estático
- **WHEN** se ejecuta `npm run build` en `apps/catalogo`
- **THEN** se genera `out/` con la app estática y el proceso termina sin errores

#### Scenario: Sin servidor en runtime
- **WHEN** se inspecciona la configuración de despliegue
- **THEN** no existe `Dockerfile` ni rewrite a Cloud Run; Firebase Hosting sirve `out/` directamente

### Requirement: Integración del sistema de diseño

La app SHALL consumir el sistema de diseño canónico: `app/globals.css` SHALL importar Tailwind y los tokens (`@import "tailwindcss";` + `@import "./tokens.css";`), donde `app/tokens.css` se genera con `scripts/sync-design-tokens.mjs`. Las fuentes (Cormorant Garamond + Source Sans 3) SHALL cargarse vía `next/font` desde `lib/fonts.ts` y aplicarse en `<html>`. Las primitivas (`Badge`, `Section`, `SectionTitle`, `Icon`) SHALL existir en `components/ui/` y `lucide-react` SHALL ser dependencia.

#### Scenario: Tokens activos
- **WHEN** un componente usa `bg-forest` o `font-serif`
- **THEN** resuelven a los valores del sistema de diseño (paleta del handoff, Cormorant Garamond)

#### Scenario: Primitivas disponibles
- **WHEN** se importa `Badge`, `Section`, `SectionTitle` o `Icon` desde `components/ui/`
- **THEN** compilan en TypeScript y usan los tokens, sin colores hardcodeados ad hoc

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

### Requirement: Acceso a contenido en build

La app SHALL incluir `lib/content.ts` que resuelva la raíz del contenido del repo
(`content/fauna/`) en build, con la ruta por defecto relativa a la raíz del monorepo y
override mediante la variable de entorno `CONTENT_DIR`. El loader `getAllFichas()` SHALL
dejar de ser un stub: SHALL descubrir las fichas `content/fauna/<grupo>/<slug>/index.md`,
parsear su frontmatter YAML y sus secciones de cuerpo (`##`) a objetos `FichaEspecie`
tipados, y validar el núcleo del esquema de #9. El build SHALL fallar si alguna ficha
tiene el núcleo incompleto; los campos opcionales/⊙ ausentes SHALL tolerarse. Las carpetas
con prefijo `_` (p. ej. `_ejemplo`, `_origen`) SHALL excluirse del catálogo.

#### Scenario: Loader resuelve la raíz de contenido
- **WHEN** se invoca el loader de contenido en build
- **THEN** resuelve `content/fauna/` desde la raíz del repo (o desde `CONTENT_DIR` si está definido) sin depender de un contexto Docker

#### Scenario: Loader parsea fichas reales
- **WHEN** se ejecuta `getAllFichas()` en build con fichas presentes en `content/fauna/aves/`
- **THEN** devuelve un `FichaEspecie[]` con el frontmatter y las secciones de cuerpo parseadas, excluyendo carpetas con prefijo `_`

#### Scenario: Build falla ante núcleo incompleto
- **WHEN** una ficha carece de un campo del núcleo del esquema
- **THEN** el loader lanza un error que identifica la ficha y el campo, y el build no produce `out/`

### Requirement: Configuración de despliegue estático

La app SHALL incluir `firebase.json` con `"public": "out"` y un único target de hosting `prod` (sin Cloud Run), `.firebaserc` con el proyecto `chirimoyo` y el target del site de `fauna.chirimoyo.org`, y un script `deploy_prod` que ejecute `next build` seguido de `firebase deploy --only hosting:prod`. El rename efectivo del site en la consola de Firebase y el DNS son pasos manuales fuera del repo.

#### Scenario: Deploy sirve estáticos
- **WHEN** se revisa `firebase.json`
- **THEN** publica el directorio `out/` directamente, sin rewrite a un servicio de Cloud Run

#### Scenario: Target apunta al site de fauna
- **WHEN** se revisa `.firebaserc`
- **THEN** el target de hosting referencia el site de `fauna.chirimoyo.org`

### Requirement: Ruta generalizada por grupo

La app SHALL exponer la estructura de rutas del catálogo bajo un segmento dinámico de grupo, de modo que `/<grupo>` (índice del grupo), `/<grupo>/buscador` (buscador del grupo) y `/<grupo>/<slug>` (detalle) compartan una única jerarquía `app/[grupo]/…` válida para `aves`, `anfibios` y `reptiles` y extensible a grupos futuros (insectos, mamíferos) sin crear carpetas estáticas por grupo. `generateStaticParams` SHALL acotar los grupos válidos y, junto con `dynamicParams = false`, SHALL generar solo las rutas existentes (export estático).

#### Scenario: Grupos válidos generados
- **WHEN** se ejecuta `npm run build`
- **THEN** se generan las rutas de los grupos válidos (`/aves`, `/anfibios`, `/reptiles`) desde la jerarquía `app/[grupo]/…`, sin carpetas estáticas duplicadas por grupo

#### Scenario: Grupo inexistente no se genera
- **WHEN** se solicita un grupo fuera del conjunto válido
- **THEN** no existe una ruta estática para él (acotado por `generateStaticParams` + `dynamicParams = false`)

### Requirement: SEO, sitemap y robots del catálogo de fauna

El catálogo SHALL exponer `sitemap` y `robots` coherentes con el dominio `fauna.chirimoyo.org`, derivando las URLs de la base pública parametrizada. El sitemap SHALL incluir la home (hub), los índices de grupo con fichas (`/aves`, `/anfibios`, `/reptiles`), `/aves/buscador` y las fichas `/<grupo>/<slug>` existentes; PUEDE incluir las páginas «próximamente» de grupos sin fichas. Las URLs SHALL ser absolutas sobre `https://fauna.chirimoyo.org`.

#### Scenario: Sitemap sobre el dominio de fauna
- **WHEN** se genera el sitemap del catálogo
- **THEN** sus URLs son absolutas bajo `https://fauna.chirimoyo.org` e incluyen el hub, los índices de grupo con fichas (`/aves`, `/anfibios`, `/reptiles`), `/aves/buscador` y las fichas existentes

#### Scenario: Robots coherente con el dominio
- **WHEN** se inspecciona `robots`
- **THEN** referencia el sitemap del dominio `fauna.chirimoyo.org`

### Requirement: Convenciones del monorepo

La app SHALL seguir las convenciones del proyecto: alias de import `@/*` a la raíz de la app, `cn()` en `lib/utils.ts` (clsx + tailwind-merge), `components.json` de shadcn, scripts `dev`/`build`/`start`/`lint`/`typecheck`, y NO SHALL introducir `packages/` ni workspaces.

#### Scenario: Alias y utilidades
- **WHEN** se importa desde `@/components/...` o se usa `cn(...)`
- **THEN** resuelven correctamente y `npm run typecheck` pasa

#### Scenario: Sin tooling de monorepo
- **WHEN** se revisa la estructura
- **THEN** la app se construye de forma independiente, sin workspaces ni dependencias hacia otras apps

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

