# catalogo-busqueda Specification

## Purpose
TBD - created by archiving change buscador-listado-aves. Update Purpose after archive.
## Requirements
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

### Requirement: Panel de búsqueda en dos secciones

La pantalla SHALL incluir un panel en acordeón con dos secciones mutuamente excluyentes:
**Búsqueda detallada** y **Selecciones rápidas**. La sección detallada SHALL ofrecer un
campo de texto con autocompletado (sobre nombre común, científico, familia y palabras
clave) y filtros por **forma**, **tamaño**, **color** (multivalor) y **dónde**, además de
filtros avanzados de categoría, orden, familia, presencia y conservación. La sección de
selecciones rápidas SHALL ofrecer atajos que aplican varios filtros a la vez y enfocar la
búsqueda detallada al aplicarse.

#### Scenario: Alternar secciones
- **WHEN** el usuario abre "Selecciones rápidas"
- **THEN** "Búsqueda detallada" se colapsa (las secciones son mutuamente excluyentes)

#### Scenario: Selección rápida aplica varios filtros
- **WHEN** el usuario toca "Aves del agua"
- **THEN** se aplican las categorías vadeadoras/nadadoras/playeras y se muestra la búsqueda detallada con esos filtros activos

#### Scenario: Filtro multivalor de color
- **WHEN** el usuario elige los colores "Blanco" y "Café"
- **THEN** el resultado incluye especies cuyo conjunto de colores contenga blanco **o** café

### Requirement: Resultados con tarjeta, vista y orden

Los resultados SHALL renderizarse con una tarjeta de especie (`BirdCard`) que muestre foto
(variante `thumb`), nombre común y científico, chip de categoría, indicadores de presencia/
observación, sello de NOM-059 cuando aplique, rasgos (tamaño/color/hábitat) y un enlace
"Ver ficha" a `/<grupo>/<slug>` (derivado del `grupo` de la ficha). La pantalla SHALL ofrecer **vista de cuadrícula y de lista**, un
control de **orden** (relevancia, alfabético, por categoría, de más común a más raro) y un
conteo de resultados.

#### Scenario: Cambio de vista
- **WHEN** el usuario activa la vista de lista
- **THEN** las tarjetas se muestran en formato horizontal sin perder los filtros aplicados

#### Scenario: Orden alfabético
- **WHEN** el usuario elige orden "Alfabético"
- **THEN** los resultados se ordenan por nombre común en español

#### Scenario: Enlace al detalle por grupo
- **WHEN** el usuario activa "Ver ficha" en una tarjeta
- **THEN** navega a `/<grupo>/<slug>` de esa especie, donde `<grupo>` es el grupo de la ficha (p. ej. `/aves/<slug>`)

### Requirement: Filtros activos y estado vacío

La pantalla SHALL mostrar *pills* de los filtros activos, cada una removible individualmente,
y una acción para limpiar todo. Cuando ninguna especie coincide, SHALL mostrar un estado
vacío con una acción para limpiar los filtros.

#### Scenario: Quitar un filtro desde su pill
- **WHEN** el usuario quita la pill de un filtro activo
- **THEN** ese filtro se desactiva y los resultados se recalculan

#### Scenario: Estado vacío
- **WHEN** la combinación de filtros no arroja especies
- **THEN** se muestra el estado vacío con un botón para limpiar los filtros

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

### Requirement: Filtro inicial de conservación desde la URL

El buscador general (`/busqueda`) SHALL aceptar un parámetro de consulta opcional `conservaciones` (p. ej. `?conservaciones=NOM-059`) y, si está presente al montar, SHALL inicializar el filtro de conservación con ese valor en lugar de arrancar en `EMPTY_FILTERS`. Esto permite que otras páginas del catálogo (p. ej. `/proteccion`) enlacen directamente a una vista ya filtrada. Cuando el parámetro está ausente, el comportamiento SHALL ser idéntico al actual (filtros vacíos).

#### Scenario: Llega con el parámetro de conservación
- **WHEN** se abre `/busqueda?conservaciones=NOM-059`
- **THEN** el filtro de conservación NOM-059 queda activo de inmediato y los resultados solo muestran especies con esa categoría

#### Scenario: Llega sin parámetros
- **WHEN** se abre `/busqueda` sin parámetros de consulta
- **THEN** los filtros arrancan vacíos, igual que antes de este cambio

