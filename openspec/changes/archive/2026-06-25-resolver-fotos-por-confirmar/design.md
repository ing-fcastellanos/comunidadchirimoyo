## Context

`fotos/_por_confirmar/` (banco del mantenedor) tiene 35 imágenes. El `_manifiesto_fotos.csv` traía IDs tentativas de **baja confianza** (a veces erróneas: «Salamandra» para lo que es Lithobates, «Iguana» para una comadreja). El autor las revisó y aportó identificación + créditos. El pipeline de publicación (`migrar-fauna.py`) genera `fotos[]` desde `creditos_imagenes.json` (índice por especie+basename) y procesa imágenes con `optimizar()` (PIL → WebP web/thumb) subiéndolas a GCS con `--upload`; **pero regenera la ficha entera desde el CSV**, lo que borraría la `distribucion.residente` de #93 (MD-only).

## Goals / Non-Goals

**Goals:**
- Registrar la resolución (asignadas/descartadas/ignoradas) con la identificación del autor como autoridad.
- Publicar las 21 confirmadas en sus fichas con crédito comunitario CC0, **sin regenerar** las fichas.
- Reusar el pipeline de imágenes (optimización + GCS) sin su parte de emisión de ficha.

**Non-Goals:**
- Re-migrar; publicar descartes/ignoradas; cambiar el esquema.

## Decisions

### Decisión 1 — Resolución completa (autoridad del autor)

```
PUBLICAR (21) → 7 fichas                          CRÉDITO (todas CC0)
  Lithobates berlandieri (6): DSCN2658, DSCN5388,   DSCN…     Any Isabel Pérez Santiago
    DSCN5402, WA·43.55(1), WA·43.55(3), WA·43.55     WhatsApp… Diana Isela Angeles Solares
  Tlalocohyla picta (5): DSCN5386, DSCN5394,         IMG_…     Francisco Castellanos
    DSCN6663, WA·43.54(1), WA·43.54
  Smilisca baudinii (4): WA·43.47(1), (2), (3), WA·43.47
  Trachemys venusta (2): DSCN0214, DSCN0216
  Eleutherodactylus cystignathoides (2): WA·42.21(1), WA·42.21
  Incilius valliceps (1): WA·42.37(2)
  Bolitoglossa platydactyla (1): IMG_20260616_211650

DESCARTAR (12): DSCN0204/0206 (mojarra), DSCN0690_1 (ardilla),
  DSCN5671/5674 (insecto), DSCN6657/6658/6659/6660 (comadreja),
  DSCN7128/7131 (crustáceo), WA·42.37 (insecto)

IGNORAR (2): WA·43.49 (incierta), WA·43.52 (Tlalocohyla, mala foto)
```

La identificación del autor **prevalece** sobre el manifiesto donde difieran. Las 12 + 2 quedan registradas como descartadas/ignoradas y **no** se publican.

### Decisión 2 — Ingesta quirúrgica (sin re-migrar)

Re-correr `migrar-fauna.py` regenera la ficha desde el CSV y perdería `distribucion.residente` (#93, MD-only). Por eso la ingesta es incremental:

```
  1. Mover las 21 fotos: _por_confirmar/ → fotos/<Nombre científico>/
  2. creditos_imagenes.json: añadir 21 entradas a `imagenes[]`
     { archivo, nombre_cientifico, autor/atribucion, licencia: "CC0", licencia_url }
  3. Procesar + subir a GCS (web/thumb/raw) reusando optimizar() y la convención
     de objetos web/<slug>/… · thumb/<slug>/… · raw/<slug>/…   ← modo «solo fotos»
  4. Añadir entradas a fotos[] de las 7 fichas A MANO (append), preservando el
     resto de la ficha (incl. distribucion de #93)
  5. Regenerar PDFs (el banco local ya tiene las fotos)
```

**Modo «solo fotos»:** se añade a `migrar-fauna.py` un flag (p. ej. `--solo-fotos <slugs>`) que procesa/sube imágenes y **omite** la escritura de fichas; alternativamente un script focalizado que reusa `optimizar()`. No reescribe ninguna ficha.

### Decisión 3 — Convención de nombre y entrada `fotos[]`

Las fichas referencian el archivo de la variante **web** (p. ej. `web_Trachemys_venusta_<id>.webp`). Para fotos locales el `<id>` se deriva del basename original (p. ej. `web_Bolitoglossa_platydactyla_IMG_20260616_211650.webp`). La entrada de `fotos[]` es **más simple** que las de iNat (sin `creditoUrl`/página): `{ archivo, credito, alt, licencia: "CC0", licenciaUrl }`, con `alt = "<Nombre común> (<científico>)"` y `licenciaUrl` de CC0.

### Decisión 4 — Portadas

Las nuevas fotos se **añaden** a `fotos[]` (no se tocan las portadas curadas de #88). Excepción recomendada: **Bolitoglossa platydactyla** — su foto local pasa a portada (`photo-selections.json` + primer lugar de `fotos[]`), por ser la única salamandra y hoy depender de iNaturalist. El resto de portadas locales se pueden promover luego con `npm run photo:tool` si el autor lo decide; no se degrada una portada curada con una foto de WhatsApp sin revisión.

### Decisión 5 — GCS es paso del mantenedor

La subida a GCS necesita credenciales (`google-cloud-storage` + service account, ADR-0016). El asistente prepara todo (mover, créditos, `fotos[]`, optimización local, PDF); **el mantenedor corre la subida** (`--upload`). Hasta entonces, el PDF (banco local) ya muestra las fotos; la web las verá al subirlas.

## Risks / Trade-offs

- **[Re-migración accidental borra #93]** → Por eso el modo «solo fotos» y la edición a mano de `fotos[]`; ninguna ficha se regenera. La verificación confirma que `distribucion` sigue intacta.
- **[Foto local de baja calidad como portada]** → Solo Bolitoglossa se promueve (revisada); las demás se añaden sin tocar portada.
- **[Web 404 hasta subir a GCS]** → Esperado; el `--upload` es el paso de cierre del mantenedor. El PDF no depende de GCS.
- **[Archivo en `_por_confirmar` con identificación ausente]** → Las 2 ignoradas y cualquier futura quedan fuera (no se adivina), registradas en el manifiesto.

## Open Questions

- Confirmar si alguna otra foto local (además de Bolitoglossa) debe ser portada de su especie (decisión del autor, revisando calidad).
