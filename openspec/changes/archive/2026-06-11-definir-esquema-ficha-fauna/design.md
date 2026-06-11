## Context

El catálogo de fauna (`aves.chirimoyo.org`) es 100% estático: los datos viven en `content/` y la búsqueda es en cliente (ADR-0004, ADR-0005). Hoy `content/fauna/` está vacío y `apps/catalogo/lib/content.ts` solo tiene un stub tipado parcial. La fuente de los datos es un par de archivos **CSV + JSON con la misma información** y un **banco de fotos en Google Drive**; los slugs aún no existen en esa fuente. Esta tarea (#9, research de Fase 1) congela el contrato de la ficha para desbloquear la migración (#10) y el front (#11–#13), y para que Fase 2 (anfibios/reptiles) reutilice el mismo esquema. No hay backend involucrado.

## Goals / Non-Goals

**Goals:**
- Congelar campos, enums, formato de archivo y convención de slug de la ficha de especie.
- Extender los tipos de `lib/content.ts` con los campos que faltaban (`medidas`, `habitat`, `temporada`, `fotos` estructuradas, `audios`).
- Documentar el esquema en `content/README.md` y dar una ficha de ejemplo validada.
- Dejar la estructura i18n-ready (ADR-0011) sin traducir.
- Modelar el grupo aves vs anfibios/reptiles de forma reutilizable en Fase 2.

**Non-Goals:**
- Implementar el parseo real o `getAllFichas` (es #10/#11).
- Migrar fichas reales o bajar fotos de Drive (es #10).
- Construir listado/buscador/detalle (#11–#13) ni el PDF (#14).
- Añadir dependencias (el parser YAML/Markdown entra en #10).
- Introducir endpoint de búsqueda o algo en el API (prohibido, ADR-0005/0006).

## Decisions

### D1 — Formato: Markdown + frontmatter YAML, un archivo por especie

`content/fauna/<grupo>/<slug>/index.md`: prosa en el cuerpo, campos estructurados en el frontmatter YAML.

- **Por qué**: encaja con la identidad "guía de campo editorial" (la descripción es prosa multipárrafo); editable por colaboradores no técnicos (ADR-0004, CONTRIBUTING); diffs limpios por especie en PRs; la carpeta por especie aloja sus fotos/audio junto a la ficha.
- **Alternativas**: (a) un JSON por especie — más fácil de auto-generar desde la fuente, pero la prosa en JSON es horrible de editar a mano; (b) un único JSON/CSV monolítico — trivial de generar pero pésimo para PRs por especie y conflictos de merge. Descartadas; de todas formas #10 corre un script de migración que puede emitir `.md` sin costo extra.

### D2 — Slug derivado del nombre científico, con override

`Ardea alba` → `ardea-alba` (minúsculas, sin diacríticos, espacios→`-`). Campo `slug` opcional en frontmatter para sobreescribir.

- **Por qué**: unicidad garantizada (no hay dos especies con el mismo binomio) y URL estable ante futura i18n — ADR-0011 nota que "los nombres científicos ya son referencia global"; al añadir EN, `/ardea-alba` no cambia, solo el copy. El nombre común sí cambiaría y puede colisionar.
- **Override** para homónimos a nivel de subespecie o renombres taxonómicos. El slug es **derivado en el pipeline de #10**, no un campo que se llene a mano en el CSV (aunque pueda fijarse explícitamente).

### D3 — `categoria` = gremio ecológico (corregido contra la fuente)

La validación contra el CSV real (`content/fauna/_origen/aves-especies.csv`, 46 especies) mostró que `categoria` en los datos **no** es la clase taxonómica, sino un **gremio ecológico**: `Vadeadoras`, `Nadadoras`, `Playeras`, `Voladoras`, `Rapaces y Carroñeras`, `Terrestres`. Se adopta ese significado: `categoria` es un agrupador ecológico/funcional, gran sub-filtro del catálogo.
- `grupo` (`aves` | `anfibios-reptiles`) sigue siendo el **filtro macro** y se deriva (las 46 actuales son `aves`; no es columna del CSV).
- Para distinguir anfibios vs. reptiles en Fase 2 se usa `grupo` (o un futuro campo de clase), **no** `categoria`.
- **Corrección**: una versión previa de este design asumió `categoria = clase taxonómica`; la fuente lo desmiente y se corrige aquí.

### D4 — Conservación: NOM-059 primaria, IUCN complementaria

`conservacion = { nom059, iucn?, notas? }`, invirtiendo la prioridad que sugería el issue (IUCN).
- **Por qué**: la NOM-059-SEMARNAT es el estándar **legal mexicano** y lo relevante para la difusión del humedal; IUCN es referencia global útil pero secundaria.

### D5 — Forma de los campos nuevos

- `temporada = { meses: number[] (1–12), notas? }`: meses numéricos → filtrables (#12) y renderizables como calendario; i18n-safe (el locale nombra los meses).
- `habitat: string[]`: etiquetas de microhábitat con vocabulario **sugerido y extensible** en `content/README.md` (espejo de agua, vegetación ribereña, dosel, suelo, troncos…), no un enum rígido.
- `fotos: { archivo, credito, alt, licencia? }[]`, primera = portada. `credito` cumple el requisito del issue; `alt` da accesibilidad y aísla string traducible; `licencia` mantiene limpio lo legal (fotos vienen de Drive con permiso/atribución).
- `audios?: { archivo, credito, descripcion?, licencia? }[]`: opcional; generaliza a cantos de ranas en Fase 2.

### D7 — Estructura de la ficha: frontmatter atómico + cuerpo con secciones H2

La validación mostró que el CSV trae **varias secciones narrativas** por especie, no una sola descripción. Se modelan así:
- **Frontmatter YAML** = solo datos atómicos/estructurados/enumerables (taxonomía, ejes de estatus, conservación, `categoria`, `simbologia`, `medidas`, `habitat` tags, `temporada.meses`, `fotos`, `audios`, `fuentes`).
- **Cuerpo Markdown** = toda la prosa, bajo un conjunto **convenido** de encabezados `##` (en este orden, los que existan): `## Descripción`, `## Dieta y ecología`, `## Reproducción`, `## Distribución`, `## Cómo identificarla` (claves de apariencia), `## Dónde y cuándo observarla` (claves de zona + fechas), `## ¿Sabías que?` (aspectos adicionales).
- **Por qué**: prosa donde corresponde (editable por colaboradores no técnicos); el detalle (#13) renderiza las secciones conocidas en orden; i18n futura separa el cuerpo por idioma sin tocar el frontmatter (ADR-0011).
- **Mapeo CSV→secciones** (#10): `descripcion`→Descripción, `dieta_ecologia`→Dieta y ecología, `reproduccion`→Reproducción, `distribucion`→Distribución, `claves_apariencia`→Cómo identificarla, `claves_zona_observacion`+`claves_fechas_observacion`→Dónde y cuándo observarla, `aspectos_adicionales`→¿Sabías que?

### D8 — Campos adicionales revelados por la fuente

- `genero` (string): género taxonómico (columna `genero`). Se añade al esquema.
- `fuentes` (string[]): citas/referencias por especie (columna `fuentes`). **Obligatorio** — sostiene la credibilidad del catálogo de conservación.
- `simbologia` (string, opcional/derivable): código compacto de guía de campo (p. ej. `R-PC-SR-N`) que resume los 4 ejes; derivable de los enums de estatus + conservación + distribución.
- `categoria` (string): gremio ecológico (ver D3).
- `temporada` y `habitat` son **prosa autoritativa** en el CSV (`claves_fechas_observacion`, `claves_zona_observacion`): la prosa se preserva en el cuerpo (sección "Dónde y cuándo observarla") y `temporada.meses`/`habitat` (tags) quedan **opcionales y derivados best-effort** en #10 para filtros — no bloquean la ficha si no se pueden inferir.

### D6 — Documentación, no ADR

El esquema se registra en `content/README.md` + `content/fauna/aves/_ejemplo.md`, no en un ADR ni en una spec de backend. ADR-0004/0005 ya delegan explícitamente el esquema a esta issue de research, y no se rompe ninguna convención documentada. La capability OpenSpec `esquema-ficha-fauna` formaliza el contrato.

## Risks / Trade-offs

- ~~La fuente puede no tener los 3 ejes de estatus por separado~~ **RESUELTO**: el CSV (`content/fauna/_origen/aves-especies.csv`, 46 esp.) trae los 3 ejes como columnas limpias (`estatus_migratorio`, `grado_ocurrencia`, `estatus_distribucion`) cuyos valores mapean 1:1 a los enums (incl. los 4 valores de `estatusMigratorio`). El único trabajo de #10 es parsear el texto de conservación a códigos: `Sin categoría de riesgo`→`ninguno`, `Amenazada`→`a`, `Protección Especial`→`pr`; IUCN `Preocupación Menor`→`LC`.
- **Cambio de stub a esquema completo podría romper el typecheck** del catálogo. *Mitigación*: extender tipos sin tocar la firma de `getAllFichas`; correr `npm run typecheck` como parte de las tareas.
- **Vocabulario de `habitat` abierto puede divergir** entre fichas. *Mitigación*: lista sugerida en `content/README.md` y revisión en PR; no se fuerza enum para no frenar altas de contenido.
- **Licencia de fotos de Drive sin verificar** → riesgo legal. *Mitigación*: `licencia`/`credito` en el esquema; la verificación real de permisos ocurre al migrar en #10.

## Migration Plan

No hay migración de datos en este cambio (es definición de contrato). Pasos de #9: extender tipos en `lib/content.ts`, escribir `content/README.md`, crear `content/fauna/aves/_ejemplo.md`, validar contra 2–3 fichas reales. Reversible trivialmente (revertir archivos de docs/tipos). La migración real de datos y fotos es #10.

## Open Questions

- ✅ ~~¿La fuente trae los 3 ejes de estatus por separado?~~ Sí (ver Risks).
- ¿Vocabulario inicial de `habitat` definitivo? Se propone una lista semilla en `content/README.md`, ampliable; los tags se derivan best-effort de `claves_zona_observacion`.
- ¿Licencia/atribución por defecto para las fotos del banco de Drive, o se captura caso por caso en #10?
- ¿`simbologia` se almacena en el frontmatter o se deriva en build? Por ahora opcional (derivable); decidir al implementar el detalle (#13).
