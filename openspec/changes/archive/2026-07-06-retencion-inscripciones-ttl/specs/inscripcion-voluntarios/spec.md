## MODIFIED Requirements

### Requirement: Política de retención de inscripciones

El proyecto SHALL definir y documentar una política de retención para `voluntarios_inscripciones` (ADR-0012): las inscripciones se conservan solo mientras sean útiles para organizar las jornadas y se borran pasado un umbral definido tras su creación. El umbral SHALL ser una **fuente única** de configuración compartida por los medios de borrado. El borrado SHALL estar **automatizado** mediante una política **TTL de Firestore**: cada inscripción SHALL sellar un campo timestamp `expira_en` = fecha de creación + umbral, y la política TTL (activada como configuración de Firestore, documentada) SHALL eliminar los documentos vencidos sin intervención humana. El servicio SHALL además conservar un **script de borrado de respaldo** (ejecutable con credenciales de servidor) que cubra los documentos sin `expira_en` y la latencia best-effort del TTL. El campo `expira_en` NO SHALL alterar el contrato del endpoint `POST /api/voluntarios`.

#### Scenario: Existe política, automatización y respaldo
- **WHEN** se revisa la capacidad de inscripción de voluntarios
- **THEN** existe una política de retención documentada, una política TTL de Firestore sobre `expira_en`, y un script de borrado de respaldo

#### Scenario: Cada inscripción sella su expiración
- **WHEN** se persiste una inscripción nueva
- **THEN** el documento incluye `expira_en` como timestamp igual a la fecha de creación más el umbral de retención

#### Scenario: Borrado automático de inscripciones vencidas
- **WHEN** el valor de `expira_en` de un documento queda en el pasado
- **THEN** la política TTL de Firestore elimina ese documento (best-effort) sin ejecutar el script manualmente

#### Scenario: Respaldo de borrado disponible
- **WHEN** se ejecuta el script de retención sobre inscripciones cuya antigüedad supera el umbral definido
- **THEN** esos documentos se eliminan de `voluntarios_inscripciones` y los vigentes se conservan
