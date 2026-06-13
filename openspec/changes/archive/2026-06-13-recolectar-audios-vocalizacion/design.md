## Context

La ficha de detalle (`apps/catalogo/app/aves/[slug]/page.tsx` + `components/ficha/secciones.tsx`) renderiza hero, datos rápidos y secciones narrativas, pero **omite Vocalización**: el handoff la prototipó con un canto sintetizado (Web Audio), descartado por no ser dato real. El esquema (`fauna-schema.ts`) ya previó `audios?: Audio[]` con `{ archivo, credito, descripcion?, licencia? }`, pero ese objeto se diseñó **calcado de las fotos**, asumiendo `archivo` = nombre en bucket.

Ahora existe el insumo: una cosecha de xeno-canto con grabación para las 63 especies, con 8 campos por especie (`sonido_id`, `sonido_url`, `sonido_pagina`, `sonido_tipo`, `sonido_autor`, `sonido_licencia`, `sonido_calidad`, `sonido_pais`) en `content/fauna/_origen/aves-especies.csv`. Las licencias son CC no comercial: 58 BY-NC-SA 4.0, 1 BY-NC-SA 3.0, 4 **BY-NC-ND 4.0** (sin derivados).

Restricciones duras: catálogo 100% estático (ADR-0005), export estático sin optimizador (ADR-0014), imágenes en GCS servidas por URL pública del bucket vía `NEXT_PUBLIC_FAUNA_CDN_BASE` (ADR-0016), i18n-ready sin traducir (ADR-0011).

## Goals / Non-Goals

**Goals:**
- Servir el canto real de cada especie en la ficha de detalle, con atribución correcta y enlazable.
- Reusar el patrón de storage y de atribución ya establecido para fotos (mínima superficie nueva).
- Mantener el export estático (sin JS cliente para reproducir) y la tolerancia a fichas sin audio.
- Cumplir las licencias CC-NC, en particular las 4 ND (sin derivados).

**Non-Goals:**
- Procesar/normalizar/transcodificar/recortar audio (lo prohíben las ND; se evita para todas por simplicidad y seguridad legal).
- Reproductor con estilo propio, waveform o multipista: `<audio controls>` nativo basta.
- Almacenar la `leyenda_sonido` del origen (se compone en la UI).
- Llevar `sonido_calidad` / `sonido_pais` al esquema de la ficha (quedan en el CSV).
- Migrar audios de anfibios/reptiles (futuro; el diseño debe tolerarlo, no cubrirlo).

## Decisions

### D1 — Hospedar en GCS verbatim, no hot-link a xeno-canto
Se descarga cada `sonido_url` y se sube **sin tocar** al bucket público `catalogo-aves-chirimoyo` bajo `audio/<slug>/<archivo>`, con copia cruda en el bucket raw privado. La app compone la URL con un helper `audioUrl(slug, archivo)` análogo a `fotoUrl`, reusando `NEXT_PUBLIC_FAUNA_CDN_BASE`.

- **Por qué:** durabilidad (no depende de que XC mantenga la URL), export autocontenido, coherencia con ADR-0016. Redistribuir una copia **verbatim** es lícito bajo las tres variantes (NC + atribución; las ND solo prohíben derivados, no la copia exacta).
- **Alternativas:** *hot-link a XC* — cero storage pero frágil y sirve desde dominio ajeno; *híbrido bucket + url de respaldo* — más campos para poca ganancia. Descartadas en explore.
- **Implicación crítica:** a diferencia de las fotos (que se redimensionan con Pillow), el audio se sube **byte a byte sin pasar por ningún codec/recorte**. El nombre del archivo se deriva del id: `XC<digits>.<ext>` conservando la extensión real de `sonido_url` (xeno-canto sirve mayormente `.mp3`).

### D2 — Extender el objeto `Audio` de forma aditiva
`Audio` pasa a `{ archivo, credito, descripcion?, licencia?, creditoUrl?, licenciaUrl?, tipo?, fuenteId? }`:
- `creditoUrl` = `sonido_pagina` (página de la grabación en XC, atribución enlazable TASL).
- `licenciaUrl` = texto legal de la licencia (derivado del nombre de licencia).
- `tipo` = `sonido_tipo` (`"canto" | "llamado"`).
- `fuenteId` = `sonido_id` (`XC…`), insumo de la fórmula de crédito.

Es el mismo movimiento aditivo que las fotos hicieron con `creditoUrl`/`licenciaUrl` (ADR-0016). `audios` sigue opcional → no rompe fichas existentes ni el typecheck.

### D3 — Leyenda renderizada, no almacenada
La atribución se compone en la UI: **`<credito>, <fuenteId>, xeno-canto.org`** + enlace a `licenciaUrl` (texto de la licencia). Una sola fuente de verdad, traducible (ADR-0011). La `leyenda_sonido` del origen se ignora.

### D4 — Reproductor nativo `<audio controls>`
Sección **Vocalización** como Server Component que emite `<audio controls preload="none" src={audioUrl(...)}>`. Sin `"use client"`, compatible con el export estático (ADR-0014). Si `tipo` existe, se rotula ("Canto" / "Llamado"). Si la ficha no trae `audios`, la sección no se renderiza.

### D5 — Nuevo ADR-0017 que extiende (no edita) ADR-0016
Los ADR son inmutables. ADR-0017 documenta el storage de audio (prefijo `audio/`, copia verbatim, raw privado, reuso de `CDN_BASE`) referenciando 0016. Se actualiza `docs/adr/_index.md`.

### D6 — Metadatos de procedencia fuera del esquema
`sonido_calidad` (A/B) y `sonido_pais` se quedan en el CSV como registro de la cosecha; no entran a la ficha ni a la UI. Si más adelante se quiere un sello "grabado en México", se añade de forma aditiva.

## Risks / Trade-offs

- **Licencia ND violada por procesamiento accidental** → el pipeline de audio NO comparte código con el de imágenes (nada de Pillow/transcodificación); sube el stream original tal cual. Documentado en ADR-0017 y en la spec de migración.
- **URL de XC caída al momento de descargar** → el script debe fallar de forma visible por especie (no inventar), permitiendo reintentar; las fichas se generan igual (el bloque `audios:` viene del CSV), solo faltaría el objeto en el bucket.
- **Atribución incompleta** (autor/licencia faltante en el CSV) → emitir el bloque con lo disponible y marcar lo que falte, sin inventar (mismo principio que las fotos).
- **Peso/ancho de banda** → `preload="none"` evita descargar el audio hasta que el usuario lo pida; egress de GCS es bajo para 63 archivos.
- **Servir desde `storage.googleapis.com`** (sin dominio de marca) → trade-off ya aceptado en ADR-0016 por costo casi nulo.

## Migration Plan

1. Extender `Audio` en `fauna-schema.ts` + tipos en `content.ts` (aditivo) y `audioUrl` helper.
2. Extender `scripts/migrar-fauna.py`: leer columnas `sonido_*`, emitir `audios:`, y vía `--upload` descargar + subir verbatim a `audio/` (público) y raw privado.
3. Correr la migración con `--force` para repoblar las 63 fichas y `--upload` para los audios.
4. Añadir la sección Vocalización en el detalle (helper + componente + page).
5. ADR-0017 + actualizar `_index.md`. Validar `openspec validate` y `npm run typecheck`/`build` del catálogo.

**Rollback:** `audios` es opcional y la sección es tolerante; revertir el frontend deja las fichas válidas. Los objetos en el bucket no estorban si no se referencian.
