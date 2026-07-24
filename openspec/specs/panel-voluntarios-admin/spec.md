# panel-voluntarios-admin Specification

## Purpose
TBD - created by archiving change voluntarios-suscripcion-panel-admin. Update Purpose after archive.
## Requirements
### Requirement: Vista de voluntarios inscritos en el panel
`apps/admin` SHALL ofrecer una sección que liste los voluntarios inscritos (`voluntarios_inscripciones`), leyendo server-side vía Firebase Admin SDK (deny-all para client SDK, mismo patrón que noticias/jornadas). La vista SHALL mostrar, por cada voluntario, al menos: nombre, correo, teléfono, jornada, fecha de inscripción, estado de suscripción, y si ya fue contactado.

#### Scenario: Se listan los voluntarios
- **WHEN** un usuario autenticado del panel abre la sección de voluntarios
- **THEN** ve la lista de inscripciones con sus datos básicos y estado de suscripción/contacto

#### Scenario: Sin sesión no hay acceso
- **WHEN** alguien sin sesión válida intenta acceder a la sección de voluntarios
- **THEN** es redirigido a `/login`, igual que el resto del panel

### Requirement: Filtros de la vista de voluntarios
La vista SHALL permitir filtrar por jornada, por estado de suscripción, y por si el voluntario ya fue contactado.

#### Scenario: Filtrar por estado de suscripción
- **WHEN** se aplica el filtro de "no suscritos"
- **THEN** la lista muestra solo los voluntarios con `suscrito` distinto de `true`

### Requirement: Log de contactos por voluntario
Cada voluntario SHALL tener un log de contactos (subcolección `voluntarios_inscripciones/{id}/contactos`), donde el panel permite agregar una entrada nueva (quién de staff contactó, cuándo, y una nota) y ver el historial completo de contactos previos. Un voluntario SHALL poder tener múltiples entradas de contacto a lo largo del tiempo.

#### Scenario: Se agrega un contacto nuevo
- **WHEN** un usuario del panel registra un contacto con una nota para un voluntario
- **THEN** se crea una nueva entrada en la subcolección de contactos de ese voluntario, con el usuario autenticado y la fecha del servidor

#### Scenario: Se ve el historial completo
- **WHEN** se abre el detalle de un voluntario con contactos previos
- **THEN** se muestran todas las entradas de contacto en orden, no solo la más reciente

### Requirement: Alternar suscripción manualmente
El panel SHALL permitir alternar el campo `suscrito` de un voluntario manualmente, para los casos en que alguien pide darse de baja (o de alta) sin usar el link del correo.

#### Scenario: Un admin desuscribe manualmente
- **WHEN** un usuario del panel alterna el estado de suscripción de un voluntario a "no suscrito"
- **THEN** el campo `suscrito` de ese documento queda en `false` y no vuelve a recibir el resumen semanal

### Requirement: Exportación a CSV filtrada
El panel SHALL ofrecer una exportación a CSV de los voluntarios que respete los filtros activos en la vista (no siempre el universo completo). El CSV SHALL incluir los datos de inscripción, el estado de suscripción, la fecha del último contacto y el total de contactos — y NO SHALL incluir el texto de las notas de contacto (se mantiene el export al mínimo necesario, ADR-0012).

#### Scenario: Exportar con filtros aplicados
- **WHEN** se exporta a CSV con el filtro de una jornada específica activo
- **THEN** el CSV contiene solo los voluntarios de esa jornada, no todos los inscritos

#### Scenario: El CSV no incluye notas de contacto
- **WHEN** se exporta a CSV un voluntario con contactos registrados
- **THEN** el CSV incluye la fecha del último contacto y el total de contactos, pero no el texto de ninguna nota
