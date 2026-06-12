# content/

Contenido versionado del proyecto (Markdown/JSON). Fuente de verdad de todo lo editable sin tocar código. Ver [ADR-0004](../docs/decisions/0004-contenido-en-repo.md).

## Estructura prevista

```
content/
├── fauna/                fichas de especies (aves + anfibios/reptiles)
│   ├── aves/
│   │   ├── _ejemplo.md            ficha de referencia (no es una especie)
│   │   └── <slug>/index.md        una carpeta por especie (+ sus fotos/audio)
│   ├── anfibios-reptiles/         (Fase 2)
│   └── _origen/                   datos de migración (CSV) — no es la ficha final
├── noticias/             posts de comunidad.chirimoyo.org
├── comunidad/            historia, misión, visión, acciones
├── jornadas/             jornadas de limpieza/mantenimiento (voluntarios)
└── legal/                aviso de privacidad, datos de donación
```

> Cada esquema (campos de una ficha, de una noticia, de una jornada) se define en la issue/spec de su fase. No improvises el formato: revisa el spec correspondiente antes de añadir contenido.

## Esquema de la ficha de fauna

Cada especie es **un archivo Markdown con frontmatter YAML** en `content/fauna/<grupo>/<slug>/index.md`, donde `<grupo>` es `aves` o `anfibios-reptiles`. Las fotos y audios de la especie viven en esa misma carpeta. Contrato congelado en la issue #9 (change `definir-esquema-ficha-fauna`); los tipos están en [`apps/catalogo/lib/content.ts`](../apps/catalogo/lib/content.ts).

Regla de oro: **el frontmatter lleva solo datos atómicos; la prosa va en el cuerpo Markdown.**

### Convención de slug

El `slug` (y el nombre de la carpeta) se deriva del **nombre científico** en kebab-case: minúsculas, sin acentos, espacios → `-`. Ej.: *Ardea alba* → `ardea-alba`. Es único en todo el catálogo y estable ante futura i18n (la URL no cambia al traducir). Se puede declarar un `slug` explícito en el frontmatter para resolver colisiones o renombres.

### Campos del frontmatter (YAML)

**Obligatorios:**

| Campo | Tipo / valores | Notas |
|---|---|---|
| `slug` | string | = nombre de la carpeta |
| `grupo` | `aves` \| `anfibios-reptiles` | filtro macro |
| `categoria` | string | **gremio ecológico**: Vadeadoras, Nadadoras, Playeras, Voladoras, Rapaces y Carroñeras, Terrestres |
| `nombreComun` | string | |
| `nombreCientifico` | string | binomio |
| `orden` · `familia` · `genero` | string | taxonomía |
| `estatusMigratorio` | `residente` \| `migratoria-invierno` \| `migratoria-verano` \| `transitoria` | |
| `gradoOcurrencia` | `comun` \| `poco-comun` \| `rara` | |
| `estatusDistribucion` | `nativa` \| `introducida` | |
| `conservacion` | `{ nom059, iucn?, notas? }` | ver abajo |
| `fuentes` | string[] (≥1) | citas/referencias |
| `fotos` | Foto[] (≥1) | la primera es la portada |

**Opcionales:** `simbologia` (string, p. ej. `R-PC-SR-N`), `medidas` (`{ tamanoCm?: [min,max], pesoG?: [min,max], notas? }`), `habitat` (string[] de etiquetas), `temporada` (`{ meses?: number[] 1–12, notas? }`), `audios` (Audio[]).

**Ficha de detalle (opcionales)** — alimentan el hero, los datos rápidos y la observación de la página de detalle:

| Campo | Cardinalidad | Ejemplo · columna CSV |
|---|---|---|
| `autoridad` | uno | `Rackett, 1813` · `autoridad` |
| `otrosNombres` | lista (`;`) | `Avetoro Lentiginoso; Martinete` · `otros_nombres` |
| `envergadura` | uno | `95–115 cm` · `envergadura` |
| `mejorHora` | uno | `Amanecer y atardecer` · `mejor_hora` |
| `medidas.tamanoCm` | rango | `59-70` · `tamano_cm` |
| `medidas.pesoG` | rango | `370-500` · `peso_g` |
| `temporada.meses` | lista (`;`) | `10;11;12;1;2;3` · `temporada_meses` (+ `temporada_notas`) |
| `pullQuote` | uno | cita destacada de la descripción · `pull_quote` |

