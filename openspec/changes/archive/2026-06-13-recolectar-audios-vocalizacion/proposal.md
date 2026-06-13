## Why

La página de detalle de especie (#13) omite la sección de **Vocalización** porque el handoff de diseño la prototipó con un canto **sintetizado** (Web Audio), que no es dato real de la especie y no es apropiado para una guía seria. Ya tenemos el insumo que faltaba: una cosecha de **xeno-canto con grabación para las 63 especies** (61 calidad A, 2 B; 47 de México), todas con licencia Creative Commons no comercial — compatible con el ethos digital/no comercial del proyecto. Toca incorporarlas con atribución correcta y habilitar la sección.

Sub-dominios afectados: **aves** (esquema de ficha, migración, detalle) y **foundation** (nuevo ADR de storage de audio).

## What Changes

- **Esquema de ficha:** se extiende el objeto `Audio` de forma **aditiva** con `creditoUrl?`, `licenciaUrl?`, `tipo?` (`"canto" | "llamado"`) y `fuenteId?` (el id `XC…`). Se conservan `archivo`, `credito`, `descripcion?`, `licencia?`. No es breaking: `audios` sigue opcional.
- **Migración / contenido:** el script lee las 8 columnas `sonido_*` del CSV de origen y emite el bloque `audios:` en cada ficha. Con `--upload`, **descarga el audio y lo sube VERBATIM** (sin transcodificar, sin recortar) al bucket público con prefijo `audio/<slug>/<archivo>` y copia cruda al bucket raw privado.
- **Detalle:** nueva sección **Vocalización** con reproductor `<audio controls>` nativo (sin JS cliente, fiel al export estático). **Reemplaza** el canto sintetizado del handoff. La leyenda de atribución se **renderiza** desde los campos (`"<credito>, <fuenteId>, xeno-canto.org"` + enlace a licencia) — no se almacena. Tolerante: ficha sin `audios` → sección oculta.
- **ADR nuevo:** decisión de storage de audio en GCS, que **extiende** ADR-0016 (los ADR son inmutables, no se edita el 0016).

### No-goals

- **No** se procesa/normaliza/transcodifica el audio (crítico legal: 4 grabaciones son CC BY-NC-ND, prohíben derivados). Solo copia verbatim.
- **No** se almacena la `leyenda_sonido` del origen; se compone en la UI (i18n-ready, ADR-0011).
- `sonido_calidad` (A/B) y `sonido_pais` **no** entran al esquema de la ficha; se quedan en el CSV como registro de procedencia.
- **No** se introduce reproductor con estilo/JS ni waveform: `<audio>` nativo basta para el export estático (ADR-0014).

## Capabilities

### New Capabilities

_(ninguna — todo son modificaciones de capabilities existentes)_

### Modified Capabilities

- `esquema-ficha-fauna`: el objeto `Audio` extiende sus campos (`creditoUrl`, `licenciaUrl`, `tipo`, `fuenteId`); se aclara qué metadatos de procedencia (`calidad`, `pais`) quedan fuera del esquema.
- `migracion-fauna`: el script lee las columnas `sonido_*` y emite `audios:`; con `--upload` descarga y sube el audio verbatim al prefijo `audio/`.
- `catalogo-detalle`: la ficha de detalle muestra la sección Vocalización con reproductor nativo y atribución renderizada; tolerante a ausencia de audio.

## Impact

- **Código:** `apps/catalogo/lib/fauna-schema.ts` (interface `Audio`), `apps/catalogo/lib/content.ts` (lectura de `audios`), `apps/catalogo/lib/ficha.ts` + `apps/catalogo/components/ficha/secciones.tsx` + `apps/catalogo/app/aves/[slug]/page.tsx` (sección Vocalización + helper `audioUrl`), `scripts/migrar-fauna.py` (columnas `sonido_*`, emisión + upload de audio).
- **Contenido:** bloque `audios:` en las 63 fichas `content/fauna/aves/*/index.md`.
- **Infra:** bucket `catalogo-aves-chirimoyo` (prefijo `audio/`) + `catalogo-aves-chirimoyo-raw`; reusa `NEXT_PUBLIC_FAUNA_CDN_BASE`.
- **Docs:** nuevo `docs/decisions/00NN-storage-audio-fauna-gcs.md` + actualizar `docs/adr/_index.md`.
- **Issue:** cierra #32.
