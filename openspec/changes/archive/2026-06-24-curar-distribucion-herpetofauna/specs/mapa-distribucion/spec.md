## ADDED Requirements

### Requirement: Política de curaduría del rango residente

La curaduría del campo `distribucion.residente` de una ficha de fauna SHALL pintar el rango a granularidad de país **solo cuando el rango nativo de la especie abarque más de un país**. Una ficha cuyo rango nativo se limita a **México** (especie endémica o casi-endémica) NO SHALL declarar `distribucion`, y una ficha marcada `estatusDistribucion: introducida` NO SHALL declarar el rango **nativo** de la especie; en ambos casos la ficha SHALL apoyarse en el fallback honesto (geografía + marcador local + etiqueta de estatus). El motivo es que pintar un país entero sobrestima un endemismo local y pintar el rango nativo de una introducida tergiversaría su presencia en el sitio. Cuando una ficha curada tenga matices que el país no captura (rango fuera del encuadre del mapa, introducción, taxonomía), SHALL documentarlos en `distribucion.notas`.

#### Scenario: Rango multi-país se cura
- **WHEN** una especie residente tiene rango nativo en varios países (p. ej. *Trachemys venusta*, del SE de México al NW de Colombia)
- **THEN** su ficha declara `distribucion.residente` con los códigos ISO de esos países y el mapa los pinta en la zona residente

#### Scenario: Endémica de México cae al fallback
- **WHEN** la especie es endémica o casi-endémica de México (p. ej. *Bolitoglossa platydactyla*, *Rheohyla miotympanum*)
- **THEN** su ficha NO declara `distribucion` y el mapa muestra el marcador local con la etiqueta de estatus, sin pintar todo México

#### Scenario: Introducida no pinta rango nativo
- **WHEN** la especie está marcada `estatusDistribucion: introducida` en el sitio (p. ej. *Iguana iguana*)
- **THEN** su ficha NO declara el rango nativo y cae al fallback honesto, de modo que el mapa no sugiere que su presencia local es natural

#### Scenario: Notas aclaran lo que el país no captura
- **WHEN** una ficha curada tiene un rango que sale del encuadre del mapa o una salvedad relevante
- **THEN** `distribucion.notas` lo describe en prosa traducible
