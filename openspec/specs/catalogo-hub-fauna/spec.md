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

El hub SHALL mostrar una tarjeta por grupo taxonómico del catálogo. Cada tarjeta SHALL **derivar su estado del conteo de fichas del grupo** (resuelto en build con `getAllFichas()`): un grupo **con fichas** SHALL mostrarse **activo** (enlace a `/<grupo>`, conteo de especies e ícono del grupo); un grupo **sin fichas** SHALL mostrarse «próximamente», sin enlace a contenido inexistente. Las tarjetas activas SHALL diferenciarse visualmente de las «próximamente», comunicando estado de forma clara y accesible. Los conteos NO SHALL hardcodearse. Hoy `aves`, `anfibios` y `reptiles` tienen fichas, por lo que las tres tarjetas están activas.

#### Scenario: Grupo con fichas activo
- **WHEN** el usuario observa la tarjeta de un grupo con fichas (p. ej. anfibios)
- **THEN** se muestra activa, con su conteo de especies y enlace a `/<grupo>`

#### Scenario: Grupo sin fichas "próximamente"
- **WHEN** un grupo válido aún no tiene fichas en disco
- **THEN** su tarjeta se presenta como «próximamente», visualmente distinta y sin llevar a contenido inexistente

#### Scenario: Conteo dinámico por grupo
- **WHEN** se agrega o elimina una ficha de un grupo en `content/` y se reconstruye
- **THEN** el conteo mostrado en la tarjeta de ese grupo cambia en consecuencia, sin editar el componente

### Requirement: Acceso a búsqueda desde el hub

El hub SHALL ofrecer acceso a la búsqueda. El hero SHALL ofrecer un acceso al **buscador general** que enlaza a `/busqueda` (capacidad `catalogo-busqueda`, buscador multi-grupo funcional) y PUEDE ofrecer además un acceso directo al buscador de **aves** (`/aves/buscador`). Los accesos conducen a buscadores funcionales, no a un stub.

#### Scenario: Acceso a búsqueda
- **WHEN** el usuario activa el acceso a búsqueda del hub
- **THEN** navega a `/busqueda` y obtiene el buscador general de toda la fauna

### Requirement: Páginas placeholder "próximamente"

La app SHALL servir una página estática placeholder «próximamente» para un grupo válido que **aún no tenga fichas** en disco (estado intencional, no error), usando los tokens y primitivas del sistema de diseño y ofreciendo una salida de regreso al hub o a aves; NO SHALL devolver 404 ni mostrarse vacía. Los índices de grupo con fichas (`/aves`, `/anfibios`, `/reptiles`) y la búsqueda (`/busqueda`) NO son placeholders: sirven contenido real (capacidades `catalogo-app`, `landing-catalogo` y `catalogo-busqueda`).

#### Scenario: Grupo válido sin fichas
- **WHEN** se abre el índice de un grupo válido que aún no tiene fichas en disco
- **THEN** se muestra una página «próximamente» con copy claro y un enlace de regreso, no un 404

#### Scenario: Superficies reales ya no son placeholder
- **WHEN** se abren `/anfibios`, `/reptiles` o `/busqueda`
- **THEN** sirven contenido real (grilla del grupo o buscador general), no un placeholder «próximamente»

### Requirement: Especies destacadas del humedal

El hub SHALL mostrar una sección **«Especies destacadas del humedal»**, ubicada **antes de la banda de cierre** (`CierreCTA`) y después de la banda «El humedal». La sección SHALL ser un Server Component que NO llama a ningún API y cuyo conjunto de destacadas SHALL **derivarse del contenido**: las fichas cuyo frontmatter declara `featured: true`, resueltas en build con `getAllFichas()` y mapeadas con el view-model de búsqueda (`fichaToEspecie`). El componente NO SHALL hardcodear la lista de especies destacadas; la selección SHALL provenir exclusivamente del flag `featured`. Las destacadas SHALL ser **cross-grupo** (no solo aves) y cada una SHALL presentarse como una tarjeta que enlaza al detalle `/<grupo>/<slug>`, reusando la tarjeta de especie del catálogo (`EspecieCard`). La sección SHALL incluir un acceso **«Ver todas»** que enlaza a `/busqueda` (buscador general). Si **ninguna** ficha tiene `featured: true`, la sección NO SHALL renderizarse (sin encabezado ni grilla vacíos). El flag `featured` SHALL ser la **única fuente de verdad** de «destacadas», compartida con el filtro «Destacadas del autor» del buscador.

#### Scenario: La home muestra destacadas cross-grupo

- **WHEN** se abre `/` del catálogo y existen fichas con `featured: true` en distintos grupos
- **THEN** se muestra la sección «Especies destacadas del humedal» con una tarjeta por especie destacada, incluyendo aves y herpetofauna, cada una enlazando a `/<grupo>/<slug>`

#### Scenario: Selección derivada del contenido

- **WHEN** se marca o desmarca `featured: true` en el frontmatter de una ficha y se reconstruye
- **THEN** esa especie aparece o desaparece de la sección de destacadas, sin editar el componente

#### Scenario: Acceso a la búsqueda general desde destacadas

- **WHEN** el usuario activa el acceso «Ver todas» de la sección de destacadas
- **THEN** navega a `/busqueda` y obtiene el buscador general de toda la fauna

#### Scenario: Sin destacadas, sin sección

- **WHEN** ninguna ficha tiene `featured: true` al reconstruir
- **THEN** la home no renderiza la sección de destacadas (no aparece un encabezado con una grilla vacía)

#### Scenario: Hub sigue estático

- **WHEN** se ejecuta `npm run build` en `apps/catalogo`
- **THEN** `out/index.html` contiene la sección de destacadas renderizada con las especies marcadas, sin requerir un servidor ni llamadas de red a un API

