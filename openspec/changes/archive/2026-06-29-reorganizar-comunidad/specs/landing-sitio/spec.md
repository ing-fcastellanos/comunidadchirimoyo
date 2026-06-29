## REMOVED Requirements

### Requirement: Sección "Qué hacemos"

**Reason**: La sección de actividades se mueve a `/comunidad` (su hogar natural, ADR-0023). Su comportamiento se conserva en la capacidad `pagina-comunidad`. El landing deja de incluirla.

### Requirement: Línea de tiempo de logros

**Reason**: La línea de tiempo de logros se mueve a `/comunidad`. Su comportamiento se conserva en la capacidad `pagina-comunidad`. El landing deja de incluirla.

## ADDED Requirements

### Requirement: Enlace a la comunidad desde el landing

El landing SHALL incluir, tras la sección "El caso", un **enlace a `/comunidad`** que invite a conocer a la comunidad (qué hace, su historia y sus logros), de modo que el contenido movido a `/comunidad` siga siendo alcanzable desde la portada en ≤1 clic.

#### Scenario: El landing dirige a la comunidad
- **WHEN** se observa el landing tras la sección "El caso"
- **THEN** existe un enlace que lleva a `/comunidad`
