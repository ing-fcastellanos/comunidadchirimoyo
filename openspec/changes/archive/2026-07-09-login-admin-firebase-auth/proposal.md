## Why

`apps/admin` (#138) está scaffoldeado con un route group `(authed)/` **vacío** — sin ningún gate. Antes de que exista cualquier CRUD (#140/#141), el panel necesita **login** ([ADR-0029](../../../docs/decisions/0029-auth-admin-firebase-auth.md)): un mecanismo simple de email/password, gestionado por Firebase Authentication, que proteja las rutas del panel sin que el proyecto tenga que construir ni mantener su propia infraestructura de identidad (issue #139).

## What Changes

- **Login** (`app/login`): pantalla email/password que llama `signInWithEmailAndPassword` del **Web SDK de Firebase directo** (nunca pasa por nuestro backend) y obtiene un `idToken`. Diseño pasa primero por **Claude Design** (mismo flujo que `/proteccion`, #78) antes de traducirse a código.
- **Intercambio de sesión** (`app/api/auth/session`, **Route Handler**, no Server Action): recibe `{ idToken }`, lo verifica (`verifyIdToken`) y crea una cookie de sesión (`createSessionCookie`, `expiresIn` 5 días) nombrada **`__session`** (httpOnly, `secure` en prod, `sameSite=lax`, `path=/`). El nombre es obligatorio: Firebase Hosting descarta cualquier otro nombre de cookie antes de proxiar a Cloud Run.
- **Cliente**: tras la respuesta OK, hace `window.location.href` (**reload completo**, nunca `router.push`/`redirect` de Next) para que la cookie httpOnly viaje en el siguiente request como navegación normal.
- **Gate real** en `apps/admin/app/(authed)/layout.tsx` (reemplaza el stub de #138): Server Component con `force-dynamic` que lee `__session` y llama `verifySessionCookie(cookie, checkRevoked=true)`; sin cookie válida, `redirect("/login")`. **No** se usa middleware.
- **Logout** (`app/api/auth/logout` o mismo route handler con otro método): limpia la cookie (`maxAge=0`) y revoca refresh tokens (`revokeRefreshTokens`) para que `checkRevoked` surta efecto de inmediato.
- **Placeholder autenticado** (`app/(authed)/page.tsx`): página mínima ("sesión activa" + botón de logout) — necesaria para demostrar el flujo de punta a punta, ya que hoy `(authed)/` no tiene ninguna página real (#140/#141 la reemplazan).
- **`apps/admin/lib/firebase-admin.ts`** (nuevo): init lazy singleton del Admin SDK por ADC (espejo de `apps/sitio/lib/firestore.ts`), exponiendo `getAdminAuth()`. Primera vez que `firebase-admin` entra a `apps/admin`.
- **`apps/admin/lib/firebase-client.ts`** (nuevo): init del Web SDK con las variables `NEXT_PUBLIC_FIREBASE_*` que #138 ya dejó documentadas.
- **Documentación de infra manual**: provisión de usuarios desde la consola de Firebase (sin auto-registro, ADR-0029); habilitar el proveedor email/password en el proyecto; y el hallazgo nuevo de este cambio — el service account runtime de Cloud Run necesita **`roles/iam.serviceAccountTokenCreator`** (sobre sí mismo) para que `createSessionCookie`/`verifyIdToken` puedan firmar vía la IAM API — **distinto** del `roles/datastore.user` ya anotado para Firestore. Ambos quedan para el runbook #144.

## No-goals

- **No** se construye ningún CRUD de noticias/jornadas (#140/#141) — el placeholder de `(authed)/page.tsx` es solo para probar el flujo.
- **No** hay RBAC: un solo rol, todos los usuarios del panel tienen el mismo acceso.
- **No** se implementa reset de contraseña self-service: con 1-2 personas y provisión manual, quien las provisiona resetea la contraseña directo desde la consola de Firebase.
- **No** se toca el API Flask ni las reglas de Firestore (`deny-all` preservado, ADR-0006/0012).
- **No** se aprovisiona nada en GCP/Firebase Console como parte del código de este cambio (habilitar el proveedor, crear el primer usuario, otorgar el rol IAM) — son pasos manuales documentados, no automatizados.

## Capabilities

### New Capabilities
- `auth-admin`: mecanismo de autenticación del panel `apps/admin` — login email/password vía Firebase Auth, sesión por cookie `__session` verificada server-side, gate en el layout del route group `(authed)`, y logout.

### Modified Capabilities
- `apps-admin`: el route group `(authed)/layout.tsx` deja de ser un stub y pasa a tener el gate de sesión real.

## Impact

- **Sub-dominios afectados:** admin.
- **Código (`apps/admin`):** `app/login/**`, `app/api/auth/session/route.ts`, `app/(authed)/layout.tsx` (gate real), `app/(authed)/page.tsx` (placeholder), `lib/firebase-admin.ts`, `lib/firebase-client.ts`.
- **Dependencias:** `firebase` (Web SDK) y `firebase-admin` (Admin SDK) se agregan a `apps/admin/package.json` — primera vez que este último entra a esta app.
- **Infra (manual, fuera de este PR):** proveedor email/password habilitado en el proyecto Firebase; primer usuario admin creado en la consola; rol `roles/iam.serviceAccountTokenCreator` al SA runtime de Cloud Run de `admin` (documentado para el runbook #144, junto con `roles/datastore.user` ya pendiente ahí).
- **Diseño:** la pantalla de login se diseña primero en Claude Design (proyecto "Guia aves chirimoyo"), reusando los primitivos existentes.
- **Sin** cambios en API, reglas Firestore, ni convenciones documentadas → **no requiere ADR nuevo** (implementa el ya aceptado ADR-0029).
