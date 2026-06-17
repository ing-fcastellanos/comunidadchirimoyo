# sitio-app Specification

## Purpose
TBD - created by archiving change scaffold-sitio-app. Update Purpose after archive.
## Requirements
### Requirement: App de sitio en Cloud Run

`apps/sitio` SHALL ser una app Next.js 15 (App Router, TypeScript) con `output: "standalone"`,
empaquetada en un Dockerfile y desplegable a Cloud Run en `northamerica-south1`. A diferencia
del catálogo, NO SHALL usar export estático: requiere un servidor para las Server Actions del
formulario de contacto (no por ruteo por host, que se elimina con ADR-0023).

#### Scenario: Build standalone
- **WHEN** se ejecuta `npm run build`
- **THEN** Next genera la salida `standalone` lista para empaquetar en Docker

#### Scenario: Servicio en Cloud Run
- **WHEN** se despliega
- **THEN** existe un servicio Cloud Run `sitio` en `northamerica-south1` que responde en el puerto 8080

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

### Requirement: Header del ecosistema con navegación cross-subdominio y menú móvil

El `Header` compartido de `apps/sitio` SHALL ofrecer navegación al ecosistema (Comunidad,
Voluntarios, Aves) mediante `lib/links.ts`. Los enlaces a **Comunidad** y **Voluntarios** SHALL
usar **rutas relativas** (`/comunidad`, `/voluntarios`), por ser secciones del mismo dominio
`chirimoyo.org` (ADR-0023). El enlace a **Aves** SHALL usar la **URL absoluta** de su subdominio
(`aves.chirimoyo.org`), por ser app/deploy independiente. El logo SHALL enlazar al inicio del
sitio actual (`/`). En viewports de escritorio los enlaces SHALL mostrarse en línea; en móvil
SHALL ofrecerse un **botón hamburguesa** que abre un menú (drawer) accesible. El menú móvil
SHALL: exponer `aria-expanded`/`aria-controls` en el botón; cerrarse con la tecla Escape, con
clic fuera (backdrop) y al elegir un enlace; atrapar el foco mientras está abierto y devolverlo
al botón al cerrar; y bloquear el scroll del fondo. El estado del menú es lo único que SHALL
vivir en cliente.

#### Scenario: Navegación a secciones por path y a aves por subdominio
- **WHEN** el usuario activa "Comunidad" o "Voluntarios" en el Header
- **THEN** navega a la ruta relativa (`/comunidad`, `/voluntarios`) bajo `chirimoyo.org`

#### Scenario: Aves sigue siendo absoluta
- **WHEN** el usuario activa "Aves" en el Header
- **THEN** navega a la URL absoluta de `aves.chirimoyo.org`

#### Scenario: Menú móvil accesible
- **WHEN** en un viewport móvil se abre el menú hamburguesa
- **THEN** se muestra el drawer con los enlaces y se puede cerrar con Escape, clic fuera o al elegir un enlace, con el foco gestionado y el scroll del fondo bloqueado

#### Scenario: Logo al inicio del sitio
- **WHEN** el usuario activa el logo
- **THEN** navega al inicio del sitio actual (`/`)

### Requirement: Footer del ecosistema desde contenido

El `Footer` compartido de `apps/sitio` SHALL ser un Server Component que derive sus enlaces de
`content/landing/enlaces.json` (vía el data-layer, en build), incluyendo: un bloque de marca con
nombre y tagline; **redes sociales** (p. ej. Facebook, Instagram) con sus íconos enlazando a las
URLs definidas; los **sitios del ecosistema**; **contacto** (email vía `mailto:` y teléfono vía
`tel:`) y un enlace de ubicación ("cómo llegar") al mapa; y una línea **legal** con enlaces a
`/privacidad`, `/aliados` y `/galeria`. El enlace a `/privacidad` SHALL incluirse aunque la
página todavía no exista (se crea en otro cambio). El Footer NO SHALL hardcodear los enlaces que
provienen del contenido.

#### Scenario: Redes y enlaces derivados del contenido
- **WHEN** se edita una red o un dato de contacto en `enlaces.json` y se reconstruye
- **THEN** el Footer refleja el cambio sin editar el componente

#### Scenario: Enlace legal a privacidad sembrado
- **WHEN** se renderiza el Footer
- **THEN** existe un enlace "Aviso de privacidad" hacia `/privacidad` (aunque la página aún devuelva 404 hasta que se cree)

#### Scenario: Contacto accionable
- **WHEN** el usuario activa el email o el teléfono del Footer
- **THEN** se abren `mailto:` y `tel:` respectivamente con los datos de `enlaces.json`

### Requirement: Ruteo de secciones por paths sin host-rewrite

`apps/sitio` SHALL servir todas sus secciones (`landing`, `comunidad`, `voluntarios` y demás
páginas) como **paths del mismo dominio** mediante el ruteo nativo del App Router, sin
middleware de reescritura por host. La app NO SHALL incluir un `middleware.ts` que enrute según
el header `Host`. Los enlaces internos entre secciones SHALL ser **rutas relativas**; las URLs
absolutas SHALL reservarse para destinos de otro origen (p. ej. `aves.chirimoyo.org`).

#### Scenario: Sección servida por path
- **WHEN** se visita `https://chirimoyo.org/comunidad` o `https://chirimoyo.org/voluntarios`
- **THEN** la app renderiza la sección directamente desde su ruta del App Router, sin reescritura por host

#### Scenario: Sin middleware de host
- **WHEN** se revisa `apps/sitio`
- **THEN** no existe `middleware.ts` de ruteo por host

#### Scenario: Enlaces internos relativos
- **WHEN** se inspeccionan los enlaces a Comunidad y Voluntarios en Header, Footer y CTAs del landing
- **THEN** usan rutas relativas (`/comunidad`, `/voluntarios`), no URLs absolutas de subdominio

