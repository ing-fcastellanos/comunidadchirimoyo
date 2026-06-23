## MODIFIED Requirements

### Requirement: Ficha de detalle estática por especie

La app SHALL generar, en build, una página de detalle por especie en la ruta **`/<grupo>/<slug>`** (`app/[grupo]/[slug]`, con `generateStaticParams` a partir de los pares grupo×slug de `getAllFichas()` y `dynamicParams = false`), compatible con el export estático. La página NO SHALL llamar a ningún API. SHALL renderizar, a partir de la ficha y de las secciones `##` de su cuerpo: hero (fotos + nombre común + científico + estatus), datos rápidos, descripción, dieta/reproducción, distribución, observación, conservación y taxonomía. Las secciones o datos ausentes SHALL omitirse sin romper la página. Hoy solo existen fichas de aves, por lo que solo se generan rutas `/aves/<slug>`; la ruta queda preparada para `/anfibios/<slug>` y `/reptiles/<slug>` cuando lleguen sus datos.

#### Scenario: Una página estática por especie bajo su grupo
- **WHEN** se ejecuta `npm run build`
- **THEN** existe `out/<grupo>/<slug>/index.html` para cada especie del catálogo (p. ej. `out/aves/<slug>/index.html`)

#### Scenario: Secciones tolerantes
- **WHEN** una ficha no tiene una sección o un dato opcional (p. ej. envergadura)
- **THEN** esa parte se omite y el resto de la ficha se renderiza correctamente

#### Scenario: Cita destacada en la descripción
- **WHEN** una ficha declara `pullQuote`
- **THEN** la sección Descripción muestra la cita en un aside lateral; si no lo declara, la descripción se renderiza sin el aside

### Requirement: OpenGraph por especie

La página SHALL exponer metadata por especie vía `generateMetadata`: `title` y `description` (resumen de la descripción) propios, y `openGraph.image` apuntando a la URL absoluta de la foto de portada (variante `web`), para previews correctos al compartir el enlace `/<grupo>/<slug>`.

#### Scenario: Preview social
- **WHEN** se comparte el enlace `/<grupo>/<slug>`
- **THEN** el preview muestra la foto de portada y el nombre de la especie

### Requirement: Navegación a especies relacionadas

La página SHALL ofrecer enlaces a especies relacionadas, priorizando la **misma familia** y, en su defecto, la **misma categoría**, excluyendo la especie actual. Cada enlace SHALL navegar a `/<grupo>/<slug>` de la especie relacionada (derivado de su `grupo`). Se deriva del catálogo existente, sin datos nuevos.

#### Scenario: Relacionadas por familia
- **WHEN** se abre el detalle de una especie con congéneres de familia en el catálogo
- **THEN** se muestran enlaces a otras especies de la misma familia, cada uno hacia `/<grupo>/<slug>`
