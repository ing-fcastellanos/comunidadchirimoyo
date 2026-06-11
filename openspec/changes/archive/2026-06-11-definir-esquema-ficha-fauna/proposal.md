## Why

El catálogo de fauna es 100% estático y sus datos viven en `content/` (ADR-0004, ADR-0005), pero el **esquema de la ficha de especie aún no está congelado**: `apps/catalogo/lib/content.ts` solo tiene un stub tipado parcial y `content/fauna/` está vacío. Antes de migrar el catálogo inicial (#10) y construir listado, buscador y detalle (#11–#13) hay que fijar qué campos lleva cada especie, en qué formato se guardan y cómo se identifican por URL. Esta es la tarea de research #9 de Fase 1, y desbloquea a todas las demás.

## What Changes

- **Se congela el esquema de la ficha de especie** (aves y anfibios/reptiles) con los campos del stub actual de `lib/content.ts` **más** los que faltaban del issue (`medidas`, `habitat`, `temporada`, `fotos[]` con crédito/licencia, `audios[]`) **y** los revelados por el CSV real: `genero`, `fuentes[]` (obligatorio), `simbologia` y `categoria` como **gremio ecológico**.
- **Estructura de la ficha**: frontmatter YAML solo con datos atómicos; la prosa va en el cuerpo Markdown bajo secciones convenidas `##` (Descripción, Dieta y ecología, Reproducción, Distribución, Cómo identificarla, Dónde y cuándo observarla, ¿Sabías que?).
- **Formato de archivo decidido**: Markdown con frontmatter YAML, **un archivo por especie** (`content/fauna/<grupo>/<slug>/index.md`).
- **Convención de slug decidida**: derivado del **nombre científico** (binomio → kebab-case, p. ej. `Ardea alba` → `ardea-alba`), con override opcional. Garantiza unicidad y estabilidad de URL ante futura i18n (ADR-0011).
- **Se aclara `categoria`** = **gremio ecológico** (`Vadeadoras`, `Nadadoras`, `Playeras`, `Voladoras`, `Rapaces y Carroñeras`, `Terrestres`), tal como lo trae la fuente; `grupo` (`aves`|`anfibios-reptiles`) es el filtro macro. (Corrige una asunción previa de "categoría = clase taxonómica".)
- **Se agrega la fuente de migración al repo**: `content/fauna/_origen/aves-especies.csv` (46 especies), para visibilidad de #10–#13.
- **Se extienden los tipos** de `apps/catalogo/lib/content.ts` con los campos nuevos (sin tocar la firma `getAllFichas`, que sigue siendo stub hasta #10/#11).
- **Se documenta el esquema** en `content/README.md` (incl. vocabulario sugerido de `habitat` y mapeo CSV→ficha) y se añade una ficha de ejemplo `content/fauna/aves/_ejemplo.md`.
- El esquema se **valida contra 2–3 fichas reales** del CSV de origen.

## Capabilities

### New Capabilities
- `esquema-ficha-fauna`: contrato de la ficha de especie del catálogo estático — campos y enums, formato de archivo (Markdown + YAML), convención de slug, layout de directorios, medios (fotos/audio con crédito) y su documentación en `content/`.

### Modified Capabilities
<!-- Ninguna. catalogo-app ya cubre el stub tipado de lib/content.ts en su requisito
     "Acceso a contenido en build"; extender los tipos cae dentro de ese requisito y
     no cambia su comportamiento a nivel de spec. -->

## Impact

- **Sub-dominios afectados**: `aves` (catálogo) y `foundation` (esquema de contenido en `content/`).
- **Contenido**: nuevo `content/README.md` (sección de esquema de ficha), `content/fauna/aves/_ejemplo.md` y la fuente `content/fauna/_origen/aves-especies.csv` (46 especies, ya agregada).
- **Código**: extensión de tipos en `apps/catalogo/lib/content.ts` (solo tipos; sin parseo real todavía).
- **Sin nuevas dependencias** en este cambio (el parser YAML/Markdown se introduce en #10 al implementar el loader real).
- **Desbloquea**: #10 (migración de datos + fotos desde Drive), #11 (listado), #12 (buscador/filtros), #13 (detalle), y reutilización en Fase 2 (anfibios).
- **Sin ADR nuevo**: no rompe convenciones; ADR-0004/0005 ya delegan el esquema a esta issue de research. El formato y la convención de slug quedan registrados en `content/README.md` y en este cambio.

## No-goals

- **No** se implementa el parseo real ni `getAllFichas` (eso es #10/#11).
- **No** se migran las fichas reales ni se bajan fotos de Drive (eso es #10).
- **No** se construye UI de listado/buscador/detalle (#11–#13).
- **No** se introduce un endpoint de búsqueda ni nada en el API (prohibido por ADR-0005/0006).
- **No** se traduce a otros idiomas: solo se deja la estructura i18n-ready (ADR-0011).
