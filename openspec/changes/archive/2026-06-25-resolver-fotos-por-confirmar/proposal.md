## Why

La carpeta de origen de herpetofauna tiene `fotos/_por_confirmar/` con 35 imágenes sin especie asignada (#90, parte de #16). Hay que identificarlas o descartarlas antes de publicarlas, para no atribuir mal una especie, y solo subir las que tengan **identificación y créditos confirmados**. El autor (que conoce el humedal) ya las identificó y aportó créditos; estas fotos son del **humedal real** (no genéricas de iNaturalist), así que aportan documentación local auténtica a las fichas.

Sub-dominio afectado: **aves** (catálogo de fauna). Sin impacto en sitio, voluntarios ni api.

## What Changes

- **Resolución registrada** de las 35 fotos en el manifiesto `_manifiesto_fotos.csv` (la identificación del autor **prevalece** sobre las conjeturas de baja confianza del manifiesto): **21 asignadas** a especie, **12 descartadas** (no son especies del catálogo: mojarra, ardilla, insecto, comadreja, crustáceo), **2 ignoradas** (incierta / mala foto). Lo no resuelto queda fuera (no se adivina).
- **Publicación de las 21 fotos confirmadas** en **7 fichas**, con crédito comunitario **CC0**:
  - Any Isabel Pérez Santiago (fotos `DSCN…`), Diana Isela Angeles Solares (`WhatsApp…`), Francisco Castellanos (`IMG_…`).
  - Reparto: Lithobates berlandieri (6), Tlalocohyla picta (5), Smilisca baudinii (4), Trachemys venusta (2), Eleutherodactylus cystignathoides (2), Incilius valliceps (1), Bolitoglossa platydactyla (1).
- **Ingesta quirúrgica, SIN re-migrar:** mover las fotos al banco por especie, registrar créditos en `creditos_imagenes.json`, procesar (web/thumb/raw) y subir a GCS, y **añadir las entradas a `fotos[]` de las 7 fichas a mano** — sin regenerar la ficha (re-correr `migrar-fauna.py` borraría la `distribucion.residente` de #93, que vive solo en el MD, y otros campos MD-only).
- **Portadas:** las nuevas fotos se **añaden** a `fotos[]` sin alterar las portadas curadas de #88; se recomienda promover la de **Bolitoglossa platydactyla** a portada (es la única salamandra y hoy depende de iNat).
- **PDF regenerado** (el banco local ya tendrá las fotos).

## Capabilities

### New Capabilities
_(ninguna)_

### Modified Capabilities
- `migracion-fauna`: nuevo requisito de **resolución de `_por_confirmar` e ingesta de fotos locales**: registrar la identificación/descartes en el manifiesto (la del autor prevalece), publicar solo lo identificado con créditos confirmados (comunidad, CC0), y **añadir las fotos a las fichas sin regenerarlas** (ingesta incremental que preserva los campos MD-only de cambios posteriores como `distribucion` de #93).

## Impact

- **Contenido (aves):** `fotos[]` de 7 fichas `content/fauna/{anfibios,reptiles}/<slug>/index.md` (entradas nuevas); posible `photo-selections.json` (portada de Bolitoglossa).
- **Origen (banco del mantenedor):** 21 fotos movidas de `_por_confirmar/` a `fotos/<Nombre científico>/`; `_manifiesto_fotos.csv` y `creditos_imagenes.json` actualizados.
- **GCS:** 21 fotos × 3 variantes subidas al bucket — **paso manual del mantenedor** (credenciales; ADR-0009/0016).
- **Tooling:** un modo «solo fotos» (procesa/sube imágenes y NO regenera fichas) para `migrar-fauna.py`, o un script focalizado equivalente.
- **Esquema/datos:** sin cambios de esquema; las fichas conservan todo su contenido previo.

## No-goals

- **No** re-migrar las fichas desde el CSV (preserva `distribucion` de #93 y demás ediciones MD-only).
- **No** publicar las 12 descartadas ni las 2 ignoradas (quedan fuera; solo registradas).
- **No** adivinar identificaciones: lo no resuelto no se publica.
- **No** cambiar el esquema de la ficha ni el pipeline de imágenes existente (se reusa `optimizar()` y la convención GCS).
