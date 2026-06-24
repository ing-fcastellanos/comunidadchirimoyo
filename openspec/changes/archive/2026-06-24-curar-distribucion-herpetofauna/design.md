## Context

El catálogo ya pinta rangos por especie a granularidad de país ISO sobre un mapa precomputado de Natural Earth (ADR-0018), con zonas `cria`/`invernada`/`residente` y un fallback honesto para fichas sin `distribucion`. Las 64 aves se curaron en #36; las 12 herpetofauna quedaron sin `distribucion`. Este cambio cura el rango **residente** de la herpetofauna donde tiene sentido, e investiga cada especie en fuentes autoritativas (IUCN Red List, AmphibiaWeb, The Reptile Database, GBIF).

## Goals / Non-Goals

**Goals:**
- Pintar el rango residente solo donde el dato a nivel país es **honesto** (rango nativo multi-país).
- Aprovechar el fallback existente para microendemismos y especies introducidas, en vez de sobrestimar el rango.
- Dejar `notas` que aclaren matices (rango que sale del encuadre, endemismo, introducción).

**Non-Goals:**
- Cambiar el componente/esquema; granularidad sub-país; re-curar aves; capa GBIF.

## Decisions

### Decisión 1 — Curar solo rangos multi-país; lo demás al fallback honesto

La granularidad de país (ADR-0018) es honesta cuando el rango cruza fronteras, pero engañosa para un endémico (pintar todo México) o una introducida (pintar su rango nativo lejano). Regla:

```
rango nativo multi-país            → curar distribucion.residente (ISO)
rango nativo solo México (endémica)→ fallback honesto (marcador local + "Residente")
estatusDistribucion: introducida   → fallback honesto (no pintar rango nativo)
```

### Decisión 2 — Rangos investigados por especie (PARA REVISIÓN)

**A curar (8):** `distribucion.residente` = códigos ISO 3166-1 alpha-2, orden norte→sur.

| Slug | ISO `residente` | Nota (resumen) | Fuente |
|---|---|---|---|
| `incilius-valliceps` | MX, BZ, GT, HN, SV, NI, CR | Vertiente del Golfo/Caribe del E/SE de México a Costa Rica; NO llega a EE.UU. (Texas = *I. nebulifer*). | IUCN; AMNH ASW |
| `rhinella-horribilis` | US, MX, BZ, GT, SV, HN, NI, CR, PA, CO, VE, EC, PE | Complejo del sapo de caña más norteño: sur de Texas, por Mesoamérica al W de los Andes hasta Ecuador/Perú. | AmphibiaWeb; USGS NAS |
| `smilisca-baudinii` | US, MX, BZ, GT, SV, HN, NI, CR | Del extremo sur de Texas por México y Centroamérica hasta el sur de Costa Rica. | IUCN (vía Wikipedia); AMNH ASW |
| `lithobates-berlandieri` | US, MX | Sur de Nuevo México/Texas a la vertiente del Golfo hasta Veracruz; poblaciones del SW de EE.UU. son introducidas. | IUCN 58582 |
| `tlalocohyla-picta` | MX, GT, BZ | NO endémica; tierras bajas del Caribe/Golfo de México a Guatemala/Belice (rango conservador IUCN/AmphibiaWeb). | IUCN 55880 |
| `sceloporus-grammicus` | US, MX | Sur de Texas y gran parte del altiplano y vertientes de México. | Reptile DB; IUCN |
| `thamnophis-proximus` | US, MX, BZ, GT, SV, HN, NI, CR | Del centro/sur de EE.UU. por el E de México y Centroamérica hasta el centro de Costa Rica. | Reptile DB; IUCN |
| `trachemys-venusta` | MX, BZ, GT, HN, SV, NI, CR, PA, CO | Del SE de México por Centroamérica hasta el NW de Colombia. | Reptile DB/TTWG (vía Wikipedia); USGS NAS |

**Al fallback honesto (4):** sin `distribucion`.

| Slug | Motivo | Nota |
|---|---|---|
| `bolitoglossa-platydactyla` | Endémica de México | Vertiente E del Golfo (Tamaulipas→Chiapas NE). IUCN 59158. |
| `rheohyla-miotympanum` | Endémica de México | Sierra Madre Oriental/de Oaxaca/Los Tuxtlas. IUCN 55670. |
| `eleutherodactylus-cystignathoides` | Nativa solo de México | NE de México; la población de Texas es introducida (a veces *E. campi*). |
| `iguana-iguana` | `introducida` localmente | Rango nativo amplio (MX→Sudamérica/Antillas), pero pintar el nativo tergiversaría su presencia introducida en el humedal. |

> **Verificación pendiente del autor:** la investigación tuvo 403/CAPTCHA en algunas páginas directas de IUCN/AmphibiaWeb; los rangos provienen de resúmenes de esas fuentes y espejos (AMNH, Reptile DB, USGS). Revisar especialmente: inclusión de `HN` en `tlalocohyla-picta` (se omitió, rango conservador MX/GT/BZ) y los códigos finales de cada lista antes de aplicar.

### Decisión 3 — `notas` con los matices que el país no captura

Donde el rango sale del encuadre o tiene salvedades (introducciones, taxonomía), se redacta `notas` (string traducible, i18n-ready) para que el mapa no mienta por omisión — igual que las aves (p. ej. la nota de `actitis-macularius`).

## Risks / Trade-offs

- **[Códigos ISO imprecisos por bloqueo de fuentes]** → Marcado como verificación del autor antes de aplicar; rangos conservadores cuando hubo duda (`tlalocohyla-picta` sin HN).
- **[País entero sobrestima incluso en multi-país]** → Aceptado por ADR-0018; `notas` acota; los casos peores (endémicos) van al fallback.
- **[`iguana-iguana` sin rango podría leerse como "falta dato"]** → El badge ya muestra "Introducida" y el fallback rotula "Residente/estatus"; la nota editorial puede reforzar. Pintar el nativo sería peor.

## Open Questions

- Confirmar `HN` para `tlalocohyla-picta` (incluir o mantener MX/GT/BZ).
- ¿Alguna de las 8 listas ISO debe ajustarse según el conocimiento de campo del autor?
