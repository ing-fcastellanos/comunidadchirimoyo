# Tasks — login-admin-firebase-auth (issue #139)

## 1. Diseño (Claude Design, antes de código)

- [x] 1.1 En el proyecto "Guia aves chirimoyo" de Claude Design: leer `components/_shared.jsx` para confirmar los primitivos disponibles (`Section`, `Badge`, `Icon`, tokens/colores) — mismo punto de partida que `/proteccion` (#78).
- [x] 1.2 Construir el mockup de `Login` (componente + arnés HTML de demo) en Claude Design: campos email/password, estado de error, botón de submit con estado de carga. Sin lorem ipsum — copy real en español.
- [x] 1.3 Revisar el mockup con el usuario antes de traducir a código.

## 2. Dependencias + init

- [x] 2.1 Agregar `firebase` (Web SDK) y `firebase-admin` (Admin SDK) a `apps/admin/package.json`.
- [x] 2.2 `apps/admin/lib/firebase-client.ts` — inicializa el Web SDK leyendo `NEXT_PUBLIC_FIREBASE_*`; expone `getFirebaseAuth()` (cliente) para usar en el form de login.
- [x] 2.3 `apps/admin/lib/firebase-admin.ts` — init lazy singleton del Admin SDK por ADC (espejo de `apps/sitio/lib/firestore.ts`, guarda de hot-reload); expone `getAdminAuth()`.

## 3. Login (traducido del mockup)

- [x] 3.1 `apps/admin/app/login/page.tsx` + form (client component) — recreando el mockup de Claude Design con los primitivos reales (`Icon` en PascalCase, ajustando la convención del mockup). Llama `signInWithEmailAndPassword` del Web SDK, obtiene el `idToken`.
- [x] 3.2 Mapeo de errores de Firebase Auth (`auth/invalid-credential`, `auth/too-many-requests`, etc.) a mensajes en español, sin distinguir cuál campo falló.
- [x] 3.3 Tras éxito: `fetch` a `/api/auth/session` con el `idToken`; en la respuesta OK, `window.location.href` (reload completo) al destino. **No** usar Server Action ni `router.push`.

## 4. Intercambio de sesión (Route Handler)

- [x] 4.1 `apps/admin/app/api/auth/session/route.ts` — `POST`: recibe `{ idToken }`, `verifyIdToken`, `createSessionCookie(idToken, { expiresIn: 5 días })`, setea cookie **`__session`** (`httpOnly`, `secure` en prod, `sameSite=lax`, `path=/`, `maxAge` acorde). Responde `{ ok, redirectTo }` o `{ ok: false, error }`.
- [x] 4.2 Mismo route — `DELETE`/logout: limpia la cookie `__session` (`maxAge=0`) y `revokeRefreshTokens(uid)` (decodifica el `uid` de la cookie antes de limpiarla).

## 5. Gate real + placeholder

- [x] 5.1 `apps/admin/app/(authed)/layout.tsx` — reemplaza el stub: `export const dynamic = "force-dynamic"`, lee `__session` vía `lib/session.ts`, `verifySessionCookie(cookie, true)`; si falta/inválida, `redirect("/login")`.
- [x] 5.2 **Ajuste de ruta** (encontrado en implementación): el placeholder autenticado vive en `apps/admin/app/(authed)/dashboard/page.tsx`, no en `(authed)/page.tsx` — ese path colisionaría con el `app/page.tsx` público de #138 (los route groups no agregan segmento a la URL; ambos mapearían a `/`). Mismo destino (`/dashboard`) que usa el proyecto hermano tras el login. Confirma sesión activa (email) + botón de logout (`app/(authed)/logout-button.tsx`, llama al `DELETE` de 4.2, luego `window.location.href` a `/login`).

## 6. Documentación de infra manual (no es código)

- [x] 6.1 Nota en `apps/admin/README.md`: habilitar el proveedor email/password en el proyecto Firebase; crear el primer usuario admin desde la consola (sin auto-registro, ADR-0029); reset de contraseña no self-service (D3).
- [x] 6.2 Anotado en `apps/admin/README.md` (sección IAM) para el runbook #144: el SA runtime de Cloud Run de `admin` necesita `roles/iam.serviceAccountTokenCreator` (sobre sí mismo) para `createSessionCookie`/`verifyIdToken` — distinto del `roles/datastore.user` ya pendiente para Firestore.

## 7. Verificación

- [x] 7.1 `npm run typecheck` y `npm run build` de `apps/admin` en verde.
- [x] 7.2 Con un usuario de prueba (Firebase Auth emulator o proyecto real): login exitoso → cookie `__session` presente → `(authed)/` accesible y muestra el email.
- [x] 7.3 Login con credenciales incorrectas → mensaje de error genérico, sin sesión creada.
- [x] 7.4 Acceso directo a `(authed)/` sin sesión → redirige a `/login`.
- [x] 7.5 Logout → cookie limpiada y sesión revocada; un acceso posterior a `(authed)/` con la cookie vieja (si el navegador aún la retuviera) es rechazado por `checkRevoked`.
- [x] 7.6 Confirmar que el flujo usa `window.location.href` (no navegación de router) tras login/logout.
