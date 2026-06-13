## MODIFIED Requirements

### Requirement: Layout y metadata del catálogo

La app SHALL tener un `app/layout.tsx` con `Header` y `Footer` (en `components/layout/`, portados del handoff) y `metadata`/OpenGraph base con `metadataBase` apuntando a `https://aves.chirimoyo.org`. La página de inicio (`/`) SHALL renderizar el **landing del catálogo** (capacidad `landing-catalogo`) —no la pantalla de búsqueda— usando los tokens y primitivas del sistema de diseño. El `Header` SHALL incluir un enlace al buscador (`/busqueda`), visible como elemento accesible tanto en escritorio como en móvil, de modo que el buscador siempre sea alcanzable desde el landing y las fichas.

#### Scenario: Home sirve el landing
- **WHEN** se ejecuta `npm run dev` y se abre la home
- **THEN** se muestra el landing del catálogo (hero, secciones y CTAs), no la pantalla de búsqueda, usando la paleta, tipografía y primitivas del sistema de diseño

#### Scenario: Acceso al buscador desde el Header
- **WHEN** se abre cualquier página del catálogo
- **THEN** el `Header` ofrece un enlace al buscador que navega a `/busqueda`
