## ADDED Requirements

### Requirement: Página índice de búsqueda + resultados (estática)

La app del catálogo SHALL servir, como **página índice** (`/`), una pantalla integrada de
búsqueda y resultados generada estáticamente. En build SHALL cargar las fichas con
`getAllFichas()`, mapearlas a un view-model de búsqueda y embeber ese conjunto en la salida
estática. La pantalla NO SHALL llamar a ningún API ni endpoint de búsqueda (ADR-0005).

#### Scenario: Índice estático con datos embebidos
- **WHEN** se ejecuta `npm run build` en `apps/catalogo`
- **THEN** `out/index.html` (y su JS) contiene todas las especies del catálogo, sin requerir un servidor en runtime

#### Scenario: Sin backend de búsqueda
- **WHEN** se inspecciona la pantalla de búsqueda
- **THEN** todo el filtrado ocurre en el cliente sobre los datos del build; no hay llamadas de red a un API

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
"Ver ficha" a `/<slug>`. La pantalla SHALL ofrecer **vista de cuadrícula y de lista**, un
control de **orden** (relevancia, alfabético, por categoría, de más común a más raro) y un
conteo de resultados.

#### Scenario: Cambio de vista
- **WHEN** el usuario activa la vista de lista
- **THEN** las tarjetas se muestran en formato horizontal sin perder los filtros aplicados

#### Scenario: Orden alfabético
- **WHEN** el usuario elige orden "Alfabético"
- **THEN** los resultados se ordenan por nombre común en español

#### Scenario: Enlace al detalle
- **WHEN** el usuario activa "Ver ficha" en una tarjeta
- **THEN** navega a `/<slug>` de esa especie

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
