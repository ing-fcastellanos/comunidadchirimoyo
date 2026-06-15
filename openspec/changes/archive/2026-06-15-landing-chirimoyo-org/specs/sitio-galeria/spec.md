## ADDED Requirements

### Requirement: Almacenamiento de imágenes de comunidad en GCS

Las fotos del humedal, jornadas y eventos SHALL almacenarse en un **bucket de Google Cloud Storage propio**, separado del bucket de imágenes de fauna (ADR-0016). La decisión de crear este almacenamiento SHALL documentarse en un ADR nuevo (`docs/decisions/0021-storage-imagenes-comunidad-gcs.md`) y registrarse en el índice de ADRs antes de implementarse. Las páginas que muestran estas fotos SHALL referenciarlas por URL del bucket; NO SHALL hardcodear nombres de archivo de fotos individuales en los componentes.

#### Scenario: Fotos servidas desde el bucket de comunidad
- **WHEN** se renderiza una página que muestra fotos de comunidad
- **THEN** las imágenes se sirven desde el bucket de GCS de comunidad, no desde `public/` ni desde el bucket de fauna

#### Scenario: Decisión documentada
- **WHEN** se revisa `docs/decisions/`
- **THEN** existe un ADR que justifica el bucket de imágenes de comunidad y el índice de ADRs lo referencia

### Requirement: Página de galería con rejilla y lightbox

La app de sitio SHALL servir `/galeria` con una **rejilla** de fotos de comunidad que tolere orientaciones mixtas (horizontal y vertical) sin layout shift, y un **lightbox** para ver cada foto ampliada. La rejilla SHALL derivar su lista de fotos de un origen de datos resuelto en build (no nombres hardcodeados en el componente). Cada foto SHALL tener texto alternativo. Las imágenes SHALL cargarse de forma diferida (lazy-load) salvo las primeras visibles. Este patrón (grid + lightbox) SHALL pasar por el flujo de diseño v0.dev antes de portarse.

#### Scenario: Rejilla con orientaciones mixtas
- **WHEN** se abre `/galeria` con fotos verticales y horizontales
- **THEN** la rejilla las acomoda sin recortes que rompan el encuadre ni saltos de layout

#### Scenario: Lightbox al activar una foto
- **WHEN** el usuario activa una foto de la rejilla
- **THEN** se abre un lightbox que la muestra ampliada y permite cerrarlo

#### Scenario: Lista derivada, no hardcodeada
- **WHEN** se agrega o quita una foto del origen de datos de galería y se reconstruye
- **THEN** la rejilla refleja el cambio sin editar el componente

#### Scenario: Accesibilidad del lightbox
- **WHEN** el usuario navega `/galeria` con teclado
- **THEN** puede abrir y cerrar el lightbox y el foco se gestiona de forma accesible
