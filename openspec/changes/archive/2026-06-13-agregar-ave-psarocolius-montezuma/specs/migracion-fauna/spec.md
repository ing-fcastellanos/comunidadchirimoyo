## ADDED Requirements

### Requirement: Política de licencias para fotos sembradas desde repositorios públicos

Cuando una especie no tiene fotos propias y se siembran desde repositorios públicos (p. ej. iNaturalist), las fotos incorporadas al catálogo SHALL tener licencia **CC0**, **CC BY** o **CC BY-SA** (reutilizables incluso para uso comercial). El proceso de siembra SHALL filtrar por esas licencias y por calidad de observación (`quality_grade=research`), y SHALL capturar por cada foto: autor/atribución, nombre de licencia, URL de la licencia y URL de la foto/observación de origen, que el script de migración mapea a los campos `credito`, `licencia`, `licenciaUrl` y `creditoUrl` de cada `Foto`. El catálogo NO SHALL incorporar fotos con "Todos los derechos reservados" ni licencias **ND** (sin derivados), pues el pipeline genera variantes derivadas (WebP `web`/`thumb`).

#### Scenario: Foto con licencia libre aceptada

- **WHEN** se siembra una foto de iNaturalist con `license_code` ∈ {cc0, cc-by, cc-by-sa} y `quality_grade=research`
- **THEN** la foto se descarga al banco y se registra en el manifiesto de créditos con autor, licencia, URL de licencia y URL de la observación

#### Scenario: Foto con licencia incompatible descartada

- **WHEN** una observación solo ofrece fotos con "Todos los derechos reservados" o licencia ND
- **THEN** esas fotos NO se incorporan al catálogo y la especie queda sin sembrar (o se siembra solo con las fotos de licencia aceptada disponibles)

#### Scenario: Atribución preservada en la ficha

- **WHEN** una foto sembrada llega a la ficha final
- **THEN** su bloque `fotos[]` conserva `credito`, `licencia`, `licenciaUrl` y `creditoUrl` apuntando al autor y a la página de origen
