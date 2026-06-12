## ADDED Requirements

### Requirement: Campos descriptivos de la ficha de detalle

El esquema de la ficha SHALL incluir cinco campos **opcionales** de texto para la ficha de
detalle: `autoridad` (autor y año del binomio, p. ej. `Rackett, 1813`), `otrosNombres`
(string[] de nombres comunes alternos), `envergadura` (string, p. ej. `95–115 cm`),
`mejorHora` (string, p. ej. `Amanecer y atardecer`) y `pullQuote` (cita destacada de la
descripción). Junto con los ya existentes
`medidas`, `habitat` y `temporada` (opcionales desde #9), alimentan el hero, los datos
rápidos y la observación. Por ser opcionales, una ficha sin ellos SHALL seguir siendo válida.
Los tipos SHALL existir en el esquema del loader y documentarse en `content/README.md` y
`content/fauna/aves/_ejemplo.md`.

#### Scenario: Ficha con datos de detalle
- **WHEN** una ficha declara `autoridad`, `otrosNombres`, `envergadura` y `mejorHora`
- **THEN** el loader los expone tipados y la ficha de detalle los muestra

#### Scenario: Datos de detalle ausentes
- **WHEN** una ficha no declara estos campos
- **THEN** sigue siendo válida y las partes correspondientes de la ficha se omiten
