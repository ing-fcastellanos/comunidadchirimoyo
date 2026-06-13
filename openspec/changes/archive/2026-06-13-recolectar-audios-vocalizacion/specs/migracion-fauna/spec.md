## ADDED Requirements

### Requirement: Mapeo de los campos de audio del CSV a la ficha

El script SHALL leer las columnas `sonido_*` del CSV de origen y, cuando exista una grabación para la especie, emitir un bloque `audios:` con un objeto mapeado así: `archivo` = nombre derivado de `sonido_id` conservando la extensión real del audio (p. ej. `XC123456.mp3`), `credito` = `sonido_autor`, `creditoUrl` = `sonido_pagina`, `licencia` = `sonido_licencia`, `licenciaUrl` = texto legal derivado del nombre de licencia, `tipo` = `sonido_tipo` (`canto`/`llamado`) y `fuenteId` = `sonido_id`. Las columnas `sonido_calidad` y `sonido_pais` NO SHALL escribirse en la ficha (quedan solo en el CSV como registro de procedencia). Cuando falte autor o licencia, el script SHALL emitir lo disponible sin inventar atribución. Cuando no haya grabación, NO SHALL emitir el bloque `audios:`.

#### Scenario: Bloque audios emitido desde el CSV
- **WHEN** una fila del CSV trae las columnas `sonido_*` pobladas
- **THEN** la ficha generada incluye `audios:` con `archivo`, `credito`, `creditoUrl`, `licencia`, `licenciaUrl`, `tipo` y `fuenteId`

#### Scenario: Procedencia fuera de la ficha
- **WHEN** la fila trae `sonido_calidad` y `sonido_pais`
- **THEN** esos valores no aparecen en el frontmatter de la ficha

#### Scenario: Especie sin grabación
- **WHEN** una fila no trae `sonido_url`/`sonido_id`
- **THEN** la ficha se genera sin bloque `audios:`

### Requirement: Pipeline de audio a Google Cloud Storage sin transcodificar

Con `--upload`, el script SHALL descargar cada grabación desde `sonido_url` y subirla **verbatim** (byte a byte, sin pasar por ningún codec, sin recortar ni normalizar) al bucket público `catalogo-aves-chirimoyo` bajo la clave `audio/<slug>/<archivo>`, y una copia cruda al bucket raw privado. El pipeline de audio NO SHALL compartir el procesamiento de imágenes (nada de Pillow/redimensionado). Esta restricción es **obligatoria** para respetar las grabaciones con licencia CC BY-NC-ND (sin derivados), que prohíben editar el audio. Si la descarga de una especie falla, el script SHALL reportarlo de forma visible por especie y NO SHALL inventar ni dejar a medias un objeto en el bucket.

#### Scenario: Audio subido sin modificar
- **WHEN** se procesa la grabación de una especie con `--upload`
- **THEN** existe en el bucket público un objeto bajo `audio/<slug>/<archivo>` byte-idéntico al descargado, y una copia en el bucket raw privado

#### Scenario: Sin transcodificación
- **WHEN** se sube cualquier grabación (incluidas las CC BY-NC-ND)
- **THEN** el archivo no se redimensiona, transcodifica ni recorta

#### Scenario: Descarga fallida visible
- **WHEN** la URL de origen de una especie no responde
- **THEN** el script reporta el fallo de esa especie sin abortar las demás ni subir un objeto parcial

### Requirement: URL de audio compuesta por la app

El esquema de `Audio` SHALL referenciar el audio mediante un único nombre de archivo en `archivo`; la app SHALL componer la URL pública con un helper `audioUrl(slug, archivo)` que usa el prefijo `audio/` y la base `NEXT_PUBLIC_FAUNA_CDN_BASE` (mismo mecanismo de portabilidad que las fotos, ADR-0016 / ADR-0017), de modo que migrar a un CDN/dominio propio no reescriba las fichas.

#### Scenario: URL por prefijo
- **WHEN** la app necesita la URL de un audio
- **THEN** la compone como `<CDN_BASE>/audio/<slug>/<archivo>` sin que la ficha guarde una URL absoluta
