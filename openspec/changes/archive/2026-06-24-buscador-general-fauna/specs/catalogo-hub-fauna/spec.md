## MODIFIED Requirements

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
