# Agregar una ave al catálogo

Guía paso a paso para incorporar **una especie nueva** al catálogo de aves
(`apps/catalogo` → `aves.chirimoyo.org`), reutilizando el pipeline de contenido.
Ejemplo de referencia: la **Oropéndola de Moctezuma** (*Psarocolius montezuma*),
agregada con este mismo proceso.

> El catálogo es **estático**: cada especie es un archivo Markdown
> (`content/fauna/aves/<slug>/index.md`) que el build lee y valida. Las fotos y el
> audio viven en Google Cloud Storage, no en el repo. No hay base de datos ni API
> de búsqueda (ver [ADR-0005](../decisions/0005-catalogo-estatico-anfibios-categoria.md)).

## Panorama

```
1. INVESTIGAR     datos de la especie (taxonomía, conservación, distribución, registro local)
2. FOTOS          descargar-imagenes-inaturalist.py  → banco local + creditos_imagenes.json
3. AUDIO          xeno-canto: localizar grabación CC + metadatos
4. FILA CSV       content/fauna/_origen/aves-especies.csv  (clonar una existente)
5. GENERAR+SUBIR  migrar-fauna.py --upload  → ficha .md + media a GCS
6. CURAR          distribucion (ISO), créditos, estatus local
7. VERIFICAR      npm run build + preview + /busqueda  → commit + PR
```

Lo que es **automatizable** (scripts) vs **editorial** (a mano):

| Automatizado | Editorial (humano) |
|---|---|
| Descargar fotos CC y armar créditos | Redactar las secciones de la ficha |
| Optimizar a WebP y subir a GCS | Decidir el estatus **real** en Chirimoyo |
| Generar la ficha desde el CSV | Curar `distribucion` (qué países pintar) |
| Validar el núcleo del esquema | Verificar que la especie de verdad está ahí |

## Requisitos previos

- **Python 3.12+** con `Pillow`, `PyYAML` y `google-cloud-storage`
  (`pip install pillow pyyaml google-cloud-storage`).
- **gcloud** autenticado con **Application Default Credentials** (no basta `gcloud auth login`):
  ```bash
  gcloud auth application-default login
  ```
