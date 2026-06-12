# content/fauna/_origen/

Datos **de origen** para la migración del catálogo de fauna. **No** son la fuente de verdad final: las fichas finales viven como `content/fauna/<grupo>/<slug>/index.md` (ver el esquema en [content/README.md](../../README.md) y el change `definir-esquema-ficha-fauna`).

## `aves-especies.csv`

Export del catálogo inicial de aves de la Laguna del Chirimoyo (46 especies), normalizado a UTF-8. Lo consume el script de migración de la issue **#10**, que genera una ficha `.md` por especie y descarga las fotos (banco en Google Drive) a la carpeta de cada ficha.

### Mapeo columna → ficha (resumen)

| Columna CSV | Destino en la ficha |
|---|---|
| `nombre_comun`, `nombre_cientifico`, `orden`, `familia`, `genero` | frontmatter (taxonomía) |
| `categoria` | frontmatter `categoria` (gremio ecológico: Vadeadoras, Nadadoras, …) |
| `estatus_migratorio`, `grado_ocurrencia`, `estatus_distribucion` | frontmatter (3 ejes de estatus; mapean 1:1 a los enums) |
| `estatus_conservacion_detallado` | frontmatter `conservacion` (parsear texto → `nom059` + `iucn`) |
| `simbologia_recomendada` | frontmatter `simbologia` (opcional/derivable) |
| `fuentes` | frontmatter `fuentes[]` |
| `descripcion` | cuerpo → `## Descripción` |
| `dieta_ecologia` | cuerpo → `## Dieta y ecología` |
| `reproduccion` | cuerpo → `## Reproducción` |
| `distribucion` | cuerpo → `## Distribución` |
| `claves_apariencia` | cuerpo → `## Cómo identificarla` |
| `claves_zona_observacion` + `claves_fechas_observacion` | cuerpo → `## Dónde y cuándo observarla` (y derivar `habitat`/`temporada.meses` best-effort) |
| `aspectos_adicionales` | cuerpo → `## ¿Sabías que?` |
| `organizacion_taxonomica` | derivable de orden>familia>genero>especie (no se almacena) |
| — (fotos en Drive) | frontmatter `fotos[]` (se cablean en #10) |

Parseo de conservación: `Sin categoría de riesgo`→`ninguno`, `Amenazada`→`a`, `Protección Especial`→`pr`; IUCN `Preocupación Menor`→`LC`.

## Manifiesto de créditos (`creditos_imagenes.json`)

Vive **fuera del repo**, junto al banco de imágenes. Lo consume el script de migración para poblar la atribución de cada `fotos[]`. Estructura: un objeto con metadata (`fuente_principal`, `licencias_incluidas`, `nota`, `total_imagenes`) y una lista `imagenes`, **una entrada por archivo de foto**.

Cada entrada se **indexa por** `(nombre_cientifico, basename(archivo))` y mapea así a la ficha:

| Campo del manifiesto | Destino en `Foto` |
|---|---|
| `atribucion` (o `autor` como respaldo) | `credito` |
| `licencia` | `licencia` |
| `foto_pagina` (o `observacion_url`) | `creditoUrl` |
| `licencia_url` | `licenciaUrl` |
| `archivo` | empareja con el archivo del banco (la foto migrada usa el mismo nombre con extensión `.webp`) |

Si un archivo del banco no figura en el manifiesto, el script marca su `credito` como pendiente y **no inventa** atribución. El emparejamiento banco↔manifiesto↔CSV debe ser exacto (reconciliación 63/63 especies, 503/503 archivos).

## Script de migración

`scripts/migrar-fauna.py` (issue #10). Genera las fichas y, con `--upload`, sube las imágenes al bucket GCS (ver [ADR-0016](../../../docs/decisions/0016-storage-imagenes-fauna-gcs.md)). Es **idempotente**: por defecto no pisa fichas existentes (`--force` regenera). Ejemplos:

```
# Genera/actualiza solo las fichas nuevas (no sube imágenes):
python scripts/migrar-fauna.py

# Sube raw/web/thumb al bucket (requiere google-cloud-storage + credenciales GCP):
python scripts/migrar-fauna.py --upload
```
