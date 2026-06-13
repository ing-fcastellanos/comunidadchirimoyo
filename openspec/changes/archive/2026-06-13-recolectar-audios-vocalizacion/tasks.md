## 1. Esquema y tipos

- [x] 1.1 Extender el interface `Audio` en `apps/catalogo/lib/fauna-schema.ts` con `creditoUrl?`, `licenciaUrl?`, `tipo?: "canto" | "llamado"` y `fuenteId?` (aditivo, todos opcionales)
- [x] 1.2 Confirmar que `apps/catalogo/lib/content.ts` mapea `audios` con los nuevos campos y que `npm run typecheck` pasa
- [x] 1.3 Documentar los campos de audio en `content/README.md` (mapeo desde xeno-canto y que calidad/país quedan fuera del esquema)

## 2. Migración / contenido

- [x] 2.1 En `scripts/migrar-fauna.py`, leer las columnas `sonido_*` del CSV y construir el objeto audio (mapeo: `archivo`=`XC<id>.<ext>`, `credito`=`sonido_autor`, `creditoUrl`=`sonido_pagina`, `licencia`=`sonido_licencia`, `licenciaUrl`=derivado, `tipo`=`sonido_tipo`, `fuenteId`=`sonido_id`)
- [x] 2.2 Emitir el bloque `audios:` en `emit_ficha` (después de `fotos:`), tolerante a ausencia de grabación; NO escribir `sonido_calidad`/`sonido_pais`; no inventar atribución faltante
- [x] 2.3 Añadir el pipeline de subida de audio con `--upload`: descargar `sonido_url` y subir **verbatim** a `audio/<slug>/<archivo>` (bucket público) + copia cruda al bucket raw privado, **sin** Pillow/transcodificación/recorte; reportar fallo por especie sin abortar ni dejar objetos parciales
- [x] 2.4 Regenerar las 63 fichas con `--force` y subir los audios con `--upload`; verificar el bloque `audios:` en varias fichas (incluir una de las 4 CC BY-NC-ND)

## 3. Frontend — sección Vocalización

- [x] 3.1 Añadir helper `audioUrl(slug, archivo)` (prefijo `audio/`, base `NEXT_PUBLIC_FAUNA_CDN_BASE`) junto a `fotoUrl`
- [x] 3.2 Crear la sección **Vocalización** en `apps/catalogo/components/ficha/secciones.tsx` (Server Component, `<audio controls preload="none">`), con rótulo de `tipo` y atribución compuesta `"<credito>, <fuenteId>, xeno-canto.org"` + enlaces a `licenciaUrl`/`creditoUrl`
- [x] 3.3 Insertar la sección en `apps/catalogo/app/aves/[slug]/page.tsx`; omitirla cuando la ficha no tenga `audios`. Verificar que NO queda rastro del canto sintetizado (Web Audio) del handoff
- [x] 3.4 `npm run build` del catálogo: confirmar export estático con la sección renderizada y reproducible sin JS de cliente

## 4. ADR y cierre

- [x] 4.1 Crear `docs/decisions/0017-storage-audio-fauna-gcs.md` (extiende ADR-0016: prefijo `audio/`, copia verbatim, raw privado, reuso de `CDN_BASE`) y actualizar `docs/adr/_index.md`
- [x] 4.2 `openspec validate recolectar-audios-vocalizacion` y verificación final; preparar PR que cierre #32
