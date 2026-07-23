## ADDED Requirements

### Requirement: Runbook de deploy a producción para apps/sitio y services/api
El proyecto SHALL proveer un runbook en `docs/guias/desplegar-sitio-produccion.md` que documente, de punta a punta, el redeploy real de `apps/sitio` y `services/api` a producción, incluyendo el orden correcto (api antes que sitio), la configuración de secrets SMTP vía Secret Manager, la configuración de los redirects vanity `comunidad.chirimoyo.org`/`voluntarios.chirimoyo.org`, y un checklist de verificación que confirme que ninguno de los dos sigue sirviendo el scaffold/stub original.

#### Scenario: Alguien redespliega sitio y api por primera vez desde el scaffold
- **WHEN** un desarrollador sigue el runbook para llevar `apps/sitio` y `services/api` a producción con el código actual
- **THEN** encuentra el orden correcto de deploy (api primero), los pasos para habilitar Secret Manager y dar de alta `MAIL_PASSWORD` como secret, los pasos para configurar los redirects vanity de `comunidad.*`/`voluntarios.*`, y un checklist que verifica explícitamente que `/api/contacto`/`/api/voluntarios` ya no responden `501` y que `chirimoyo.org` ya no sirve el placeholder de scaffold

### Requirement: Redirects vanity documentados como redirect plano
El runbook SHALL documentar que `comunidad.chirimoyo.org` y `voluntarios.chirimoyo.org` redirigen 301 a la raíz de su sección equivalente (`chirimoyo.org/comunidad`, `chirimoyo.org/voluntarios`) sin preservar subpath, consistente con el comportamiento real ya verificado de `aves.chirimoyo.org`.

#### Scenario: Alguien verifica el redirect vanity tras configurarlo
- **WHEN** alguien visita `comunidad.chirimoyo.org/cualquier-subpath` tras seguir el runbook
- **THEN** recibe un 301 hacia `chirimoyo.org/comunidad` (no hacia `chirimoyo.org/comunidad/cualquier-subpath`)
