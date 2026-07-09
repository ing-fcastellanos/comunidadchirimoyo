# apps/admin

Panel de administración de Comunidad Chirimoyo en **admin.chirimoyo.org**. Next.js 15 (App Router) · TypeScript · Tailwind v4. `output: "standalone"` → **Cloud Run** (ADR-0015). Firebase-native (ADR-0030): sin API propio para su acceso a datos — el API Flask (`services/api`) permanece mínimo (ADR-0006).

## Comandos

```bash
npm install
npm run dev            # :3002 (ver .claude/launch.json)
npm run build          # standalone
npm run typecheck && npm run lint
npm run sync:tokens    # regenera app/tokens.css desde docs/design-system/
npm run deploy_prod    # docker build/push → Cloud Run 'admin' → firebase deploy (rewrite)
```

## Autenticación (Firebase Auth, ADR-0029)

Login email/password vía Firebase Authentication. **Sin auto-registro**: los usuarios se provisionan manualmente. Antes del primer login:

1. **Habilitar el proveedor Email/Password** en el proyecto Firebase (Authentication → Sign-in method).
2. **Crear el primer usuario admin** desde la consola de Firebase (Authentication → Users → Add user).
3. Rellenar `NEXT_PUBLIC_FIREBASE_*` en `.env.local` (ver `.env.example`) con la config del Web SDK del proyecto.

Reset de contraseña: no hay flujo self-service en esta versión (issue #139, decisión D3) — quien administra el panel resetea la contraseña de un usuario directo desde la consola de Firebase.

### Sesión: cookie `__session`

El login intercambia el `idToken` de Firebase por una **cookie de sesión** (`__session`, `createSessionCookie`, 5 días, `checkRevoked: true` en cada verificación). El nombre `__session` es obligatorio: Firebase Hosting descarta cualquier otro nombre de cookie antes de proxiar el request a Cloud Run. El gate de sesión vive en `app/(authed)/layout.tsx` (Server Component, `force-dynamic`) — deliberadamente **no** en middleware, por los quirks de Edge Runtime + cacheo de redirects que ya documentó el proyecto hermano (`sociedadsalvaje/apps/admin`) en esta misma topología.

### IAM requerido en Cloud Run (para el runbook #144)

El service account runtime del servicio Cloud Run `admin` necesita **`roles/iam.serviceAccountTokenCreator`** (otorgado sobre sí mismo) para que `createSessionCookie`/`verifyIdToken` puedan firmar vía la IAM API (`signBlob`). Sin este rol, el login falla en producción con un error de permisos aunque funcione en local (donde `gcloud auth application-default login` suele traer credenciales de usuario más amplias). Es un rol **distinto** del `roles/datastore.user` que ya necesita el SA de `sitio`/`admin` para Firestore (#134).

Referencias: [Firebase IAM permissions](https://firebase.google.com/docs/projects/iam/permissions), [Create Custom Tokens](https://firebase.google.com/docs/auth/admin/create-custom-tokens).

## Hosting

`firebase.json` usa el target `prod` → site **`admin-chirimoyo`** (ya existente), rewrite `**` → Cloud Run `admin` en **`us-central1`** (Firebase Hosting no soporta rewrites a `northamerica-south1` — ADR-0015). DNS de `admin.chirimoyo.org` en Porkbun (fuera del repo).
