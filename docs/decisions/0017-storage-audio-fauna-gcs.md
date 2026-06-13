# ADR-0017 — Storage de audio de fauna en GCS (verbatim), servido por URL pública del bucket

- **Estado:** Accepted
- **Fecha:** 2026-06-12
- **Decisores:** @ing-fcastellanos
- **Issue:** #32 (recolectar y aplicar audios de vocalización por especie)

## Contexto

La ficha de detalle (#13) omitía la sección de **Vocalización** porque no había audios
reales (el handoff la prototipó con un canto sintetizado, descartado). Ya existe el insumo:
una cosecha de **xeno-canto con grabación para las 63 especies de aves** (61 calidad A, 2 B;
47 de México), con licencias Creative Commons **no comerciales**: 58 `CC BY-NC-SA 4.0`,
1 `CC BY-NC-SA 3.0` y **4 `CC BY-NC-ND 4.0`** (sin derivados).

[ADR-0016](0016-storage-imagenes-fauna-gcs.md) ya resolvió el storage de **imágenes** de
fauna en GCS servidas por URL pública del bucket. Los ADR son inmutables, así que el alcance
de audio se decide aquí, extendiendo ese patrón. La pregunta abierta era doble: **(a)** dónde
viven los audios (¿hospedar o enlazar a xeno-canto?) y **(b)** cómo respetar las licencias,
en particular las 4 ND que prohíben editar/recortar el audio.

## Decisión

Los audios de fauna se **hospedan en GCS**, reusando los buckets de ADR-0016:

| Bucket | Acceso | Clave | Contenido |
|---|---|---|---|
| `catalogo-aves-chirimoyo` | **público** | `audio/<slug>/<archivo>` | grabación servida en la ficha |
| `catalogo-aves-chirimoyo-raw` | **privado** | `<slug>/<archivo>` | copia de archivo/respaldo |

- **Copia VERBATIM, sin procesar.** A diferencia de las imágenes (que se redimensionan a
  WebP con Pillow), el audio se sube **byte a byte**, sin transcodificar, normalizar ni
  recortar. Esto es **obligatorio** para las grabaciones `CC BY-NC-ND` (sin derivados): editar
  el audio violaría la licencia. Por simplicidad y seguridad legal, **ninguna** grabación se
  procesa (tampoco las `BY-NC-SA`). Redistribuir una copia exacta es lícito bajo las tres
  variantes (NC + atribución).
- **Servido por URL pública del bucket**, igual que las imágenes: sin Load Balancer, sin
  Cloud CDN, sin dominio propio. La app compone la URL con `audioUrl(slug, archivo)` usando la
  base `NEXT_PUBLIC_FAUNA_CDN_BASE` (misma de ADR-0016), de modo que migrar a un CDN/dominio
  propio en el futuro no reescribe las fichas.
- **Nombre del archivo** derivado del id de la fuente: `XC<id>.mp3` (xeno-canto sirve mp3 en
  `…/<id>/download`). Si una descarga revela otro content-type, el script de migración lo
  reporta como aviso por especie.
- **Atribución renderizada, no almacenada:** la ficha guarda campos estructurados (`credito`,
  `creditoUrl`, `licencia`, `licenciaUrl`, `tipo`, `fuenteId`); la leyenda
  `"<credito>, <fuenteId>, xeno-canto.org"` se compone en la UI (i18n-ready, ADR-0011).
- **Metadatos de procedencia fuera del esquema:** la calidad (A/B) y el país de la grabación
  se quedan en el CSV de origen como registro de la cosecha; no entran a la ficha ni a la UI.

## Alternativas consideradas

- **Enlazar (hot-link) directo a `xeno-canto.org`:** cero storage y trivial, pero **frágil**
  (si XC reorganiza/borra la URL, la ficha queda rota) y reproduce desde un dominio ajeno.
  Descartada: el catálogo debe ser autocontenido y durable (ethos de ADR-0004/0005).
- **Híbrido (hospedar + guardar la URL de XC como respaldo):** más campos en el esquema para
  poca ganancia. Descartada.
- **Transcodificar/normalizar el audio a un formato uniforme:** mejoraría consistencia pero
  **violaría las licencias ND**. Descartada de raíz.
- **Dominio propio + Cloud CDN:** mismo costo (~$18 USD/mes de base) ya descartado en ADR-0016.

## Consecuencias

### Positivas

- Catálogo autocontenido y durable; no depende de la disponibilidad de xeno-canto.
- Coherente con el patrón de imágenes (ADR-0016): mismos buckets, misma base `CDN_BASE`,
  mismo modelo de portabilidad.
- Compatible con el export estático (ADR-0014): la sección es un `<audio controls>` nativo
  hacia una URL pública, sin JavaScript de cliente.
- Cumple las licencias CC-NC, incluidas las 4 ND, al no derivar el audio.

### Negativas

- Acoplamiento operativo a GCP para publicar audio nuevo (se corre el script de migración con
  `--upload`, que requiere ADC).
- Los audios no se versionan junto al texto; su "fuente de verdad" es el bucket + el CSV de
  origen (igual que las imágenes).
- Sin dominio de marca ni caché administrada para el audio (se acepta a cambio de costo casi
  nulo, como en ADR-0016).
- **Extensión `.mp3` asumida aunque ~46% de las grabaciones son WAV.** El endpoint
  `…/<id>/download` de xeno-canto entrega el original, que en 29 de 63 casos es WAV; como la
  ficha se genera offline (sin conocer el formato real), todas se nombran `XC<id>.mp3`. La
  reproducción funciona igual: GCS sirve el `Content-Type` correcto (`audio/wav`) y el
  navegador lo respeta pese al nombre. Se acepta el nombre inexacto a cambio de no reprocesar
  el bucket. Si en el futuro se quiere corregir, derivar la extensión del `Content-Type` al
  descargar y renombrar los 29 objetos.

### Neutras

- El esquema de `Audio` (#9) se extiende de forma **aditiva** con `creditoUrl`, `licenciaUrl`,
  `tipo` y `fuenteId` (cambio compatible; `audios` sigue opcional).

## Plan de revisión

Reconsiderar un dominio propio + CDN si el tráfico crece (igual que ADR-0016). Si en el futuro
se necesita normalizar audio (volumen, formato), hacerlo **solo** sobre grabaciones cuya
licencia lo permita (no ND) y bajo un nuevo ADR.

## Referencias

- [ADR-0016](0016-storage-imagenes-fauna-gcs.md) (storage de imágenes, que este ADR extiende),
  [ADR-0004](0004-contenido-en-repo.md), [ADR-0005](0005-catalogo-estatico-anfibios-categoria.md),
  [ADR-0014](0014-catalogo-export-estatico.md), [ADR-0011](0011-diseno-i18n.md).
- Change OpenSpec `recolectar-audios-vocalizacion`. `scripts/migrar-fauna.py`,
  `apps/catalogo/lib/fauna-schema.ts` (`audioUrl`, `Audio`), `content/fauna/_origen/`.
