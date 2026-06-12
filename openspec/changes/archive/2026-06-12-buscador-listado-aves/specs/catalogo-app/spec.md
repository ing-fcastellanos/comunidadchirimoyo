## MODIFIED Requirements

### Requirement: Layout y metadata del catálogo

La app SHALL tener un `app/layout.tsx` con `Header` y `Footer` (en `components/layout/`, portados del handoff) y `metadata`/OpenGraph base con `metadataBase` apuntando a `https://aves.chirimoyo.org`. La página de inicio (`/`) SHALL dejar de ser un placeholder y renderizar la **pantalla de búsqueda + resultados del catálogo** (capacidad `catalogo-busqueda`), usando los tokens y primitivas del sistema de diseño.

#### Scenario: Home sirve el catálogo
- **WHEN** se ejecuta `npm run dev` y se abre la home
- **THEN** se muestra la pantalla de búsqueda + resultados con las especies del catálogo, no un placeholder, usando la paleta, tipografía y primitivas del sistema de diseño