**Búsqueda visual (opcionales)** — alimentan los filtros del buscador para principiantes; vocabularios cerrados:

| Campo | Cardinalidad | Valores |
|---|---|---|
| `forma` | uno | `pato` · `garza` · `gallineta` · `buceador` · `playera` · `rapaz` · `pajaro` |
| `tamano` | uno | `muy-chica` · `chica` · `mediana` · `grande` · `muy-grande` |
| `colores` | lista (≥1) | `blanco` · `negro` · `cafe` · `gris` · `azul` · `verde` · `amarillo` · `rojo` · `naranja` · `iridiscente` |
| `donde` | uno | `nadando` · `orilla` · `volando` · `arbol` · `suelo` · `poste` |
| `featured` | booleano | `true` / `false` |

Las etiquetas, iconos y colores de cada valor viven en `apps/catalogo/lib/dictionary.ts` (vocabulario de UI). En el CSV de origen son las columnas `forma`, `tamano`, `colores` (separadas por `;`), `donde`, `featured`.

**Conservación** — `nom059` (NOM-059-SEMARNAT, primaria): `pr` (protección especial) · `a` (amenazada) · `p` (en peligro) · `e` (probablemente extinta) · `ninguno`. `iucn` (código IUCN, p. ej. `LC`, `VU`) y `notas` opcionales.

**Foto** — `{ archivo, credito, alt, licencia?, creditoUrl?, licenciaUrl? }`. `credito` y `alt` obligatorios. `creditoUrl` (enlace a la observación/foto original) y `licenciaUrl` (texto legal de la licencia) son opcionales y dan la **atribución enlazable** que exigen CC BY / CC BY-SA (extensión aditiva del esquema, ver [ADR-0016](../docs/decisions/0016-storage-imagenes-fauna-gcs.md)). `archivo` es solo el **nombre del archivo**: las imágenes optimizadas de fauna viven en el bucket público GCS `catalogo-aves-chirimoyo` y se sirven por su URL pública componiendo la variante (`web` para detalle, `thumb` para cards) con `fotoUrl(slug, archivo, variante)` de `apps/catalogo/lib/content.ts`. Las crudas se archivan en un bucket privado aparte. Ver [ADR-0016](../docs/decisions/0016-storage-imagenes-fauna-gcs.md). **Audio** — `{ archivo, credito, descripcion?, licencia? }`.

### Cuerpo Markdown — secciones convenidas

La prosa se organiza bajo encabezados de nivel 2 (`##`), presentes los que apliquen y en este orden. `## Descripción` siempre presente:

`## Descripción` · `## Dieta y ecología` · `## Reproducción` · `## Distribución` · `## Cómo identificarla` · `## Dónde y cuándo observarla` · `## ¿Sabías que?`

### Vocabulario sugerido de `habitat`

Lista semilla, **extensible** (etiquetas en kebab-case): `espejo-de-agua`, `vegetacion-ribereña`, `tular`, `orilla-fangosa`, `dosel`, `arbustos`, `pastizal`, `suelo`, `troncos`, `aire`. Si una especie necesita una etiqueta nueva, agrégala aquí en el mismo PR.

### Migración desde el CSV de origen

El catálogo inicial de aves se migra (issue #10) desde [`fauna/_origen/aves-especies.csv`](fauna/_origen/aves-especies.csv); el mapeo columna→ficha y el parseo de conservación están en [`fauna/_origen/README.md`](fauna/_origen/README.md). Ver [`fauna/aves/_ejemplo.md`](fauna/aves/_ejemplo.md) como ficha de referencia.

## Aportar contenido sin programar

Si quieres aportar una ficha, foto o texto y no usas git, abre una issue con el material o escribe al correo de contacto. El equipo lo integra. Ver [CONTRIBUTING.md](../CONTRIBUTING.md).
