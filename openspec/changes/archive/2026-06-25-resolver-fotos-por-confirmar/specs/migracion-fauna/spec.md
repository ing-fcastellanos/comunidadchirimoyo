## ADDED Requirements

### Requirement: Resolución de fotos `_por_confirmar`

Las imágenes de `fotos/_por_confirmar/` (sin especie asignada) SHALL resolverse antes de publicarse: cada foto SHALL **asignarse a una especie** o **descartarse/ignorarse**, y la decisión SHALL registrarse en el manifiesto de origen (`_manifiesto_fotos.csv`). Cuando la identificación del autor difiera de la conjetura previa del manifiesto, la del **autor SHALL prevalecer**. Una foto que no corresponda a una especie del catálogo (p. ej. mojarra, ardilla, insecto, comadreja, crustáceo) SHALL descartarse; una foto sin identificación confiable (incierta o de mala calidad) SHALL ignorarse. NO SHALL publicarse ninguna foto descartada o sin identificación: lo no resuelto queda fuera (no se adivina).

#### Scenario: Foto identificada se asigna
- **WHEN** el autor identifica una foto de `_por_confirmar` como una especie del catálogo
- **THEN** el manifiesto registra esa especie para la foto y la foto queda lista para publicarse (sujeta a créditos confirmados)

#### Scenario: La identificación del autor prevalece
- **WHEN** el manifiesto traía una conjetura de baja confianza distinta de la identificación del autor
- **THEN** se conserva la identificación del autor

#### Scenario: No-especie se descarta; incierta se ignora
- **WHEN** una foto no es una especie del catálogo, o no tiene identificación confiable
- **THEN** se marca como descartada/ignorada en el manifiesto y NO se publica

### Requirement: Ingesta incremental de fotos locales sin regenerar la ficha

Las fotos locales del humedal (de la comunidad) confirmadas SHALL publicarse **solo** si tienen **identificación y créditos confirmados** (autor + licencia). La atribución de fotos comunitarias SHALL usar el autor aportado y licencia **CC0**, registrada en `creditos_imagenes.json`. La ingesta de estas fotos a las fichas SHALL ser **incremental**: SHALL añadir las entradas correspondientes a `fotos[]` de la ficha **sin regenerar la ficha desde el CSV**, de modo que se preserven los campos que viven solo en el Markdown (p. ej. `distribucion.residente`). El procesamiento de imágenes (variantes web/thumb/raw) y la subida a GCS SHALL reusar el pipeline existente (`optimizar()` y la convención de objetos `web|thumb|raw/<slug>/…`) en un modo que NO emita fichas.

#### Scenario: Foto comunitaria con crédito CC0 publicada
- **WHEN** una foto local confirmada tiene autor y licencia CC0
- **THEN** se añade a `fotos[]` de su ficha con `credito`, `alt`, `licencia: "CC0"` y `licenciaUrl`, y sus variantes se procesan y suben a GCS

#### Scenario: La ficha conserva su contenido previo
- **WHEN** se ingiere una foto a una ficha que tiene `distribucion.residente` (curada en otro cambio)
- **THEN** la ficha conserva su `distribucion` y demás campos; solo crece `fotos[]` (no se regenera desde el CSV)

#### Scenario: Sin créditos no se publica
- **WHEN** una foto identificada no tiene créditos confirmados
- **THEN** no se publica en `content/` (queda registrada su identificación, pendiente de créditos)