- Acceso de escritura al bucket `gs://catalogo-aves-chirimoyo` (proyecto `chirimoyo`).
- El **banco de imágenes** y el **manifiesto de créditos** viven fuera del repo, junto
  a las fotos (por defecto `C:\Users\Frank\Downloads\Img guia aves\`). Los scripts ya
  apuntan ahí por defecto; usa `--banco` / `--creditos` para otra ubicación.

## 1. Investigar los datos de la especie

Reúne, de **fuentes abiertas** (no inventes nada que no puedas respaldar):

- **Taxonomía**: orden, familia, género, autoridad (p. ej. `(Lesson, 1830)`).
- **Conservación**: categoría **NOM-059** (México) e **IUCN**. La API de iNaturalist
  da ambas sin scraping:
  ```bash
  # 1) encontrar el id del taxón
  curl -s "https://api.inaturalist.org/v1/taxa?q=Psarocolius%20montezuma&rank=species" | python -m json.tool
  # 2) leer conservation_statuses del taxón
  curl -s "https://api.inaturalist.org/v1/taxa/68047" | python -m json.tool
  ```
  Para montezuma: NOM-059 = **Protección especial (Pr)**, IUCN = **LC**.
- **Distribución por país**: lista de códigos **ISO 3166-1 alpha-2** (alimenta el mapa).
  Para montezuma: `MX, BZ, GT, HN, NI, CR, PA` (ausente de El Salvador; no llega a
  Sudamérica).
- **Registro local**: ¿se observa de verdad en/cerca del humedal? Esto fija
  `gradoOcurrencia` y el tono de las notas. Si no hay registro firme, documenta la
  presencia como estimada/marginal (como en *Psarocolius wagleri*); si hay
  observación directa, decláralo (montezuma es **residente común** por avistamiento
  recurrente en el humedal).
- **Prosa**: descripción, dieta/ecología, reproducción, distribución, cómo
  identificarla, dónde/cuándo, ¿sabías que? Usa una ficha existente del mismo grupo
  (p. ej. `content/fauna/aves/psarocolius-wagleri/index.md`) como molde.

## 2. Fotos con licencia libre (iNaturalist)

Si no tienes fotos propias, siémbralas desde iNaturalist. **Política de licencias:**
solo **CC0 / CC BY / CC BY-SA** (reutilizables incluso para uso comercial); nunca
"Todos los derechos reservados" ni **ND** (sin derivados), porque el pipeline genera
variantes WebP derivadas. Ver el requisito en el spec `migracion-fauna`.

```bash
python scripts/descargar-imagenes-inaturalist.py \
    --cientifico "Psarocolius montezuma" --comun "Oropéndola de Moctezuma"
```

El script busca observaciones de grado de investigación con esas licencias,
priorizando **Veracruz → México → global**, descarga ~10 fotos a
`<banco>/Psarocolius montezuma/` y **fusiona** los créditos (autor, licencia, URL de
licencia, URL de observación) en `creditos_imagenes.json` **sin tocar** las entradas
de otras especies.

- Si el nombre en iNat difiere del científico curado, usa `--buscar "<sinónimo>"`.
- Revisa las fotos descargadas: que abran, que muestren claramente la especie y que
  la atribución haya quedado completa.

> **Cuidado:** la versión histórica de este script (`descargar_imagenes_faltantes.py`,
> fuera del repo) tenía una lista fija de 16 especies y **reescribía** el manifiesto
> entero. La versión del repo es por-especie y hace **merge**; respáldalo igual antes
> de correrlo (`cp creditos_imagenes.json creditos_imagenes.json.bak`).

## 3. Audio de vocalización (xeno-canto) — opcional

1. Busca una grabación en <https://xeno-canto.org/species/Genus-species>; prefiere
   **calidad A/B**, de **México**, con licencia **CC** (evita ND).
2. Anota: número (`XC…`), autor, tipo (canto/llamado), licencia, país.
   - Las páginas de xeno-canto bloquean scraping (anti-bot) y la API v3 requiere key.
     Si necesitas el **autor** programáticamente, GBIF indexa el dataset:
     ```bash
     curl -s "https://api.gbif.org/v1/occurrence/search?q=XC1069325&limit=5" | python -m json.tool
     # recordedBy = autor, behavior = song/call, country
     ```
3. **Formato:** xeno-canto sirve `.mp3` **o** `.wav`. El pipeline asume `.mp3`; si la
   grabación es WAV, **no** uses las columnas `sonido_*` del CSV — súbela y cabléala a
   mano (ver más abajo), porque el script la nombraría `.mp3` erróneamente.

**Caso mp3** (lo común): llena las columnas `sonido_*` de la fila del CSV y
`migrar-fauna.py --upload` la descarga verbatim y la sube. Columnas:
`sonido_id`, `sonido_url` (`https://xeno-canto.org/<id>/download`),
`sonido_pagina`, `sonido_tipo`, `sonido_autor`, `sonido_licencia`, `sonido_calidad`,
`sonido_pais`.

**Caso wav** (como montezuma, XC1069325): sube el archivo a mano y agrega el bloque
`audios` a la ficha tras generarla (paso 6):
```bash
curl -sL -A "comunidadchirimoyo/1.0" -o XC1069325.wav "https://xeno-canto.org/1069325/download"
gcloud storage cp --content-type=audio/wav XC1069325.wav \
    gs://catalogo-aves-chirimoyo/audio/psarocolius-montezuma/XC1069325.wav
gcloud storage cp --content-type=audio/wav XC1069325.wav \
    gs://catalogo-aves-chirimoyo-raw/psarocolius-montezuma/XC1069325.wav
```
```yaml
audios:
  - archivo: "XC1069325.wav"
    credito: "Homero Bennet"
    tipo: canto
    fuenteId: "XC1069325"
    licencia: "CC BY-NC-SA 4.0"
    creditoUrl: "https://xeno-canto.org/1069325"
    licenciaUrl: "https://creativecommons.org/licenses/by-nc-sa/4.0/"
```
El `<audio>` de la app usa `src` directo con `preload="none"`, así que reproduce WAV
y no lo descarga hasta que el usuario le da play.

Si no hay grabación CC adecuada, **omite** el audio: es un campo opcional.

## 4. Agregar la fila al CSV de origen

Edita `content/fauna/_origen/aves-especies.csv` (47 columnas, todas entre comillas,
terminador CRLF). Lo más seguro es **clonar una fila existente** del mismo grupo (p.
ej. *wagleri*) y ajustar los valores. Mapeos clave que hace `migrar-fauna.py`:

| Columna CSV | Ficha | Notas |
|---|---|---|
| `estatus_conservacion_detallado` | `conservacion.nom059` + `iucn` | `"Protección especial (NOM-059); Preocupación Menor (UICN)"` → `pr` + `LC` |
| `estatus_migratorio` / `grado_ocurrencia` / `estatus_distribucion` | enums | `Residente` / `Común` / `Nativa` |
| `categoria` | gremio | paseriformes arborícolas → `Terrestres` |
| `forma`,`tamano`,`colores`,`donde` | búsqueda visual | vocabularios cerrados (ver `migrar-fauna.py`) |
| `tamano_cm`,`peso_g` | `medidas` | rango `38-50` → `[38, 50]` |
| `descripcion`,`dieta_ecologia`,… | secciones `##` | prosa |

El **slug** se deriva del nombre científico (`Psarocolius montezuma` →
`psarocolius-montezuma`); debe ser único.

## 5. Generar la ficha y subir la media

Para **no reprocesar** las 60+ especies existentes, corre el migrador con un CSV
temporal que contenga solo la fila nueva:

```bash
# extraer header + la fila nueva a un CSV temporal
python - <<'PY'
import csv
rows=list(csv.DictReader(open('content/fauna/_origen/aves-especies.csv',encoding='utf-8')))
mz=[r for r in rows if 'montezuma' in r['nombre_cientifico'].lower()]
with open('_solo.csv','w',encoding='utf-8',newline='') as f:
    w=csv.DictWriter(f,fieldnames=list(rows[0]),quoting=csv.QUOTE_ALL,lineterminator='\r\n')
    w.writeheader(); w.writerows(mz)
PY

# dry-run (genera la ficha, sin subir):
python scripts/migrar-fauna.py --csv _solo.csv

# subida real (optimiza WebP + sube web/thumb/raw a GCS):
python scripts/migrar-fauna.py --csv _solo.csv --upload

rm _solo.csv
```

El reporte debe decir: ficha generada (o saltada si ya existe), N objetos subidos,
sin errores de núcleo ni de atribución. `migrar-fauna.py` es **idempotente**: no pisa
una ficha existente salvo `--force`, así que las ediciones manuales del paso 6 se
conservan aunque vuelvas a correr `--upload`.

## 6. Curar la ficha generada

Edita `content/fauna/aves/<slug>/index.md`:

- **`distribucion`**: agrega el bloque con los códigos ISO del paso 1 y unas `notas`
  honestas (no afirmes rangos finos sin respaldo). Ejemplo:
  ```yaml
  distribucion:
    residente: ["MX", "BZ", "GT", "HN", "NI", "CR", "PA"]
    notas: "Residente de tierras bajas del Caribe/Golfo… En Chirimoyo (~1230 m) es
            residente y visitante regular, en el extremo altitudinal de la especie."
  ```
- **Créditos**: para fotos **CC0**, iNaturalist deja la atribución como
  "no rights reserved" (sin nombre); por cortesía, reemplázala por el autor real
  (que sí está en el manifiesto). Verifica que ninguna foto quedó como
  "Crédito pendiente".
- **Audio WAV**: agrega el bloque `audios` (paso 3) si aplica.
- **Estatus**: confirma que `gradoOcurrencia`/`estatusMigratorio` reflejan el registro
  local real.

## 7. Verificar y entregar

```bash
cd apps/catalogo
npm install        # si es un worktree nuevo sin node_modules
npm run build      # valida el núcleo de la ficha; falla si falta algo
```

Levanta el preview y verifica:

- `/aves/<slug>`: la ficha renderiza, las fotos cargan desde GCS, el mapa pinta los
  países curados, el audio reproduce, sin errores de consola.
- `/busqueda`: la especie aparece y es filtrable (categoría, color, etc.).

Luego commitea **solo el contenido** (`content/fauna/aves/<slug>/` + la fila del CSV)
y abre un PR a `main`. Si seguiste el flujo OpenSpec, incluye también el change
archivado.

```bash
git add content/fauna/aves/<slug>/ content/fauna/_origen/aves-especies.csv
git commit -m "feat(fauna): agregar <Nombre> (<Especie>)"
```

## Referencias

- Esquema de la ficha: `content/README.md` y `apps/catalogo/lib/fauna-schema.ts`.
- Pipeline de migración: [`scripts/migrar-fauna.py`](../../scripts/migrar-fauna.py) y
  el spec [`migracion-fauna`](../../openspec/specs/migracion-fauna/spec.md).
- Descarga de fotos: [`scripts/descargar-imagenes-inaturalist.py`](../../scripts/descargar-imagenes-inaturalist.py).
- Decisiones: [ADR-0005](../decisions/0005-catalogo-estatico-anfibios-categoria.md)
  (catálogo estático), [ADR-0016](../decisions/0016-storage-imagenes-fauna-gcs.md)
  (imágenes en GCS), [ADR-0017](../decisions/0017-storage-audio-fauna-gcs.md)
  (audio verbatim), [ADR-0018](../decisions/0018-mapa-distribucion-geografia-real.md)
  (mapa de distribución).
- Ejemplo completo: `content/fauna/aves/psarocolius-montezuma/index.md` (esta guía).
