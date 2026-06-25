## 1. Registrar la resolución en el manifiesto

- [x] 1.1 Actualizar `_manifiesto_fotos.csv` (banco del mantenedor) con la resolución del autor: 21 asignadas (especie + autor), 12 descartadas (motivo: mojarra/ardilla/insecto/comadreja/crustáceo), 2 ignoradas (incierta / mala foto). La identificación del autor prevalece sobre las conjeturas previas.

## 2. Créditos y movimiento al banco

- [x] 2.1 Añadir 21 entradas a `creditos_imagenes.json` (`imagenes[]`): `archivo`, `nombre_cientifico`, autor (Any Isabel Pérez Santiago / Diana Isela Angeles Solares / Francisco Castellanos), `licencia: "CC0"`, `licencia_url` de CC0.
- [x] 2.2 Mover las 21 fotos de `_por_confirmar/` a `fotos/<Nombre científico>/` en el banco.

## 3. Modo «solo fotos» (sin regenerar fichas)

- [x] 3.1 Añadir a `scripts/migrar-fauna.py` un modo (p. ej. `--solo-fotos <slug...>`) que procese las imágenes nuevas (web/thumb/raw vía `optimizar()`) y, con `--upload`, las suba a GCS, **omitiendo** la emisión de fichas. (O un script focalizado equivalente que reuse `optimizar()`.)
- [x] 3.2 Procesar localmente las variantes de las 21 fotos (no requiere credenciales).

## 4. Añadir `fotos[]` a las 7 fichas (a mano, incremental)

- [x] 4.1 Añadir las entradas de `fotos[]` (con `web_<Sci>_<basename>.webp`, `credito`, `alt`, `licencia: "CC0"`, `licenciaUrl`) a las 7 fichas, **sin tocar** el resto del MD: lithobates-berlandieri (6), tlalocohyla-picta (5), smilisca-baudinii (4), trachemys-venusta (2), eleutherodactylus-cystignathoides (2), incilius-valliceps (1), bolitoglossa-platydactyla (1).
- [x] 4.2 Promover la foto local de **bolitoglossa-platydactyla** a portada (`photo-selections.json` + primera posición de `fotos[]`).

## 5. Verificación

- [x] 5.1 `npm run validate:fichas` pasa (cada `fotos[]` con `credito` y `alt`; ≥1 foto).
- [x] 5.2 Confirmar que las 7 fichas conservan su contenido previo (en especial `distribucion.residente` de #93) — solo creció `fotos[]`.
- [x] 5.3 `npm run build` verde; preview de una ficha (p. ej. bolitoglossa) muestra las fotos locales (tras subir a GCS) y la portada nueva.
- [x] 5.4 **Mantenedor:** `npm run build:pdf` regenera ambos PDFs con las fotos locales en el banco.
- [x] 5.5 **Mantenedor:** subir las 21 fotos × 3 variantes a GCS (`--upload`, credenciales) para que la web las cargue.
