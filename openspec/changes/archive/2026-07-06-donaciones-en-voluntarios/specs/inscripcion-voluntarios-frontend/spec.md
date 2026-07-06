## MODIFIED Requirements

### Requirement: Página de voluntarios con jornadas

`/voluntarios` SHALL presentar una introducción real (no placeholder de andamiaje), una sección de **jornadas** con un enlace al **calendario** (la URL de calendario de `enlaces.json`, abierta de forma segura), el formulario de inscripción, y una sección de **donaciones informativas** derivada de `donaciones.json` que reutiliza el componente de donaciones del sitio. La sección de donaciones SHALL ser puramente informativa: NO SHALL procesar pagos ni cobrar en línea (ADR-0007).

#### Scenario: La página enlaza el calendario
- **WHEN** se abre `/voluntarios`
- **THEN** se muestra la introducción, un enlace al calendario de jornadas y el formulario de inscripción

#### Scenario: Donaciones informativas en /voluntarios
- **WHEN** se abre `/voluntarios`
- **THEN** se muestra una sección de donaciones informativas con los métodos derivados de `donaciones.json` (transferencia SPEI/CLABE, Spin by OXXO, en especie), sin que el sitio procese un pago
