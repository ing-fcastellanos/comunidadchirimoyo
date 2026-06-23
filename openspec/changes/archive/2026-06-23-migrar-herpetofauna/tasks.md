## 1. Preparación de datos

- [x] 1.1 Copiar el CSV de origen a `content/fauna/_origen/anfibios-reptiles-especies.csv` (UTF-8, versionado).
- [x] 1.2 Verificar el banco de fotos externo y `creditos_imagenes.json` (misma forma que aves; entradas de herps indexan por `nombre_cientifico` + basename).
- [x] 1.3 Documentar en `content/fauna/_origen/README.md` el mapeo del CSV de herpetofauna (columnas nuevas: `presencia`, `talla_criterio`, remap de `categoria`, `actividad` descartada).

## 2. Extender migrar-fauna.py a group-aware

- [x] 2.1 **grupo por fila**: derivar `<grupo>` de la columna `grupo` (`Anfibio`→`anfibios`, `Reptil`→`reptiles`; default `aves`); escribir a `content/fauna/<grupo>/<slug>/` y emitir `grupo:` correcto.
- [x] 2.2 **presencia**: leer `estatus_migratorio` o, en su ausencia, `presencia`, para `estatusMigratorio`.
- [x] 2.3 **remap de categoria**: tabla group-aware (Sapo/Rana→Anuros, Salamandra→Salamandras, Lagarto→Lagartijas, Serpiente→Serpientes, Tortuga→Tortugas); para aves, sin cambios.
- [x] 2.4 **omitir forma/donde en herps**: `search_fields_yaml` salta `forma` y `donde` cuando el grupo no es aves; mantiene `tamano`, `colores`, `featured`.
- [x] 2.5 **talla_criterio → medidas.criterio**: en `detalle_fields_yaml`, emitir `criterio` dentro de `medidas` cuando la columna exista.
- [x] 2.6 **extensión de audio**: derivar la extensión real de `sonido_url` (`.mp3`/`.m4a`/`.mpga`) para el campo `archivo` y la clave GCS, en vez del `.mp3` hardcodeado.
- [x] 2.7 Ignorar la columna `actividad` (redundante con `mejor_hora`, fuera del esquema).
- [x] 2.8 (extra) Robustez de datos: meses por nombre (`junio`→6), colores con acento/coma/sinónimos (`café`→cafe, `dorado`→amarillo, `crema`→blanco), presencia `Introducida`→residente.

## 3. Generar y validar fichas (sin subir)

- [x] 3.1 Correr la migración sin `--upload` y generar las 12 fichas en `content/fauna/{anfibios,reptiles}/`.
- [x] 3.2 Revisar el reporte: 12 especies, 0 errores de núcleo, fotos emparejadas, sin "carpetas sin especie" salvo `_por_confirmar`.
- [x] 3.3 Verificar fichas con acentos (ñ/í), audio (extensión real), `medidas.criterio`, `categoria` remapeada, sin `forma`/`donde`, iguana residente+introducida.

## 4. Curar portada por especie

- [x] 4.0 (extra) Generalizar `scripts/aplicar-foto-principal.mjs` a group-aware (busca el slug en cualquier grupo de `content/fauna/`).
- [x] 4.1 Portadas elegidas por el responsable para las 12 especies (10 web_ de iNaturalist + 2 de campo DSCN para Sceloporus y Thamnophis).
- [x] 4.2 12 entradas añadidas a `apps/catalogo/print/photo-selections.json` (76 totales; no afecta el PDF de aves, que filtra `grupo === "aves"`).
- [x] 4.3 `aplicar-foto-principal.mjs` (ya group-aware) aplicado: 11 reordenadas + 1 ya-correcta, 0 sin-coincidencia; `fotos[0]` verificado.

## 5. Subir medios a GCS (requiere credenciales)

- [x] 5.1 Correr la migración con `--upload`: 342 objetos de imagen (raw/web/thumb) + 14 de audio (7 cantos × 2 buckets) subidos.
- [x] 5.2 Revisar el reporte: 3 bugs destapados y corregidos en el script — yaml opcional, `[no aplica]` tratado como faltante (sin audios bogus en salamandra/reptiles), aviso de content-type solo si no es `audio/*`. Fichas regeneradas limpias.

## 6. Verificación

- [x] 6.1 `next build` del catálogo: 76 páginas `/aves/[slug]` (64 aves + 12 herps); las de aves no cambian.
- [x] 6.2 Smoke local: `/aves/incilius-valliceps` renderiza con chip ANUROS, rótulo LHC (7–10 cm), badges Residente·Común·Nativa, 10 fotos del bucket (imgComplete=true) y `<audio>` `.m4a` del bucket.
- [x] 6.3 `npm run typecheck` en `apps/catalogo` pasa.
