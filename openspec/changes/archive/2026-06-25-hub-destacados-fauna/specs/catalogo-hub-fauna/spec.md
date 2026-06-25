## ADDED Requirements

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
