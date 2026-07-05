## MODIFIED Requirements

### Requirement: Contenido legal mínimo (LFPDPPP)

El aviso SHALL cubrir, como mínimo y de forma comprensible: identidad del responsable, datos personales que se recaban, finalidad del tratamiento, cómo se resguardan, **cuánto tiempo se conservan (retención)**, los derechos ARCO y cómo ejercerlos, la no transferencia a terceros, y la fecha de última actualización. La **retención** SHALL ser coherente con ADR-0012: los datos se conservan solo mientras son útiles para los fines descritos, y las inscripciones de voluntarios se borran pasado un tiempo razonable. El responsable SHALL identificarse como el colectivo **Comunidad Chirimoyo** con el medio de contacto **contacto@chirimoyo.org**.

#### Scenario: Secciones obligatorias presentes

- **WHEN** se publica el aviso
- **THEN** incluye secciones para responsable, datos recabados, finalidad, resguardo, **retención**, derechos ARCO (con medio de contacto), no transferencia y vigencia

#### Scenario: Coherencia con el manejo de PII

- **WHEN** el aviso describe el resguardo de los datos
- **THEN** es coherente con el ADR-0012: los datos no se registran en logs, el acceso es restringido y no hay cookies de rastreo

#### Scenario: Retención descrita

- **WHEN** el aviso describe cuánto tiempo se conservan los datos
- **THEN** indica que se guardan solo mientras son útiles y que las inscripciones se borran pasado un tiempo razonable, coherente con ADR-0012
