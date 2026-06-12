## MODIFIED Requirements

### Requirement: Resultados con tarjeta, vista y orden

Los resultados SHALL renderizarse con una tarjeta de especie (`BirdCard`) que muestre foto
(variante `thumb`), nombre común y científico, chip de categoría, indicadores de presencia/
observación, sello de NOM-059 cuando aplique, rasgos (tamaño/color/hábitat) y un enlace
"Ver ficha" a `/aves/<slug>`. La pantalla SHALL ofrecer **vista de cuadrícula y de lista**, un
control de **orden** (relevancia, alfabético, por categoría, de más común a más raro) y un
conteo de resultados.

#### Scenario: Cambio de vista
- **WHEN** el usuario activa la vista de lista
- **THEN** las tarjetas se muestran en formato horizontal sin perder los filtros aplicados

#### Scenario: Orden alfabético
- **WHEN** el usuario elige orden "Alfabético"
- **THEN** los resultados se ordenan por nombre común en español

#### Scenario: Enlace al detalle
- **WHEN** el usuario activa "Ver ficha" en una tarjeta
- **THEN** navega a `/aves/<slug>` de esa especie
