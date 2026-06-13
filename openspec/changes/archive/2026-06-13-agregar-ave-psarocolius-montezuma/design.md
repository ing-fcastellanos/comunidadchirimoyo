## Context

El catálogo de aves es 100% estático: cada especie es una ficha `content/fauna/aves/<slug>/index.md` que el build de `apps/catalogo` lee, valida y renderiza en `/aves/<slug>`. Las fotos y audios viven en GCS (`gs://catalogo-aves-chirimoyo`), no en el repo; la ficha solo guarda nombres de archivo + atribución.

El pipeline de incorporación ya existe y está especificado (`migracion-fauna`):

```
descargar_imagenes_faltantes.py   →  banco local "Imagenes aves/<Nombre cientifico>/"
   (iNaturalist, CC, region-first)    + creditos_imagenes.json
                                                │
content/fauna/_origen/aves-especies.csv  ──┐    │
   (1 fila por especie)                    ▼    ▼
                          scripts/migrar-fauna.py --upload
                                   │
              ┌────────────────────┼─────────────────────┐
              ▼                    ▼                      ▼
   content/.../<slug>/index.md   GCS web+thumb        GCS audio
   (FUENTE DE VERDAD, se cura)   (optimiza WebP)      (xeno-canto verbatim)
              │
              ▼  next build → /aves/<slug> + /busqueda
```

La especie hermana ***Psarocolius wagleri*** (`psarocolius-wagleri`) ya se incorporó por esta vía y sirve de plantilla exacta: misma `categoria: "Terrestres"`, `forma: pajaro`, `tamano: grande`, `donde: arbol`, familia Icteridae, fotos iNaturalist CC BY/CC BY-SA y audio xeno-canto. Su ficha incluso contrasta con Moctezuma ("cabeza negra y carúnculas faciales").

Restricciones: contenido en repo (ADR-0004), catálogo estático (ADR-0005/0014), media en GCS (ADR-0016), audio verbatim por licencias ND (ADR-0017), distribución por geografía real + códigos ISO (ADR-0018).

## Goals / Non-Goals

**Goals:**
- Incorporar **una** especie (*Psarocolius montezuma*, Oropéndola de Moctezuma) reutilizando el pipeline existente tal cual.
- Sembrar fotos con licencia libre (CC0/CC BY/CC BY-SA) desde iNaturalist con el script externo ya probado.
- Conseguir una grabación CC de xeno-canto.
- Producir una ficha curada (descripción honesta, `distribucion` ISO respaldable, estatus local prudente) consistente con la de *wagleri*.

**Non-Goals:**
- No construir herramienta nueva ni mover el script de descarga al repo.
- No escribir guía/how-to ni automatización reutilizable (diferido a un change posterior).
- No tocar el esquema, el algoritmo del pipeline, ni el frontend.
- No curar ni reprocesar otras especies.

## Decisions

**D1 — Fila en el CSV de origen (no ficha a mano).** Se agrega *montezuma* como fila en `content/fauna/_origen/aves-especies.csv` y se deja que `migrar-fauna.py` genere la ficha. Por qué: es el flujo especificado y validado; el script normaliza enums, parsea conservación, valida vocabularios y emite YAML auto-verificado, evitando errores de formato manual. *Alternativa descartada:* escribir el `index.md` a mano — más frágil y se salta la validación del pipeline. *Alternativa descartada:* extender el CSV no, sino un mini-CSV aparte — innecesario para una fila.

**D2 — Fotos vía el script externo `descargar_imagenes_faltantes.py`.** Se añade `("Oropéndola de Moctezuma","Psarocolius montezuma","Psarocolius montezuma")` a su lista `ESPECIES[]` y se corre; baja ~10 fotos CC priorizando Veracruz → México → global y regenera `creditos_imagenes.json`. Por qué: es exactamente el proceso con que se sembró *wagleri* y otras 15. *Alternativa descartada:* Wikimedia Commons — el script no lo implementa y iNaturalist ya da cobertura regional con atribución estructurada.

**D3 — Licencias CC0/CC BY/CC BY-SA únicamente.** Se excluyen NC, ND y "todos los derechos reservados". Por qué: el sitio podría tener donaciones (zona gris para NC) y el pipeline genera derivados WebP (incompatible con ND). Coincide con el filtro `cc0,cc-by,cc-by-sa` que ya trae el script. Queda formalizado en el delta de `migracion-fauna`.

