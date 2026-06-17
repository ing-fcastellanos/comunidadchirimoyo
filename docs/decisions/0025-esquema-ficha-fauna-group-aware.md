# ADR-0025 — Esquema de ficha de fauna *group-aware* (común + bloques por grupo)

- **Estado:** Accepted
- **Fecha:** 2026-06-17
- **Decisores:** @ing-fcastellanos
- **Issue:** #16 (exploración que originó la decisión)

## Contexto

El esquema de ficha (`content/fauna/<grupo>/<slug>/index.md`) se diseñó en Fase 1 a partir de
las aves. Al migrar anfibios y reptiles (Fase 2) y proyectar insectos y mamíferos, varios
campos del esquema de aves **no encajan tal cual** o cambian de semántica según el grupo. Del
contraste entre el frontmatter de aves y el origen de datos de anfibios/reptiles:

- **Presencia/estacionalidad.** Aves usa `estatusMigratorio` (p. ej. `migratoria-invierno`).
  Anfibios/reptiles son **residentes**; el concepto migratorio no aplica y se necesita un campo
  de presencia que sirva a ambos.
- **Medidas.** Aves: `envergadura`. Anfibios/reptiles: longitud **hocico-cloaca (LHC)** con su
  criterio de talla. Misma idea (tamaño), distinta métrica y etiqueta.
- **Sonido.** Los anuros (ranas/sapos) tienen canto, como las aves. El origen trae `sonido_*`
  (url, autor, licencia, calidad, país) — encaja con ADR-0017 (audio fauna en GCS).
- **Distribución/mapa.** Aves: rangos de países `cria`/`invernada` (mapa migratorio, ADR-0018).
  Anfibios/reptiles: rango de **residente** (un solo polígono/zona), sin cría/invernada.
- **Conservación.** Hay especies en NOM-059 (p. ej. salamandra en categoría *Pr*); el esquema
  debe representar correctamente las categorías NOM-059 además de IUCN.
- **Bloques de resumen.** El origen de anfibios incluye campos `resumen_*` (descripción, sabías
  que, cómo identificarla, dónde/cuándo) que conviene normalizar como parte de la ficha.

El esquema debe absorber estos grupos sin bifurcar el catálogo en múltiples formatos
incompatibles, y debe quedar preparado para insectos y mamíferos.

## Decisión

Generalizar la ficha a un **único esquema de fauna *group-aware***: un **núcleo común** a
todos los grupos más **bloques/campos opcionales activados por grupo**. No habrá un esquema
por grupo ni apps/loaders separados.

- **Núcleo común** (todos los grupos): `slug`, `grupo`, `categoria`, `nombreComun`,
  `nombreCientifico`, taxonomía (`orden`, `familia`, `genero`, `autoridad`), `otrosNombres`,
  `conservacion` (NOM-059 + IUCN), `presencia`, `gradoOcurrencia`, `simbologia`, claves de
  apariencia/zona/fechas, `pullQuote`, bloques `resumen*`, `fuentes`, `fotos[]`.
- **Bloques opcionales por grupo:**
  - *Medidas* con criterio de talla: `envergadura` (aves) vs LHC (herpetofauna), bajo un campo
    de medidas que declara su criterio.
  - *Sonido* (`sonido*`): presente en aves y anuros; ausente donde no aplique.
  - *Distribución*: variante **migratoria** (cría/invernada, aves) vs **residente** (un rango,
    herpetofauna), consumidas por el mapa (ADR-0018) según el caso.
- **Presencia** se modela con un campo único que admite tanto `residente` como los estatus
  migratorios, en vez de un campo exclusivo de migración.

Los campos no aplicables a un grupo simplemente **se omiten**; el render y el validador tratan
los bloques como opcionales. La generalización exacta de nombres y enums se cierra en el issue
de esquema de Fase 2, pero la forma —**un esquema, núcleo + bloques opcionales por grupo**— es
la decisión.

## Alternativas consideradas

- **Un esquema por grupo (`ficha-aves`, `ficha-anfibios`, …):** máxima libertad por grupo, pero
  duplica loaders, validación, render y PDF, y rompe la búsqueda/listado unificados. Contradice
  el catálogo único de ADR-0024/0005. Descartada.
- **Forzar los datos de anfibios al esquema de aves tal cual:** rápido, pero falsea la semántica
  (un residente no tiene "estatus migratorio"; LHC no es "envergadura"). Genera campos vacíos o
  mal nombrados y deuda en cada grupo nuevo. Descartada.
- **Campo libre / "propiedades extra" sin estructura:** flexible pero no validable ni
  consultable por la búsqueda; pierde el valor de tener esquema. Descartada.

## Consecuencias

### Positivas

- Un solo loader, validador, render de detalle, búsqueda y PDF sirven a todos los grupos.
- Anfibios/reptiles (y luego insectos/mamíferos) reutilizan casi todo el trabajo de aves.
- La semántica queda correcta por grupo (presencia residente, LHC, mapa de residente, canto de
  anuros) sin campos mentirosos.

### Negativas

- El esquema y el render se vuelven algo más condicionales (bloques opcionales por grupo).
- Hay que extender el validador y la documentación del esquema, y posiblemente el render de
  detalle, mapa y PDF, para los bloques nuevos.

### Neutras

- Las fichas de aves existentes no se rompen: los campos nuevos son opcionales; los de aves
  siguen poblándose igual.

## Plan de revisión

Reconsiderar (hacia esquemas por grupo o sub-esquemas) si algún grupo futuro divergiera tanto
que los bloques opcionales volvieran la ficha inmanejable, o si la condicionalidad por grupo en
el render se tornara frágil.

## Referencias

- Deriva de [ADR-0004](0004-contenido-en-repo.md) (contenido en repo) y
  [ADR-0005](0005-catalogo-estatico-anfibios-categoria.md) (catálogo estático).
- Consume: [ADR-0017](0017-storage-audio-fauna-gcs.md) (audio), [ADR-0018](0018-mapa-distribucion-geografia-real.md) (mapa).
- Contexto de IA: [ADR-0024](0024-catalogo-fauna-dominio-unico-grupos-por-path.md).
- Épica #16 (Fase 2 — Anfibios).
