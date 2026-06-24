## MODIFIED Requirements

### Requirement: Página índice de búsqueda + resultados (estática)

La app del catálogo SHALL servir, en la ruta **`/aves/buscador`**, una pantalla integrada de búsqueda y resultados de **aves** generada estáticamente. En build SHALL cargar las fichas con `getAllFichas()`, mapearlas a un view-model de búsqueda y embeber ese conjunto en la salida estática. La pantalla NO SHALL llamar a ningún API ni endpoint de búsqueda (ADR-0005). La ruta `/busqueda` sirve el **buscador general multi-grupo** (ver requisito *Buscador general en `/busqueda`*), no el buscador de aves. La home (`/`) sirve el hub (capacidad `catalogo-hub-fauna`) y `/aves` sirve el landing (capacidad `landing-catalogo`).

#### Scenario: Búsqueda de aves estática con datos embebidos
- **WHEN** se ejecuta `npm run build` en `apps/catalogo`
- **THEN** la página estática de `/aves/buscador` (`out/aves/buscador/index.html` y su JS) contiene todas las especies de aves del catálogo, sin requerir un servidor en runtime

#### Scenario: Sin backend de búsqueda
- **WHEN** se inspecciona la pantalla de búsqueda
- **THEN** todo el filtrado ocurre en el cliente sobre los datos del build; no hay llamadas de red a un API

#### Scenario: /busqueda no sirve el buscador de aves
- **WHEN** se abre `/busqueda`
- **THEN** se muestra el buscador **general** (todos los grupos), no el buscador de aves (que vive en `/aves/buscador`)

## ADDED Requirements

### Requirement: Buscador general en `/busqueda`

La app SHALL servir, en la ruta **`/busqueda`**, un buscador **general** sobre **todos los grupos** del catálogo (aves, anfibios, reptiles), generado estáticamente y 100% en cliente (ADR-0005/0006): en build SHALL cargar las fichas con `getAllFichas()`, mapearlas al view-model de búsqueda (con su `grupo`) y embeberlas en la salida; NO SHALL llamar a ningún API. El buscador SHALL ofrecer únicamente filtros del **núcleo común** del esquema —texto, **grupo**, orden, familia, presencia, conservación (NOM-059) y grado de ocurrencia— y NO SHALL ofrecer filtros específicos de aves (forma, talla, color, dónde, gremios). La faceta de **grupo** SHALL permitir filtrar por `aves`/`anfibios`/`reptiles` y SHALL incluir un atajo **«herpetofauna»** que selecciona anfibios + reptiles. Los resultados SHALL presentarse con la misma tarjeta de especie y enlazar a `/<grupo>/<slug>`. La pantalla SHALL reutilizar la maquinaria de filtrado/resultados existente sin alterar el buscador de aves.

#### Scenario: Busca en los tres grupos
- **WHEN** se abre `/busqueda` sin filtros
- **THEN** se listan especies de aves, anfibios y reptiles, cada tarjeta enlazando a `/<grupo>/<slug>`

#### Scenario: Solo filtros del núcleo común
- **WHEN** se inspecciona el panel de `/busqueda`
- **THEN** ofrece texto, grupo, orden, familia, presencia, conservación y ocurrencia, y NO ofrece forma, talla, color, dónde ni gremios

#### Scenario: Faceta de grupo con atajo herpetofauna
- **WHEN** el usuario activa el atajo «herpetofauna»
- **THEN** los resultados se limitan a anfibios y reptiles (excluyen aves)

#### Scenario: Estático y sin endpoint
- **WHEN** se ejecuta `npm run build`
- **THEN** existe `out/busqueda/index.html` con los datos embebidos y el filtrado ocurre en cliente, sin llamadas de red

#### Scenario: El buscador de aves no cambia
- **WHEN** se usa `/aves/buscador` tras construir el general
- **THEN** conserva todos sus filtros aviares y su comportamiento previo