**D4 — Audio xeno-canto verbatim.** Se busca una grabación con licencia CC para la especie y se llenan las columnas `sonido_*` de la fila; `migrar-fauna.py --upload` la descarga sin transcodificar (ADR-0017). Por qué: consistencia con las 63 fichas. *Si no hay grabación CC adecuada*, la ficha se emite sin bloque `audios` (campo opcional) — no bloquea.

**D5 — Curación de `distribucion` y estatus local.** Tras generar la ficha, se ajusta a mano el bloque `distribucion` (códigos ISO) y `gradoOcurrencia`/`estatusMigratorio`. Datos de la especie: rango Caribe/Atlántico del **SE de México a Panamá — no llega a Sudamérica** (a diferencia de *wagleri*): `residente: ["MX","BZ","GT","HN","NI","CR","PA"]` (revisar SV). En Chirimoyo (~1230 m) es especie de tierras bajas **cerca/por encima de su límite altitudinal**: se sigue el precedente honesto de *wagleri* (notas con "estimado"/"cerca del límite altitudinal") y un `gradoOcurrencia` prudente (probablemente `rara` salvo registro local que respalde otra cosa).

**D6 — `categoria: "Terrestres"`.** Se reutiliza la categoría/gremio donde cayó *wagleri* (los paseriformes arborícolas se mapearon ahí), para coherencia de filtros del buscador.

## Risks / Trade-offs

- **[Ocurrencia real en Chirimoyo dudosa]** *montezuma* es ave de tierras bajas; su presencia a 1230 m no está garantizada. → Mitigación: estatus prudente (`rara`), notas con "estimado", y verificar si hay registro local (eBird/observación) antes de afirmar residencia; si no, redactar la presencia en términos condicionales como en *wagleri*.
- **[Pocas fotos CC regionales]** puede que iNaturalist no tenga 10 fotos CC de Veracruz/México. → Mitigación: el script cae a global; basta ≥1 foto válida para pasar la validación del núcleo. Aceptar menos de 10.
- **[Audio CC inexistente]** quizá no haya grabación con licencia compatible. → Mitigación: omitir `audios` (opcional); la ficha sigue válida.
- **[Atribución incorrecta]** copiar mal autor/licencia es el riesgo legal central. → Mitigación: el script captura la atribución estructurada de la API; revisar que `credito`/`licenciaUrl` queden poblados (no "Crédito pendiente").
- **[Manifiesto fuera del repo]** `creditos_imagenes.json` y el banco viven en `Downloads`, no versionados. → Trade-off aceptado: replica el estado actual del proyecto; la verdad de atribución queda en la ficha (sí versionada).

## Migration Plan

1. Añadir *montezuma* a `ESPECIES[]` del script externo y ejecutarlo → fotos + créditos.
2. Localizar grabación CC en xeno-canto (anotar id, autor, licencia, url).
3. Añadir la fila al CSV de origen (clonar *wagleri*, ajustar datos propios + `sonido_*`).
4. Correr `python scripts/migrar-fauna.py --upload` → genera ficha + sube media a GCS.
5. Curar la ficha: `distribucion`, `gradoOcurrencia`, notas honestas; revisar créditos.
6. `next build` en `apps/catalogo` → verificar `/aves/psarocolius-montezuma` y `/busqueda`.
7. Commit del contenido (`content/`) + PR.

**Rollback:** el contenido es git (revertir el commit borra la ficha y la fila CSV). Los objetos en GCS quedan huérfanos pero inertes (nadie los referencia); se pueden borrar con `gsutil rm` si se desea, no es urgente.

## Open Questions

- ¿Hay registro local verificable de *montezuma* en/cerca de Chirimoyo, o se documenta como presencia marginal/estimada? (define `gradoOcurrencia` y el tono de las notas).
- ¿Existe grabación xeno-canto con licencia CC para la especie? (define si la ficha lleva `audios`).
- ¿Se incluye El Salvador (SV) en el rango residente? (verificar en fuente abierta al curar `distribucion`).
