## Context

`apps/admin` (#138) tiene `app/(authed)/layout.tsx` como **stub sin auth** — su propio comentario ya documenta dos restricciones de infra que este cambio debe honrar: la cookie de sesión debe llamarse exactamente `__session`, y el gate debe vivir en el layout (Server Component), no en middleware. El proyecto hermano `sociedadsalvaje/apps/admin` corre exactamente la misma topología (Next 15 + Firebase Hosting rewrite → Cloud Run) y ya construyó (con su propio backend JWT, no Firebase Auth) el patrón de sesión-por-cookie contra esa topología — sus decisiones de **infraestructura** (no las de su mecanismo de auth, que es propio) son un precedente directo y ya validado en producción.

Este cambio (#139) implementa el login real con **Firebase Authentication** (ADR-0029): email/password, sin auto-registro, gestionado por Firebase (hashing, rate-limiting, sesiones).

## Goals / Non-Goals

**Goals:**
- Login funcional que gatea `(authed)/` con sesión verificada server-side.
- Honrar las 4 restricciones de infraestructura de esta topología (3 conocidas + 1 nueva).
- Placeholder demostrable de punta a punta (login → página protegida → logout).

**Non-Goals:**
- CRUD, RBAC, reset de contraseña self-service, cambios al API Flask o reglas Firestore.

## Decisions

- **D1 — Sesión: `expiresIn` 5 días + `checkRevoked: true`.** `createSessionCookie(idToken, { expiresIn: 5 * 24 * 60 * 60 * 1000 })`; en cada verificación, `verifySessionCookie(cookie, /* checkRevoked */ true)`. Para un equipo de 1-2 personas y tráfico bajo, el costo extra de una llamada a la API de Firebase Auth por verificación es aceptable frente al beneficio de poder **forzar un logout inmediato** (`revokeRefreshTokens`) si alguien deja el equipo o se sospecha una sesión comprometida. Sin renovación automática: pasados 5 días, vuelve a `/login`. *Alternativa descartada:* `checkRevoked: false` (más barato, pero una cuenta revocada sigue "dentro" hasta que expire la cookie — inaceptable para un panel administrativo).

- **D2 — Placeholder `(authed)/page.tsx`.** Hoy no existe ninguna página real dentro del route group protegido; sin una, no hay forma de demostrar que el login+gate+logout funcionan de punta a punta. Página mínima: confirma sesión activa y ofrece logout. Se reemplaza por el dashboard real en #140/#141 sin cambiar la estructura de rutas.

- **D3 — Reset de contraseña fuera de alcance.** Queda como tarea manual (consola de Firebase) para quien provisiona usuarios, consistente con la provisión manual ya decidida en ADR-0029. Se documenta, no se construye UI.

- **D4 — Mensajes de error mapeados, no diseñados desde cero.** El SDK de Firebase Auth ya unifica `auth/invalid-credential` para email **o** password incorrectos (anti-enumeración nativo desde 2024) — el código solo traduce ese código (y `auth/too-many-requests`) a un mensaje en español; no hay lógica propia de seguridad que inventar aquí.

- **D5 — `apps/admin/lib/firebase-admin.ts` espeja `apps/sitio/lib/firestore.ts`.** Init lazy singleton por ADC (`applicationDefault()`), cacheado en `globalThis` contra el hot-reload de Next, sin llave JSON. Expone `getAdminAuth()` (de `firebase-admin/auth`), igual patrón que `getDb()` expone Firestore. `apps/admin/lib/firebase-client.ts` inicializa el Web SDK con las variables `NEXT_PUBLIC_FIREBASE_*` que #138 ya dejó documentadas — primera vez que se usan de verdad.

- **D6 — Route Handler + `fetch()` + reload completo, NUNCA Server Action + `redirect()`.** El patrón "Server Action + `cookies().set()` + `redirect()`" tiene un bug **ya documentado y vivido** por `sociedadsalvaje/apps/admin` en esta topología exacta (Next 15 + Firebase Hosting rewrites a Cloud Run): produce un **loop de redirect a `/login`** porque el siguiente request (vía RSC fetch con el header `Next-Action`) no procesa la cookie igual que una navegación nativa. La solución que ya probaron y que este cambio adopta: el form hace `fetch("/api/auth/session", { method: "POST" })`, el handler responde JSON `{ ok, redirectTo, error }`, y el cliente hace `window.location.href = redirectTo` — un reload completo garantiza que el browser envíe la cookie en el siguiente request como navegación normal.

- **D7 — Restricción de infra nueva: `roles/iam.serviceAccountTokenCreator`.** `createSessionCookie` (y `createCustomToken`) usan la IAM API para **firmar** el token (`signBlob`); el service account runtime de Cloud Run necesita ese rol **sobre sí mismo**. Sin él, la operación falla en producción con un error de permiso IAM — aunque funcione en local, donde `gcloud auth application-default login` suele traer credenciales de usuario con permisos más amplios. Es un rol **distinto** del `roles/datastore.user` que ya estaba anotado para Firestore (#134/#144) — ambos IAM grants quedan documentados para el runbook #144, no son código de este cambio. Fuente: [Firebase IAM permissions](https://firebase.google.com/docs/projects/iam/permissions), [Create Custom Tokens](https://firebase.google.com/docs/auth/admin/create-custom-tokens).

- **D8 — Diseño visual vía Claude Design primero.** La pantalla de login se construye primero en el proyecto "Guia aves chirimoyo" de Claude Design (mismo flujo que `/proteccion`, #78): leer `components/_shared.jsx` para reusar los primitivos (`Section`, `Badge`, `Icon`), armar el mockup como par componente+arnés HTML con datos de ejemplo, y solo después traducirlo a `apps/admin/app/login/` — con el ajuste de convención de íconos (kebab-case del mockup → PascalCase de `lucide-react` en código real, mismo ajuste que ya se hizo en `/proteccion`). El placeholder de `(authed)/page.tsx` (D2) no requiere este tratamiento — es utilitario, no una superficie de marca.

## Risks / Trade-offs

- **`checkRevoked: true` en cada request** añade latencia (llamada a Firebase Auth) a cada navegación del panel — aceptable a este volumen; reconsiderar si el panel crece en tráfico.
- **IAM nuevo, fácil de olvidar** (D7) — sin él, el login parece funcionar en dev/local (ADC de usuario) y falla recién en producción; documentado explícito para no repetir el patrón de sorpresa que ya tuvimos con el índice compuesto de Firestore.
- **Un solo intento de "Server Action" ya está descartado por evidencia real** (D6) — no es una preferencia estética, es evitar reintroducir un bug ya conocido.
- **Sin refresh de sesión** (D1) — un uso activo del panel puede cortarse a mitad de una edición larga si pasan los 5 días; aceptable para un panel de baja frecuencia de uso, reconsiderar si se vuelve fricción real.
