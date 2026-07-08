# pagina-proteccion Specification

## Purpose
TBD - created by archiving change pagina-proteccion. Update Purpose after archive.
## Requirements
### Requirement: Página de protección estática

La app del catálogo SHALL servir la ruta `/proteccion` como **Server Component estático** que NO llama a ningún API. Su contenido SHALL provenir de un archivo **curado** `content/fauna/proteccion.json` (no derivado automáticamente de las fichas en build), leído en build. La ruta SHALL coexistir con la ruta dinámica `[grupo]` sin colisión.

#### Scenario: La página se sirve estática
- **WHEN** se ejecuta `npm run build` en `apps/catalogo` y se abre `/proteccion`
- **THEN** `out/proteccion.html` contiene la página renderizada, sin requerir un servidor ni llamadas de red a un API

#### Scenario: No colisiona con los grupos
- **WHEN** se abre `/proteccion`
- **THEN** se renderiza la página de protección, no el índice de un grupo ni un 404

### Requirement: Explicación de niveles NOM-059 cruzada con el catálogo

La página SHALL explicar las cuatro categorías de la NOM-059-SEMARNAT-2010 (Protección Especial, Amenazada, En Peligro de Extinción, Probablemente Extinta), y por cada una SHALL listar las especies del humedal del Chirimoyo que la tienen asignada, según el contenido curado. Cuando una categoría no tenga especies asociadas, la página SHALL indicarlo explícitamente en lugar de omitir la categoría.

#### Scenario: Categorías con especies reales
- **WHEN** se abre `/proteccion`
- **THEN** la categoría "Protección Especial" lista las especies curadas para esa categoría, y la categoría "Amenazada" lista las suyas, cada una por su nombre común

#### Scenario: Categoría sin especies
- **WHEN** una categoría NOM-059 no tiene especies curadas en `content/fauna/proteccion.json`
- **THEN** la página muestra un mensaje indicando que ninguna especie del humedal está en esa categoría, en vez de dejar la sección vacía o no mostrarla

### Requirement: Explicación de la Lista Roja UICN

La página SHALL explicar la escala de la Lista Roja de la UICN (desde "Preocupación Menor" hasta las categorías de extinción, incluyendo "Datos Insuficientes" y "No Evaluada"), presentada sin codificar cada categoría con un color de acento distinto (consistente con la regla del sistema de diseño de reservar los acentos cálidos para insignias de estado, no para bloques de color por severidad).

#### Scenario: Escala UICN documentada
- **WHEN** se abre `/proteccion`
- **THEN** se listan todas las categorías de la escala UICN con su código y su significado en español

### Requirement: Ejemplo curado de CITES

La página SHALL incluir al menos un ejemplo curado de clasificación CITES (apéndice y motivo) para una especie del humedal, respaldado por el contenido existente en la ficha de esa especie. La página NO SHALL derivar la clasificación CITES de un campo estructurado del schema de fichas (no existe tal campo); el dato SHALL vivir únicamente en el contenido curado de esta página.

#### Scenario: Ejemplo de CITES visible
- **WHEN** se abre `/proteccion`
- **THEN** se muestra el apéndice CITES de al menos una especie del humedal junto con una explicación breve de qué implica ese apéndice

### Requirement: Cifras del catálogo

La página SHALL mostrar cifras agregadas y verificables del catálogo: total de especies documentadas, desglose por grupo (aves / anfibios y reptiles), y cuántas especies tienen alguna categoría de riesgo NOM-059 asignada. Estas cifras SHALL provenir del contenido curado, no de un cálculo en tiempo real sobre `getAllFichas()`.

#### Scenario: Cifras visibles en el hero
- **WHEN** se abre `/proteccion`
- **THEN** se muestran el total de especies documentadas y cuántas tienen categoría de riesgo NOM-059

### Requirement: Cruce con la búsqueda filtrada por NOM-059

La página SHALL ofrecer un enlace hacia `/busqueda` que active el filtro de conservación NOM-059 automáticamente al llegar (ver capacidad `catalogo-busqueda`), para que la persona pueda ver de inmediato las especies del Chirimoyo bajo protección sin tener que aplicar el filtro manualmente.

#### Scenario: El enlace pre-filtra la búsqueda
- **WHEN** la persona sigue el enlace de `/proteccion` hacia la búsqueda de especies protegidas
- **THEN** llega a `/busqueda` con el filtro de conservación NOM-059 ya activo, mostrando solo las especies con esa categoría

### Requirement: Fuentes oficiales verificables

La página SHALL incluir una sección de fuentes oficiales agrupadas por sistema (NOM-059, UICN, CITES, buscadores de especie), cada una con un enlace externo verificable. Los enlaces SHALL abrirse de forma segura (`rel="noopener noreferrer"`).

#### Scenario: Fuentes agrupadas por sistema
- **WHEN** se abre `/proteccion`
- **THEN** se muestran grupos de fuentes correspondientes a NOM-059, UICN y CITES, cada uno con al menos un enlace externo

### Requirement: Metadata y enlace de navegación

La página SHALL exponer metadata propia mediante `generateMetadata` (título, descripción y OpenGraph). El catálogo SHALL ofrecer un **enlace a `/proteccion`** desde su Footer.

#### Scenario: Metadata propia
- **WHEN** se inspecciona el `<head>` de `/proteccion`
- **THEN** incluye un título y descripción propios y etiquetas OpenGraph

#### Scenario: Enlazada desde el Footer
- **WHEN** se observa el Footer del catálogo
- **THEN** incluye un enlace que lleva a `/proteccion`
