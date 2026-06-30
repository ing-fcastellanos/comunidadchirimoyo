## ADDED Requirements

### Requirement: Selección de jornada en el formulario

El campo `jornada` del formulario de inscripción SHALL ofrecerse como una **selección de las próximas jornadas** cuando estas estén disponibles (derivadas de `content/jornadas/`), incluyendo una opción de "otra / disponibilidad general". Cuando no haya próximas jornadas, el campo SHALL **degradar** a un campo de texto libre. El valor enviado al API SHALL seguir siendo una **cadena** (el contrato del endpoint `POST /api/voluntarios` no cambia).

#### Scenario: Selección de una próxima jornada
- **WHEN** hay próximas jornadas y el usuario abre el formulario
- **THEN** el campo `jornada` ofrece esas jornadas como opciones (más "otra / disponibilidad general"), y al enviar se manda la opción elegida como texto

#### Scenario: Degradación sin jornadas
- **WHEN** no hay próximas jornadas disponibles
- **THEN** el campo `jornada` se muestra como texto libre y el envío sigue funcionando
