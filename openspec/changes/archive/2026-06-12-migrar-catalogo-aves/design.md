## Context

El esquema de la ficha de fauna está congelado (#9) y `apps/catalogo/lib/content.ts`
tiene los tipos + un stub `getAllFichas()`. Los datos reales viven en dos lugares fuera
del formato final:

- `content/fauna/_origen/aves-especies.csv` — **63 especies**, UTF-8 válido, prosa 100%
  completa, sin columna de fotos. Mapeo columna→ficha y parseo de conservación documentados
  en `content/fauna/_origen/README.md`.
- Banco de imágenes local `C:\Users\Frank\Downloads\Img guia aves\Imagenes aves` — **63
  carpetas** nombradas por nombre científico (=slug), **503 fotos** (jpg/jpeg/png) ya
  curadas y renombradas `<Nombre_Cientifico>_NN`. La reconciliación CSV↔carpetas↔manifiesto
  es exacta (63/63 especies, 503/503 archivos, 0 sin emparejar).
- Manifiesto de créditos `creditos_imagenes.json` (provisto) — una entrada por foto
  (503/503), keyed por la ruta `archivo` (`Imagenes aves\<sci>\<file>`), con `autor`,
  `atribucion`, `licencia` (CC0 343 · CC BY-SA 4.0 101 · CC BY 4.0 53 · CC0 1.0 6),
  `licencia_url`, `observacion_url`, `foto_pagina`, `fuente` (343 comunitarias / 160
  iNaturalist) e `img_url`. Cobertura total ⇒ no hay créditos "pendiente" en la práctica.

Restricciones del proyecto: catálogo 100% estático (ADR-0014), contenido en repo
(ADR-0004), sin tooling de monorepo, decisiones de infra → ADR. ADR-0003 §5 aplazó
explícitamente la decisión de storage de imágenes "a Fase 1 según peso"; ese peso ya se
conoce y obliga a decidir aquí.

## Goals / Non-Goals

**Goals:**
- Un script reproducible e idempotente que genere las fichas `index.md` y suba las
  imágenes, ejecutable repetidamente conforme crece el catálogo.
- Convertir el loader `getAllFichas()` de stub a parser real con validación de núcleo.
- Resolver el storage de imágenes (ADR) y dejar las fichas referenciando las optimizadas.

**Non-Goals:**
- Listado/buscador/detalle/PDF (#11–#14) y deploy (#15).
- Curaduría editorial automática (elegir "la mejor" foto, reescribir prosa, completar
  `habitat`/`temporada` con heurística): se dejan vacíos y se curan a mano luego.
- Correr el script en este cambio (se espera el CSV con ≈63 especies).

## Decisions

### D1 — Lenguaje del script: Python 3.12
Python ya es lenguaje del proyecto (`services/api`) y cubre todo con libs maduras:
`csv` (stdlib), `Pillow` (optimización), `google-cloud-storage` (subida), `hashlib`
(dedup). El Markdown se emite con un **template controlado por string**, NO con un
`yaml.dump` genérico, para preservar el orden de campos y el estilo de flujo
(`tamanoCm: [80, 100]`) de `_ejemplo.md`. _Alternativa:_ Node + `sharp` + `gray-matter`;
descartada para no introducir un toolchain Node en `scripts/`. El loader sí es TS y parsea
con `gray-matter` — emisor (Python) y lector (TS) son piezas distintas, lo cual es normal.

### D2 — Storage de imágenes: bucket GCS `catalogo-aves-chirimoyo` → ADR nuevo
Las imágenes (incluidas las crudas, que el equipo quiere conservar como archivo) no van al
repo. Se usa el bucket **`catalogo-aves-chirimoyo`** en el proyecto `chirimoyo`, con tres
prefijos de nivel superior según uso, todos con la clave `<slug>/<archivo>`:
- **`raw/`** — la imagen original (archivo estático, no se sirve en la UI),
- **`web/`** — variante optimizada ~1600 px WebP (detalle de especie),
- **`thumb/`** — miniatura ~600 px WebP (cards del listado/buscador).

Esto resuelve ADR-0003 §5 y rompe el aplazamiento → **ADR-0016 — Storage de imágenes de
fauna en bucket GCS**. _Alternativa:_ optimizadas en repo (decenas de MB); descartada
porque también se conservan las crudas como archivo, inviable en git.

### D3 — Servir tras dominio propio + CDN; referencia de foto portable
Las imágenes se sirven tras un **dominio propio con CDN** (`cdn.chirimoyo.org`, Cloud CDN
sobre el bucket / Firebase Hosting según aterrice ADR-0016), no por la URL cruda de
`storage.googleapis.com`. `fotos[].archivo` guarda solo el **nombre del archivo** (relativo
a la especie, coherente con el esquema "ruta relativa a la carpeta de la ficha"); la app
compone la URL por **prefijo según contexto** con el mismo nombre:
- card → `${NEXT_PUBLIC_FAUNA_CDN_BASE}/thumb/${slug}/${archivo}`
- detalle → `${NEXT_PUBLIC_FAUNA_CDN_BASE}/web/${slug}/${archivo}`

con `NEXT_PUBLIC_FAUNA_CDN_BASE` por defecto `https://cdn.chirimoyo.org`. Así el contenido
no embebe el host, no se duplican campos en el frontmatter y cambiar de bucket/CDN no
reescribe las 63 fichas.

### D4 — Optimización: dos variantes WebP (web + thumb)
Por foto se generan dos derivadas WebP con EXIF removido: **web** (borde largo ~1600 px,
~82 %) para el detalle y **thumb** (borde largo ~600 px, ~75 %) para las cards. La original
se conserva tal cual en `raw/`. _Alternativa:_ JPEG; WebP da ~30 % menos peso con soporte
universal actual. _Alternativa:_ una sola variante; descartada porque servir el 1600 px en
un grid de cards desperdicia ancho de banda.

### D5 — Idempotencia en dos planos
- **Fichas:** si `content/fauna/aves/<slug>/index.md` existe, se conserva; `--force`
  regenera desde el CSV. Default seguro porque las fichas son la fuente de verdad final
  (ADR-0004) y se curan a mano tras generarse.
- **Imágenes:** se sube un objeto solo si no existe ya en el bucket (por clave estable
  derivada del hash de contenido); `--force` re-sube. Evita reprocesar 2.1 GB cada corrida.

### D6 — Manifiesto de créditos keyed por ruta `archivo`
El manifiesto `creditos_imagenes.json` (provisto, 503/503) se indexa por la ruta `archivo`
de cada entrada (`Imagenes aves\<sci>\<file>`). El script mapea `atribucion`→`credito`,
`licencia`→`licencia`, `foto_pagina`/`observacion_url`→`creditoUrl`, `licencia_url`→
`licenciaUrl`. La cobertura es total, así que en la práctica no habrá créditos pendientes;
se conserva el fallback "pendiente" solo por robustez ante fotos futuras sin entrada (nunca
se inventa atribución).

### D8 — Extender el esquema de Foto con `creditoUrl` + `licenciaUrl`
160 fotos son CC BY / CC BY-SA, que exigen atribución **enlazable** (autor + fuente +
licencia, modelo TASL). El esquema congelado en #9 (`{ archivo, credito, alt, licencia? }`)
no tiene dónde guardar las URLs. Se extiende `Foto` con dos campos **opcionales**:
`creditoUrl` (enlace a la observación/foto) y `licenciaUrl` (texto legal de la licencia).
Por ser aditivo y opcional es compatible hacia atrás (las fichas y `_ejemplo.md` existentes
siguen válidas). Se documenta en `content/README.md` y se tipa en `lib/content.ts`; al tocar
el contrato de #9 se registra como una extensión aditiva, no un cambio de comportamiento.

### D7 — Slug canónico = nombre de carpeta
El script deriva el slug del nombre científico y crea la carpeta; el loader toma el nombre
de la carpeta como slug canónico (el `slug` del frontmatter solo resuelve renombres). Una
única función de kebab-case (minúsculas, sin acentos, espacios→`-`) gobierna ambos.

## Risks / Trade-offs

- **Subida de 2.1 GB (tiempo/costo)** → mitigación: skip-si-existe por hash, corrida única
  y luego incremental; egress nulo al subir, lectura pública con caché de CDN.
- **`--force` pisa fichas curadas a mano** → mitigación: default es skip-existing; el flujo
  de "agregar especies" no usa `--force`; documentarlo en el encabezado del script.
- **Manifiesto de créditos incompleto / propiedad de las fotos** → mitigación: créditos
  "pendiente" visibles; confirmar autoría/licencia antes de publicar (riesgo legal, no solo
  cosmético).
- **Fidelidad del frontmatter** (un dumper genérico reordena/reformatea) → mitigación:
  template controlado + validar re-parseando la ficha emitida con el mismo esquema.
- **Campos derivados vacíos** (`habitat`, `temporada.meses`) → aceptado: se muestran como
  "Información pendiente"; curaduría humana posterior.
- **Carpeta del banco que no empata con el CSV** (typo en nombre científico) → mitigación:
  el script reporta especies del CSV sin carpeta y carpetas sin especie, sin abortar la
  corrida completa.

## Migration Plan

1. Escribir ADR-0016 (storage de imágenes) y provisionar el bucket en el proyecto GCP
   `chirimoyo` (lectura pública para `optim/`).
2. Implementar el script, el manifiesto de créditos y el loader real + validación.
3. Validar contra el CSV (63) en seco (`--dry-run`, sin subir) para revisar las fichas.
4. Correr una vez con subida; revisar a mano (portadas, créditos, campos derivados vacíos).
5. Rollback: las fichas son archivos versionados (revert por git); los objetos del bucket
   se pueden borrar por prefijo `web/<slug>/` y `raw/<slug>/`.

## Open Questions

- Mecánica exacta del dominio propio (`cdn.chirimoyo.org`): Cloud CDN + LB sobre el bucket
  vs Firebase Hosting, y el registro DNS en Porkbun. A definir en ADR-0016 (no afecta el
  contenido de las fichas).

_Resueltas:_ bucket `catalogo-aves-chirimoyo` (prefijos `raw/` + `web/` + `thumb/`);
servido tras `cdn.chirimoyo.org` con CDN; miniaturas generadas en la migración; manifiesto
`creditos_imagenes.json` provisto y completo; 63 especies en el CSV.
