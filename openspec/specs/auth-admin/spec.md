# auth-admin Specification

## Purpose
TBD - created by archiving change login-admin-firebase-auth. Update Purpose after archive.
## Requirements
### Requirement: Login con Firebase Authentication

`apps/admin` SHALL ofrecer una pantalla de login (`app/login`) donde el usuario ingresa email y password. La autenticación de credenciales SHALL ocurrir **client-side** contra el Web SDK de Firebase Authentication (`signInWithEmailAndPassword`); el password NO SHALL transmitirse ni procesarse en ningún backend propio. NO SHALL existir auto-registro: los usuarios se provisionan manualmente desde la consola de Firebase.

#### Scenario: Login exitoso
- **WHEN** un usuario provisionado ingresa su email y password correctos
- **THEN** obtiene una sesión activa y accede a las rutas protegidas del panel

#### Scenario: Credenciales incorrectas
- **WHEN** el email o el password son incorrectos
- **THEN** se muestra un mensaje de error genérico (sin indicar cuál campo falló) y la sesión no se crea

#### Scenario: Sin auto-registro
- **WHEN** se inspecciona la pantalla de login
- **THEN** no existe ningún flujo de creación de cuenta nueva

### Requirement: Sesión por cookie `__session`

Tras un login exitoso, el sistema SHALL intercambiar el ID token de Firebase por una **cookie de sesión** (`createSessionCookie` del Admin SDK) mediante un **Route Handler** (`app/api/auth/session`), NO mediante una Server Action. La cookie SHALL llamarse exactamente **`__session`**, con `httpOnly`, `secure` en producción, `sameSite=lax` y una expiración de **5 días**. Tras recibir la confirmación, el cliente SHALL navegar mediante una **recarga completa de página** (`window.location.href`), NO mediante navegación del router de Next.

#### Scenario: Cookie de sesión creada
- **WHEN** el login es exitoso
- **THEN** el response set-cookie incluye una cookie `__session` httpOnly con expiración de 5 días

#### Scenario: Navegación por reload completo
- **WHEN** el cliente recibe la confirmación de sesión creada
- **THEN** navega mediante una recarga completa de página, no mediante el router de Next

### Requirement: Gate de sesión en el layout protegido

`apps/admin/app/(authed)/layout.tsx` SHALL verificar la sesión **server-side** en cada request (`export const dynamic = "force-dynamic"`), leyendo la cookie `__session` y validándola con `verifySessionCookie` (con verificación de revocación). Si la cookie está ausente o no es válida, SHALL redirigir a `/login`. Este chequeo NO SHALL implementarse en middleware.

#### Scenario: Acceso sin sesión
- **WHEN** se solicita una ruta bajo `(authed)/` sin una cookie `__session` válida
- **THEN** la respuesta redirige a `/login`

#### Scenario: Acceso con sesión válida
- **WHEN** se solicita una ruta bajo `(authed)/` con una cookie `__session` válida y no revocada
- **THEN** la página se renderiza normalmente

#### Scenario: Sesión revocada
- **WHEN** la sesión de un usuario fue revocada (p. ej. tras un logout forzado) pero su cookie aún no expiró
- **THEN** el gate la rechaza y redirige a `/login`

### Requirement: Logout

El sistema SHALL ofrecer un mecanismo de logout que limpie la cookie `__session` y revoque los refresh tokens del usuario (`revokeRefreshTokens`), de modo que la sesión quede inválida de inmediato para cualquier verificación posterior con `checkRevoked`.

#### Scenario: Logout invalida la sesión
- **WHEN** el usuario cierra sesión
- **THEN** la cookie se limpia y una verificación posterior de esa sesión (aunque no haya expirado) es rechazada

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
