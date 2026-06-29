# noticias-comunidad Specification

## Purpose
TBD - created by archiving change noticias-foundation. Update Purpose after archive.
## Requirements
### Requirement: Esquema de la nota de comunidad

Una nota de comunidad SHALL ser un archivo Markdown con frontmatter en `content/noticias/<slug>.md`. El frontmatter SHALL incluir `titulo` (str), `slug` (str, kebab-case, coincidente con el nombre de archivo), `fecha` (str ISO `YYYY-MM-DD`), `resumen` (str) y `estado` (`borrador` | `publicado`); PUEDE incluir `autor` (str), `portada` (ruta de imagen en el bucket de comunidad, ADR-0021), `portadaAlt` (str, requerido si hay `portada`) y `tags` (lista de str). El cuerpo SHALL ser markdown editorial. La nota SHALL ser **contenido público**: NO SHALL contener PII ni datos sensibles.

#### Scenario: Nota válida se lee
- **WHEN** existe `content/noticias/<slug>.md` con `titulo`, `slug`, `fecha`, `resumen` y `estado`
- **THEN** el data-layer la lee y la tipa sin romper

#### Scenario: Convenciones de la nota
- **WHEN** se crea una nota
- **THEN** su `slug` es kebab-case y coincide con el nombre de archivo, y su `fecha` está en formato ISO

### Requirement: Data-layer de noticias

`apps/sitio` SHALL proveer `lib/noticias.ts` (server-only) con `getAllNoticias()` y `getNoticia(slug)`, y tipos exportados (seguros para importar en cliente). `getAllNoticias()` SHALL devolver las notas **ordenadas por `fecha` descendente** y SHALL **excluir las de `estado: borrador` en producción** (en desarrollo PUEDEN mostrarse para previsualización). `getNoticia(slug)` SHALL devolver la nota correspondiente (con su cuerpo markdown) o ausencia si no existe. El cuerpo SHALL renderizarse con el renderizador de markdown editorial (`markdown-editorial`).

#### Scenario: Orden y exclusión de borradores en prod
- **WHEN** en producción se llama `getAllNoticias()` y existen notas `publicado` y `borrador`
- **THEN** se devuelven solo las `publicado`, ordenadas por fecha descendente

#### Scenario: Borradores visibles en desarrollo
- **WHEN** en desarrollo se llama `getAllNoticias()`
- **THEN** las notas en `borrador` también se incluyen (para previsualizar)

#### Scenario: Obtener una nota por slug
- **WHEN** se llama `getNoticia("<slug>")` con un slug existente
- **THEN** se devuelve la nota con su frontmatter tipado y su cuerpo markdown

### Requirement: Documentación y nota de ejemplo

El esquema SHALL documentarse en `content/noticias/README.md` (campos, fechas ISO, `slug` kebab-case, imágenes optimizadas en el bucket). SHALL existir **una nota de ejemplo** que ejercite el renderizador (enlaces, listas, una imagen y una cita), de modo que el data-layer + renderer se puedan verificar end-to-end sin las páginas finales.

#### Scenario: Nota de ejemplo ejercita el renderer
- **WHEN** se procesa la nota de ejemplo
- **THEN** su cuerpo (con enlaces, listas, imagen y cita) se renderiza correctamente con el componente de markdown

