## MODIFIED Requirements

### Requirement: Página índice de búsqueda + resultados (estática)

La app del catálogo SHALL servir, en la ruta **`/aves/buscador`**, una pantalla integrada de búsqueda y resultados de **aves** generada estáticamente. En build SHALL cargar las fichas con `getAllFichas()`, mapearlas a un view-model de búsqueda y embeber ese conjunto en la salida estática. La pantalla NO SHALL llamar a ningún API ni endpoint de búsqueda (ADR-0005). La ruta `/busqueda` ya NO sirve esta pantalla: queda como stub «próximamente» reservado al buscador general multi-grupo (capacidad `catalogo-hub-fauna`, construcción posterior). La home (`/`) sirve el hub (capacidad `catalogo-hub-fauna`) y `/aves` sirve el landing (capacidad `landing-catalogo`).

#### Scenario: Búsqueda de aves estática con datos embebidos
- **WHEN** se ejecuta `npm run build` en `apps/catalogo`
- **THEN** la página estática de `/aves/buscador` (`out/aves/buscador/index.html` y su JS) contiene todas las especies de aves del catálogo, sin requerir un servidor en runtime

#### Scenario: Sin backend de búsqueda
- **WHEN** se inspecciona la pantalla de búsqueda
- **THEN** todo el filtrado ocurre en el cliente sobre los datos del build; no hay llamadas de red a un API

#### Scenario: /busqueda no sirve el buscador de aves
- **WHEN** se abre `/busqueda`
- **THEN** se muestra el stub «próximamente», no el buscador de aves (que vive en `/aves/buscador`)

### Requirement: Resultados con tarjeta, vista y orden

Los resultados SHALL renderizarse con una tarjeta de especie (`BirdCard`) que muestre foto (variante `thumb`), nombre común y científico, chip de categoría, indicadores de presencia/observación, sello de NOM-059 cuando aplique, rasgos (tamaño/color/hábitat) y un enlace "Ver ficha" a `/<grupo>/<slug>` (derivado del `grupo` de la ficha). La pantalla SHALL ofrecer **vista de cuadrícula y de lista**, un control de **orden** (relevancia, alfabético, por categoría, de más común a más raro) y un conteo de resultados.

#### Scenario: Cambio de vista
- **WHEN** el usuario activa la vista de lista
- **THEN** las tarjetas se muestran en formato horizontal sin perder los filtros aplicados

#### Scenario: Orden alfabético
- **WHEN** el usuario elige orden "Alfabético"
- **THEN** los resultados se ordenan por nombre común en español

#### Scenario: Enlace al detalle por grupo
- **WHEN** el usuario activa "Ver ficha" en una tarjeta
- **THEN** navega a `/<grupo>/<slug>` de esa especie, donde `<grupo>` es el grupo de la ficha (p. ej. `/aves/<slug>`)
