# pagina-colaboradores Specification

## Purpose
TBD - created by archiving change pagina-colaboradores. Update Purpose after archive.
## Requirements
### Requirement: Página de colaboradores estática

La app del catálogo SHALL servir la ruta `/colaboradores` como **Server Component estático** que NO llama a ningún API. Su contenido SHALL provenir de un archivo **curado** en `content/` (no se auto-agrega de los créditos de las fichas), leído en build. La ruta SHALL coexistir con la ruta dinámica `[grupo]` sin colisión (los grupos válidos están acotados a aves/anfibios/reptiles).

#### Scenario: La página se sirve estática
- **WHEN** se ejecuta `npm run build` y se abre `/colaboradores`
- **THEN** `out/colaboradores.html` contiene la página renderizada, sin requerir un servidor ni llamadas de red a un API

#### Scenario: No colisiona con los grupos
- **WHEN** se abre `/colaboradores`
- **THEN** se renderiza la página de colaboradores, no el índice de un grupo ni un 404

### Requirement: Reconocimiento agrupado por rol

La página SHALL presentar a los colaboradores **agrupados por rol**, en el orden definido por el contenido curado. En esta versión los roles SHALL ser **biólogos e identificación**, **fotografía** y **desarrollo** (la categoría comunidad queda fuera, se reconoce en la sección `/comunidad` del sitio). Cada persona SHALL mostrar su `nombre` y su `aporte` (grado o contribución breve), y SHALL mostrar un **enlace** cuando el contenido lo provea, abierto de forma segura (`rel="noopener noreferrer"`). El contenido mostrado SHALL ser real (sin placeholders).

#### Scenario: Grupos por rol
- **WHEN** se abre `/colaboradores`
- **THEN** se muestran los grupos biólogos, fotografía y desarrollo, cada uno con sus personas

#### Scenario: Persona con enlace
- **WHEN** una persona del contenido tiene un `enlace`
- **THEN** su tarjeta muestra un enlace que abre el perfil en una pestaña nueva de forma segura

#### Scenario: El contenido es curado y derivable
- **WHEN** se edita `content/fauna/colaboradores.json` (agregar/quitar una persona o cambiar el orden) y se reconstruye
- **THEN** la página refleja el cambio sin editar el componente

### Requirement: Las atribuciones externas no son colaboradores

La página NO SHALL listar como colaboradores las **atribuciones de licencia externas** (fotografías Creative Commons de iNaturalist) ni los **grabadores de audio** (xeno-canto): su autoría SHALL seguir acreditada en cada ficha. La página PUEDE incluir una nota que reconozca esas fuentes externas de forma agregada, sin enumerarlas.

#### Scenario: Solo el equipo del proyecto
- **WHEN** se revisan los colaboradores listados
- **THEN** corresponden al equipo del proyecto (biólogos, fotógrafos del proyecto, desarrollo), no a licenciantes externos de iNaturalist ni a grabadores de xeno-canto

#### Scenario: Nota de fuentes externas
- **WHEN** se abre `/colaboradores`
- **THEN** existe una nota que reconoce que algunas fichas usan fotografías CC y grabaciones externas acreditadas por ficha

### Requirement: Metadata y enlace de navegación

La página SHALL exponer metadata propia mediante `generateMetadata` (título, descripción y OpenGraph). El catálogo SHALL ofrecer un **enlace a `/colaboradores`** desde su Footer.

#### Scenario: Metadata propia
- **WHEN** se inspecciona el `<head>` de `/colaboradores`
- **THEN** incluye un título y descripción propios y etiquetas OpenGraph

#### Scenario: Enlazada desde el Footer
- **WHEN** se observa el Footer del catálogo
- **THEN** incluye un enlace que lleva a `/colaboradores`

