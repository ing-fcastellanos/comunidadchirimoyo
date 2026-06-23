## Why

El esquema de ficha ya es group-aware (#87, PR #97) y el humedal tiene ~12 especies de anfibios y reptiles registradas con CSV, banco de fotos curado y cantos. Falta convertirlas a fichas del catálogo. El script `scripts/migrar-fauna.py` ya hace toda la migración de aves (CSV→ficha, pipeline de imágenes/audio a GCS, manifiesto de créditos, validación, idempotencia); este cambio lo **generaliza a group-aware** para reutilizarlo en vez de duplicarlo, y produce las fichas de herpetofauna.

## What Changes

- Extender `scripts/migrar-fauna.py` a **group-aware** (sin forkear), con 6 adaptaciones acotadas:
  1. **`grupo` por fila** desde la columna `grupo` del CSV (`Anfibio`→`anfibios/`, `Reptil`→`reptiles/`); el CSV de aves no tiene esa columna → default `aves`. Salida a `content/fauna/<grupo>/<slug>/`.
  2. **`presencia` → `estatusMigratorio`**: el CSV de herps no trae `estatus_migratorio`; usar `presencia` (`Residente`→`residente`).
  3. **Remap de `categoria`** a la clase taxonómica (#87): `Sapo`/`Rana`→`Anuros`, `Salamandra`→`Salamandras`, `Lagarto`→`Lagartijas`, `Serpiente`→`Serpientes`, `Tortuga`→`Tortugas`.
  4. **Omitir `forma`/`donde`** en herpetofauna (decisión C de #87; reventarían el vocabulario cerrado de aves). `tamano`, `colores` y `featured` sí migran.
  5. **`talla_criterio` → `medidas.criterio`** (campo añadido en #87).
  6. **Audio**: derivar la **extensión real** (`.m4a`/`.mpga`/`.mp3`) de `sonido_url` en vez del `.mp3` hardcodeado (los cantos de herps salen de iNaturalist en formatos mixtos). Afecta el campo `archivo` de la ficha.
- **Generar las 12 fichas** (8 anfibios + 4 reptiles) en `content/fauna/{anfibios,reptiles}/<slug>/index.md`, con `audios:` (de las columnas `sonido_*`) y `fotos:` con crédito desde el manifiesto.
- **Subir fotos y audio a GCS** (`--upload`): variantes raw/web/thumb y los cantos verbatim.
- **Curar la portada por especie**: reusar `apps/catalogo/print/photo-selections.json` + `scripts/aplicar-foto-principal.mjs` para que `fotos[0]` sea la foto elegida (no la primera alfabética).
- Copiar el CSV de origen a `content/fauna/_origen/anfibios-reptiles-especies.csv` (versionado, como el de aves). Manifiesto y banco de fotos quedan externos.

## Capabilities

### New Capabilities

_(ninguna)_

### Modified Capabilities

- `migracion-fauna`: el script de migración deja de ser exclusivo de aves y se vuelve group-aware (grupo por fila, `presencia` como eje de presencia, remap de categoría por grupo, omisión de `forma`/`donde` en herpetofauna, `medidas.criterio`, extensión de audio real). Las garantías existentes (idempotencia, slug, pipeline de imágenes, manifiesto, validación de núcleo, audio verbatim) se conservan.

## Impact

- **Sub-dominio afectado:** `aves` (`apps/catalogo`, `content/`, `scripts/`). No toca `sitio`, `voluntarios`, `api` ni `foundation`.
- **Código/datos:** `scripts/migrar-fauna.py` (group-aware); `content/fauna/_origen/anfibios-reptiles-especies.csv` (nuevo); `content/fauna/anfibios/*` y `content/fauna/reptiles/*` (12 fichas nuevas); `apps/catalogo/print/photo-selections.json` (portadas de herps). Bucket GCS `catalogo-aves-chirimoyo` (+`-raw`): nuevos objetos `web|thumb|raw|audio/<slug>/`.
- **Dependencias:** requiere #87 (esquema group-aware, PR #97). La subida (`--upload`) requiere credenciales GCP (ADC) y los buckets existentes.
- **Verificación:** `next build` del catálogo genera las nuevas páginas de detalle; las 64 fichas de aves no se tocan.

### No-goals

- **No** se identifican ni incorporan las fotos de `fotos/_por_confirmar/` (eso es #90; ya se excluyen solas de la migración).
- **No** se construye el filtro por grupo en la búsqueda (#85) ni las rutas `/[grupo]/[slug]` (#84).
- **No** se migra contenido de insectos/mamíferos (grupos futuros).
- **No** se descarta el split con #89: #88 sube el audio, #89 verifica la reproducción en la ficha.
