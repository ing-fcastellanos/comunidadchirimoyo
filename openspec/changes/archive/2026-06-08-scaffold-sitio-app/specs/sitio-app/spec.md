## ADDED Requirements

### Requirement: App de sitio en Cloud Run

`apps/sitio` SHALL ser una app Next.js 15 (App Router, TypeScript) con `output: "standalone"`, empaquetada en un Dockerfile y desplegable a Cloud Run en `northamerica-south1`. A diferencia del catálogo, NO SHALL usar export estático (necesita un servidor para el ruteo por host).

#### Scenario: Build standalone
- **WHEN** se ejecuta `npm run build`
- **THEN** Next genera la salida `standalone` lista para empaquetar en Docker

#### Scenario: Servicio en Cloud Run
- **WHEN** se despliega
- **THEN** existe un servicio Cloud Run `sitio` en `northamerica-south1` que responde en el puerto 8080

### Requirement: Ruteo multi-subdominio por host

La app SHALL incluir un `middleware.ts` que enrute según el header `Host`: `chirimoyo.org` (y `www`) a la landing (`/`); `comunidad.chirimoyo.org` a `/comunidad`; `voluntarios.chirimoyo.org` a `/voluntarios`. El middleware NO SHALL interceptar `/_next`, archivos estáticos ni `/api`.

#### Scenario: Enrutado por host
- **WHEN** llega una petición con `Host: comunidad.chirimoyo.org` a `/`
- **THEN** la app renderiza la sección de comunidad (rewrite interno a `/comunidad`)

#### Scenario: Landing por defecto
- **WHEN** llega una petición con `Host: chirimoyo.org` a `/`
- **THEN** la app renderiza la landing sin rewrite

#### Scenario: Estáticos no interceptados
- **WHEN** se solicita un asset bajo `/_next/...`
- **THEN** el middleware no lo reescribe y el asset se sirve normalmente

### Requirement: Hosting por rewrite a Cloud Run

El site de Firebase `chirimoyo` SHALL servir la app vía un rewrite `**` → el servicio Cloud Run `sitio`. Los dominios `chirimoyo.org` y `www` (ya conectados a ese site) SHALL servir la app sin cambios de DNS. La página holding estática (`infra/holding/`) SHALL eliminarse.

#### Scenario: El apex sirve la app
- **WHEN** se publica el rewrite y se visita `https://chirimoyo.org`
- **THEN** responde la app de sitio (no la holding "muy pronto")

#### Scenario: Holding eliminada
- **WHEN** se revisa el repo tras el cambio
- **THEN** `infra/holding/` ya no existe

### Requirement: Integración del sistema de diseño con layout propio

La app SHALL consumir el sistema de diseño (tokens vía `scripts/sync-design-tokens.mjs`, `next/font`, primitivas en `components/ui/`, `lucide-react`) y SHALL tener `Header` y `Footer` **propios de sitio** en `components/layout/` (distintos de los de la guía de aves), usando los tokens.

#### Scenario: Render con el diseño
- **WHEN** se abre cualquiera de las 3 secciones placeholder
- **THEN** renderiza con la paleta, tipografía y primitivas del sistema de diseño (no estilos por defecto)

#### Scenario: Layout propio
- **WHEN** se inspeccionan `components/layout/`
- **THEN** el Header/Footer son los de la Comunidad (no los del catálogo de aves)

### Requirement: Secciones placeholder

La app SHALL incluir páginas placeholder para las tres secciones: landing (`app/page.tsx`), comunidad (`app/comunidad/`) y voluntarios (`app/voluntarios/`). El contenido real (historia, misión, noticias, jornadas, formas) NO SHALL implementarse en este change.

#### Scenario: Las 3 secciones existen
- **WHEN** se visitan `/`, `/comunidad` y `/voluntarios`
- **THEN** cada una renderiza un placeholder propio con el diseño

### Requirement: Acceso a contenido en build

La app SHALL incluir `lib/content.ts` que resuelva `content/` desde la raíz del repo (default relativo + override `CONTENT_DIR`). En el scaffold puede ser un stub tipado sin parsear datos reales.

#### Scenario: Loader resuelve la raíz de contenido
- **WHEN** se invoca el loader en build
- **THEN** resuelve `content/` desde la raíz del repo (o `CONTENT_DIR`) sin depender del contexto Docker
