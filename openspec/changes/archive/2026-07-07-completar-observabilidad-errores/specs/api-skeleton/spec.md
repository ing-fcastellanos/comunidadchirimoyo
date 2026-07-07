## MODIFIED Requirements

### Requirement: Logging estructurado sin PII

El servicio SHALL emitir logs en JSON a stdout (para Cloud Logging) y NO SHALL loguear los
cuerpos de las peticiones de voluntarios/contacto (contienen datos personales). El scaffold
SHALL documentar esta regla y proveer un helper de logging que solo acepte campos no sensibles.
El servicio SHALL registrar un manejador global de excepciones no capturadas
(`@app.errorhandler(Exception)`) que responda un JSON de error genérico con código 500 y registre
el evento vía el helper de logging, incluyendo el **tipo** de la excepción (p. ej.
`type(exc).__name__`) pero nunca su mensaje ni traceback completo, para evitar fugas accidentales
de datos en los argumentos de la excepción. Los manejadores de ruta que ya capturan excepciones
localmente (contacto, voluntarios) SHALL incluir igualmente el tipo de excepción en su log.

#### Scenario: No se loguea PII

- **WHEN** ocurre cualquier evento logueado por el servicio
- **THEN** los logs registran el evento/metadatos pero nunca el cuerpo con PII (ADR-0012)

#### Scenario: Excepción no capturada por ninguna ruta

- **WHEN** una excepción no manejada ocurre fuera de los bloques `try/except` de los controladores (p. ej. en una ruta futura, o en código común)
- **THEN** el manejador global la captura, responde JSON `{"error": "..."}` con código 500
- **AND** el log del evento incluye el tipo de la excepción, sin su mensaje ni traceback

#### Scenario: Excepción capturada localmente incluye su tipo

- **WHEN** falla la persistencia de un mensaje de contacto o una inscripción de voluntario (excepción capturada por el `try/except` del controlador)
- **THEN** el `log_event` correspondiente incluye el tipo de la excepción además del nombre del evento
- **AND** la respuesta al cliente sigue siendo el mensaje genérico existente, sin detalle interno
