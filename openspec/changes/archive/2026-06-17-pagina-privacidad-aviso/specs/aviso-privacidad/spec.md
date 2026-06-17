## ADDED Requirements

### Requirement: Página de aviso de privacidad publicada

El sitio `apps/sitio` SHALL servir una página estática en la ruta `/privacidad` que muestre el aviso de privacidad del proyecto. La página SHALL renderizarse como Server Component sin llamar al API.

#### Scenario: La ruta /privacidad responde

- **WHEN** una persona visita `/privacidad`
- **THEN** recibe una página con estado 200 que muestra el aviso de privacidad (título, fecha de actualización y secciones)

#### Scenario: Los enlaces sembrados dejan de dar 404

- **WHEN** una persona sigue el enlace "Aviso de privacidad" del Footer o el enlace "aviso de privacidad" de la casilla de consentimiento del formulario de contacto
- **THEN** llega a `/privacidad` y ya no obtiene un 404

### Requirement: Contenido del aviso versionado en content/

El aviso de privacidad SHALL vivir en `content/landing/privacidad.md` como markdown con frontmatter, y SHALL renderizarse mediante el patrón de secciones existente (separación por encabezados `## H2`), sin introducir dependencias nuevas de renderizado de markdown.

#### Scenario: El contenido se lee desde content/

- **WHEN** se edita el texto de una sección en `content/landing/privacidad.md`
- **THEN** el cambio se refleja en `/privacidad` sin modificar código de la página

#### Scenario: Marca de borrador visible

- **WHEN** el frontmatter del aviso tiene `estado: borrador`
- **THEN** la página comunica que el aviso es un borrador pendiente de revisión y no un texto jurídicamente definitivo

### Requirement: Contenido legal mínimo (LFPDPPP)

El aviso SHALL cubrir, como mínimo y de forma comprensible: identidad del responsable, datos personales que se recaban, finalidad del tratamiento, cómo se resguardan, los derechos ARCO y cómo ejercerlos, la no transferencia a terceros, y la fecha de última actualización. El responsable SHALL identificarse como el colectivo **Comunidad Chirimoyo** con el medio de contacto **contacto@chirimoyo.org**.

#### Scenario: Secciones obligatorias presentes

- **WHEN** se publica el aviso
- **THEN** incluye secciones para responsable, datos recabados, finalidad, resguardo, derechos ARCO (con medio de contacto), no transferencia y vigencia

#### Scenario: Coherencia con el manejo de PII

- **WHEN** el aviso describe el resguardo de los datos
- **THEN** es coherente con el ADR-0012: los datos no se registran en logs, el acceso es restringido y no hay cookies de rastreo

### Requirement: Única fuente de verdad reutilizable

La página `/privacidad` SHALL ser la única fuente de verdad del aviso de privacidad del proyecto, enlazada desde los formularios que recaban PII. Otros formularios (p. ej. inscripción de voluntarios en Fase 4) SHALL enlazar a esta misma página en lugar de duplicar el aviso.

#### Scenario: Reutilización por formularios futuros

- **WHEN** un formulario que recaba PII necesita mostrar el aviso de privacidad
- **THEN** enlaza a `/privacidad` y no incrusta una copia del texto
