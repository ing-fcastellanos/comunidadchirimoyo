## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Ruteo multi-subdominio por host

**Reason**: ADR-0023 supersede a ADR-0008: `comunidad` y `voluntarios` se sirven como paths
bajo `chirimoyo.org`, no como subdominios reescritos por host. El `middleware.ts` de ruteo por
host se elimina.

**Migration**: Las rutas internas de Next (`/comunidad/...`, `/voluntarios/...`) no cambian y se
sirven directamente. Los subdominios `comunidad.chirimoyo.org` y `voluntarios.chirimoyo.org` se
conservan como **redirects vanity 301** hacia el path equivalente (configuración de DNS/Hosting
en #53). Los enlaces internos pasan a rutas relativas; el catálogo (`aves`, otro origen) enlaza
a la comunidad vía el vanity absoluto.

## ADDED Requirements

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
