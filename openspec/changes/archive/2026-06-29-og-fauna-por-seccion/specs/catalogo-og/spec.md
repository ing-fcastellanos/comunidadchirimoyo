## ADDED Requirements

### Requirement: Imagen OpenGraph por sección del catálogo

El catálogo SHALL exponer una imagen OpenGraph acorde a cada sección, servida como archivo estático desde `public/`. El **default** del sitio (heredado por las páginas sin OG propio: hub `/`, búsqueda general `/busqueda`, colaboradores) SHALL ser la imagen de **fauna general**. Las páginas de **grupo** SHALL declarar su propia imagen: **aves** usa la imagen de aves; **anfibios** y **reptiles** usan la imagen de **herpetofauna**. El buscador de **aves** (`/aves/buscador`) SHALL usar la imagen de aves. La página de **detalle** (`/<grupo>/<slug>`) SHALL conservar la **foto de la ficha** como imagen OG. Cada declaración de `openGraph.images` SHALL acompañarse de `twitter.images` equivalente y de un texto `alt`.

#### Scenario: Hub y búsqueda general usan fauna general
- **WHEN** se inspecciona el OpenGraph de `/` o `/busqueda`
- **THEN** la imagen es la de fauna general

#### Scenario: Anfibios y reptiles usan herpetofauna
- **WHEN** se inspecciona el OpenGraph de `/anfibios` o `/reptiles`
- **THEN** la imagen es la de herpetofauna

#### Scenario: Aves usa la imagen de aves
- **WHEN** se inspecciona el OpenGraph de `/aves` o `/aves/buscador`
- **THEN** la imagen es la de aves

#### Scenario: El detalle conserva la foto de la ficha
- **WHEN** se inspecciona el OpenGraph de `/<grupo>/<slug>`
- **THEN** la imagen es la foto de la especie, no una imagen de sección

### Requirement: Imágenes OG normalizadas a 1200×630

Las imágenes OpenGraph de sección SHALL servirse en **1200×630** (proporción estándar) y con un peso razonable para compartir. La imagen genérica previa (`og-default.jpg`, de aves) SHALL renombrarse a `og-aves.jpg` y SHALL dejar de existir bajo el nombre genérico; todas sus referencias internas SHALL actualizarse.

#### Scenario: Dimensiones correctas
- **WHEN** se revisa cualquiera de las imágenes OG de sección en `out/`
- **THEN** mide 1200×630

#### Scenario: Sin referencias al nombre genérico
- **WHEN** se reconstruye el catálogo
- **THEN** ningún artefacto de `out/` referencia `og-default.jpg`
