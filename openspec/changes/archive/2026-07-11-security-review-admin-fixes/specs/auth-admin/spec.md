## ADDED Requirements

### Requirement: Validación del destino de redirección tras el login

El Route Handler de sesión (`app/api/auth/session`) SHALL validar cualquier `redirectTo` recibido en el cuerpo del POST antes de incluirlo en la respuesta: SHALL aceptarlo únicamente si es una ruta relativa que empieza con un solo `/` (NO `//` ni `/\`, que los navegadores pueden interpretar como una URL absoluta a otro origen). Un `redirectTo` ausente o inválido SHALL resolverse al valor por defecto (`/dashboard`).

#### Scenario: redirectTo ausente
- **WHEN** el POST de login no incluye `redirectTo`
- **THEN** la respuesta indica `/dashboard` como destino

#### Scenario: redirectTo relativo válido
- **WHEN** el POST incluye `redirectTo: "/noticias"`
- **THEN** la respuesta lo acepta tal cual

#### Scenario: redirectTo protocol-relative rechazado
- **WHEN** el POST incluye `redirectTo: "//evil.com"` o `redirectTo: "/\evil.com"`
- **THEN** la respuesta ignora ese valor y resuelve a `/dashboard`
