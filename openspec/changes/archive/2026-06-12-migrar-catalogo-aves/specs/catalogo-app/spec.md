## MODIFIED Requirements

### Requirement: Acceso a contenido en build

La app SHALL incluir `lib/content.ts` que resuelva la raíz del contenido del repo
(`content/fauna/`) en build, con la ruta por defecto relativa a la raíz del monorepo y
override mediante la variable de entorno `CONTENT_DIR`. El loader `getAllFichas()` SHALL
dejar de ser un stub: SHALL descubrir las fichas `content/fauna/<grupo>/<slug>/index.md`,
parsear su frontmatter YAML y sus secciones de cuerpo (`##`) a objetos `FichaEspecie`
tipados, y validar el núcleo del esquema de #9. El build SHALL fallar si alguna ficha
tiene el núcleo incompleto; los campos opcionales/⊙ ausentes SHALL tolerarse. Las carpetas
con prefijo `_` (p. ej. `_ejemplo`, `_origen`) SHALL excluirse del catálogo.

#### Scenario: Loader resuelve la raíz de contenido
- **WHEN** se invoca el loader de contenido en build
- **THEN** resuelve `content/fauna/` desde la raíz del repo (o desde `CONTENT_DIR` si está definido) sin depender de un contexto Docker

#### Scenario: Loader parsea fichas reales
- **WHEN** se ejecuta `getAllFichas()` en build con fichas presentes en `content/fauna/aves/`
- **THEN** devuelve un `FichaEspecie[]` con el frontmatter y las secciones de cuerpo parseadas, excluyendo carpetas con prefijo `_`

#### Scenario: Build falla ante núcleo incompleto
- **WHEN** una ficha carece de un campo del núcleo del esquema
- **THEN** el loader lanza un error que identifica la ficha y el campo, y el build no produce `out/`
