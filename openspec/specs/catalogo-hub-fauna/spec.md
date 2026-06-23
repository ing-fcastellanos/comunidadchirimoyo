# catalogo-hub-fauna Specification

## Purpose
TBD - created by archiving change catalogo-fauna-dominio-rutas. Update Purpose after archive.
## Requirements
### Requirement: Hub de fauna en la home

La app del catálogo SHALL servir, como **página índice** (`/`), un **hub de fauna** estático cuyo propósito es presentar el catálogo como una guía de la **fauna** del humedal (no solo aves) y encaminar al visitante a cada grupo o a la búsqueda. El hub SHALL ser un Server Component que NO llama a ningún API; cualquier dato dinámico (p. ej. conteos) SHALL resolverse en build con `getAllFichas()`. La home NO SHALL servir el landing de aves (que ahora vive en `/aves`, capacidad `landing-catalogo`) ni el buscador.

#### Scenario: La home es el hub de fauna
- **WHEN** se abre `/` del catálogo
- **THEN** se muestra el hub de fauna (carrusel, tarjetas de grupo y acceso a búsqueda), no el landing de aves ni la pantalla de búsqueda

#### Scenario: Hub estático sin API
- **WHEN** se ejecuta `npm run build` en `apps/catalogo`
- **THEN** `out/index.html` contiene el hub renderizado, sin requerir un servidor en runtime ni llamadas de red a un API

### Requirement: Carrusel del hub

El hub SHALL abrir con una sección hero que incluya un carrusel de imágenes representativas de la fauna del humedal. Por ahora SHALL usar **portadas curadas (`fotos[0]`) de especies de aves**, obtenidas vía el data-layer del catálogo, sin hardcodear archivos de imagen específicos en el componente. El carrusel SHALL respetar `prefers-reduced-motion: reduce` mostrando la primera foto de forma fija. Cada imagen SHALL tener texto alternativo descriptivo.

#### Scenario: Carrusel con portadas curadas
- **WHEN** se recura la portada (`fotos[0]`) de alguna especie del carrusel y se reconstruye
- **THEN** el carrusel muestra la nueva portada sin editar el componente

#### Scenario: Respeta prefers-reduced-motion
- **WHEN** el usuario tiene activada la preferencia de movimiento reducido
- **THEN** el carrusel no autoanima y muestra la primera foto de forma fija

### Requirement: Tarjetas de grupo con estado

El hub SHALL mostrar una tarjeta por grupo taxonómico del catálogo: **aves** (activa, con enlace a `/aves`) y **anfibios** y **reptiles** (estado «próximamente», sin enlace navegable a contenido inexistente). Las tarjetas activas SHALL diferenciarse visualmente de las «próximamente», comunicando estado de forma clara y accesible. La tarjeta de aves PUEDE mostrar el conteo de especies derivado en build de `getAllFichas()`; NO SHALL hardcodearse.

#### Scenario: Aves activa enlaza a su grupo
- **WHEN** el usuario activa la tarjeta de aves
- **THEN** navega a `/aves`

#### Scenario: Anfibios y reptiles "próximamente"
- **WHEN** el usuario observa las tarjetas de anfibios y reptiles
- **THEN** se presentan como «próximamente», visualmente distintas de la de aves y sin llevar a una página de contenido inexistente

#### Scenario: Conteo de aves dinámico
- **WHEN** se agrega o elimina una ficha de ave en `content/` y se reconstruye
- **THEN** el conteo mostrado en la tarjeta de aves cambia en consecuencia, sin editar el componente

### Requirement: Acceso a búsqueda desde el hub

El hub SHALL ofrecer un acceso a la búsqueda que enlaza a `/busqueda`. Mientras `/busqueda` sea el stub «próximamente» (el buscador general es trabajo posterior), el acceso SHALL conducir a ese stub, sin prometer funcionalidad inexistente.

#### Scenario: Acceso a búsqueda
- **WHEN** el usuario activa el acceso a búsqueda del hub
- **THEN** navega a `/busqueda`

### Requirement: Páginas placeholder "próximamente"

La app SHALL servir páginas estáticas placeholder para las superficies aún no disponibles: los índices de grupo `/anfibios` y `/reptiles`, y la búsqueda `/busqueda`. Cada placeholder SHALL comunicar de forma clara que el contenido está «próximamente» (estado intencional, no error), SHALL usar los tokens y primitivas del sistema de diseño y SHALL ofrecer una salida de regreso al hub o a aves. Estas páginas NO SHALL devolver 404 ni mostrarse vacías.

#### Scenario: Stub de grupo próximo
- **WHEN** se abre `/anfibios` o `/reptiles`
- **THEN** se muestra una página «próximamente» con copy claro y un enlace de regreso, no un 404

#### Scenario: Stub de búsqueda
- **WHEN** se abre `/busqueda`
- **THEN** se muestra una página «próximamente» (el buscador general aún no existe), no un 404

#### Scenario: Placeholders en el build estático
- **WHEN** se ejecuta `npm run build`
- **THEN** existen `out/anfibios/index.html`, `out/reptiles/index.html` y `out/busqueda/index.html` como páginas estáticas
