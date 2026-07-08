# ADR-0029 — Autenticación del panel admin con Firebase Authentication

- **Estado:** Accepted
- **Fecha:** 2026-07-08
- **Decisores:** @ing-fcastellanos
- **Issue:** [#133](https://github.com/ing-fcastellanos/comunidadchirimoyo/issues/133)

## Contexto

El panel de administración ([ADR-0030](0030-app-admin-firebase-native.md)) necesita **autenticación**: hasta hoy el proyecto **no tiene auth de usuarios** ([ADR-0006](0006-api-minima.md) la excluía explícitamente). Se requiere un **login simple user/pass** para 1-2 personas del equipo, que sea seguro (hashing, sesiones, protección anti-fuerza-bruta, reset) **sin construir infraestructura de identidad propia**. El proyecto ya vive en GCP/Firebase.

## Decisión

Usar **Firebase Authentication** con el proveedor **email/password**. Los usuarios se **provisionan manualmente** (consola de Firebase); **no** hay auto-registro. La app admin (Next) autentica con Firebase Auth; las operaciones server-side **verifican la sesión / ID token** antes de escribir con el Admin SDK. **Sin RBAC**: todos los usuarios del panel tienen el mismo rol editor.

Esta es una **excepción acotada al panel** frente a ADR-0006: el API público (inscripciones, contacto) sigue **sin** auth de usuarios.

## Alternativas consideradas

- **Auth propia (bcrypt + JWT en Flask o Next):** control total, pero reinventa código crítico de seguridad (hashing, rotación de tokens, rate-limiting, reset) y amplía superficie y mantenimiento.
- **OAuth con Google (solo cuentas del equipo):** viable, pero el requisito es "user/pass simple" y no todos en el equipo tienen Google Workspace; email/password es más directo.
- **Basic Auth / password compartido en variable de entorno:** frágil, sin identidad por persona, sin reset ni auditoría. Descartado.

## Consecuencias

### Positivas

- Seguridad **gestionada** (hashing, tokens, rate-limiting, reset) sin escribir código sensible.
- **Identidad por persona** (no un password compartido).
- Encaja con GCP/Firebase; rápido y gratis a esta escala.

### Negativas

- Dependencia de Firebase Auth como proveedor de identidad.
- Provisión **manual** de usuarios (aceptable con un equipo de 1-2; sin panel de gestión de usuarios).
- Introduce el **primer sistema de auth** del proyecto → nueva superficie de ataque que exige un security review.

### Neutras

- Sin RBAC por ahora (un solo rol); si crece el equipo se reevalúa.
- Los usuarios se gestionan fuera del repo (consola Firebase).

## Plan de revisión

Añadir **RBAC** o **MFA** si crece el equipo o el alcance del panel; reconsiderar el proveedor si aparece necesidad de SSO corporativo.

## Referencias

- Habilita [ADR-0030](0030-app-admin-firebase-native.md); acota la exclusión de auth de [ADR-0006](0006-api-minima.md) al panel.
- Relacionado con [ADR-0012](0012-privacidad-datos-voluntarios.md) (nueva superficie sobre datos).
- Épica [#133](https://github.com/ing-fcastellanos/comunidadchirimoyo/issues/133).
