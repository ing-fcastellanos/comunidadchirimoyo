## Context

`scripts/migrar-fauna.py` migró las 64 aves: lee `content/fauna/_origen/aves-especies.csv`, genera fichas, optimiza imágenes a WebP (web/thumb) y las sube con las crudas a GCS, descarga audio verbatim, puebla créditos desde `creditos_imagenes.json` y valida el núcleo. El esquema de ficha ya es group-aware (#87, PR #97): `Grupo` admite `anfibios`/`reptiles`, `medidas.criterio` existe, y `categoria` es group-aware.

Los datos de herpetofauna (12 especies) viven fuera del repo en `…/anfibios-reptiles/`: CSV `anfibios-reptiles-especies.csv`, banco `fotos/<nombre científico>/` ya curado (con `_manifiesto_fotos.csv` y `_por_confirmar/`), `creditos_imagenes.json` (misma forma que aves) y los cantos referidos por las columnas `sonido_*` del CSV. El CSV de herps es ~90% compatible con lo que el script ya espera; las diferencias son acotadas.

## Goals / Non-Goals

**Goals:**
- Reutilizar `migrar-fauna.py` extendiéndolo a group-aware, sin duplicar el pipeline.
- Producir 12 fichas válidas en `content/fauna/{anfibios,reptiles}/` con fotos y audio en GCS.
- Portada curada por especie.
- Dejar las 64 fichas de aves intactas (regeneración idempotente, no destructiva).

**Non-Goals:**
- Identificar las fotos de `_por_confirmar/` (#90); construir filtro/rutas (#85/#84); grupos futuros.
- Verificar la reproducción del audio en la ficha (#89).

## Decisions

- **Extender, no forkear.** Las 6 diferencias son localizadas; el pipeline de imágenes/audio/GCS/manifiesto/validación es demasiado valioso para duplicar. _Alternativa descartada:_ `migrar-herpetofauna.py` aparte — duplicaría ~500 líneas y divergiría con el tiempo.

- **`grupo` por fila, no por corrida.** El CSV de herps mezcla `Anfibio` y `Reptil` que van a carpetas distintas; el script deriva el grupo de la columna `grupo` por fila (`Anfibio`→`anfibios`, `Reptil`→`reptiles`) y default `aves` cuando la columna falta. La salida pasa de `--out` fijo a `content/fauna/<grupo>/<slug>/`. _Alternativa descartada:_ dos corridas con `--grupo` — obliga a partir el CSV o filtrar; el routing por fila es más simple y robusto.

- **`presencia` como fuente del eje de presencia.** No se renombra `estatusMigratorio` (decisión #87); el script lee `estatus_migratorio` o, en su ausencia, `presencia`. Para herps el valor es siempre `residente`.

- **Remap de `categoria` desde el valor del CSV** (no desde `orden`), porque la columna ya distingue lagarto vs serpiente (ambos `Squamata`). Tabla fija: Sapo/Rana→Anuros, Salamandra→Salamandras, Lagarto→Lagartijas, Serpiente→Serpientes, Tortuga→Tortugas.

- **Omitir `forma`/`donde` en herps** (decisión C de #87). El CSV los trae (p. ej. `forma=sapo`, `donde=['hojarasca', …]`) pero su vocabulario cerrado es aviar; mapearlos reventaría la validación. `tamano`/`colores`/`featured` sí migran (valores compatibles).

- **Audio: extensión real desde `sonido_url`.** El script hardcodea `f"{sonido_id}.mp3"`, pero iNaturalist sirve `.m4a`/`.mpga`/`.mp3` mezclados. Se deriva la extensión de la URL (o del content-type al descargar). Esto corrige el `archivo` de la ficha **y** la clave del objeto en GCS.

- **Portada curada vía el mecanismo existente.** `migrar-fauna.py` emite `fotos[]` en orden alfabético; `scripts/aplicar-foto-principal.mjs` reordena la portada según `apps/catalogo/print/photo-selections.json` (emparejado por *stem*, ver esquema-ficha-fauna). Se añaden las entradas de las 12 portadas de herps a ese JSON y se corre el script — no se cambia la lógica de `migrar-fauna.py`.

- **CSV de origen versionado.** Se copia a `content/fauna/_origen/anfibios-reptiles-especies.csv` (como aves) para reproducibilidad; manifiesto y banco de fotos quedan externos (igual que aves).

## Risks / Trade-offs

- **La subida a GCS necesita credenciales (ADC) y los buckets** `catalogo-aves-chirimoyo`(+`-raw`). → Mitigación: la generación de fichas corre sin `--upload` y es verificable; la subida la ejecuta quien tenga credenciales. El script ya falla con mensaje claro si faltan ADC/bucket.

- **Encoding del CSV.** Acentos (ñ/í) y comillas deben quedar UTF-8 en las fichas. → Mitigación: el script lee/escribe UTF-8 explícito y re-parsea el YAML emitido; verificar visualmente una ficha con acentos.

- **Curación de portada es un paso manual** (elegir 12 fotos). → Mitigación: proponer defaults (mejor foto de campo del Chirimoyo por especie) y dejar que el responsable ajuste; son solo 12.

- **El banco mezcla fotos de campo (CC0) y de iNaturalist (CC varias).** El script sube todas con su crédito del manifiesto; una foto sin entrada en el manifiesto queda con `credito` pendiente (no inventa atribución). → Mitigación: revisar el reporte de "fotos sin crédito" tras la corrida.

- **`forma`/`donde` quedan sin migrar** aunque el CSV los tenga. → Es intencional (decisión C); si en el futuro se quiere filtro visual de herps, será un vocabulario por grupo aparte.
