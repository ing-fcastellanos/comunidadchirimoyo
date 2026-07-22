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

## Noticias (CRUD, #140)

CRUD de noticias sobre la colección Firestore `noticias` (ADR-0028), vía server actions + Firebase Admin SDK (`lib/firestore.ts`, mismo patrón lazy-singleton que `lib/firebase-admin.ts`). El SA runtime de Cloud Run necesita **`roles/datastore.user`** (el mismo rol que ya usa `sitio`, distinto del `serviceAccountTokenCreator` de arriba).

### Revalidación del sitio

Al crear/editar/despublicar/borrar una noticia que **es o fue** `publicado`, el admin llama `POST {SITIO_BASE_URL}/api/revalidate` (endpoint ya expuesto por `apps/sitio`) con `Authorization: Bearer {REVALIDATE_SECRET}`. **`REVALIDATE_SECRET` debe ser idéntico** al configurado en `apps/sitio` — es un secreto compartido entre las dos apps. Si la llamada falla (secreto desincronizado, sitio caído, red), la escritura en Firestore **no se revierte**: es best-effort, y el `revalidate: 3600` del sitio corrige la mayoría de los casos igual. Ver `.env.example` para `SITIO_BASE_URL`/`REVALIDATE_SECRET`.

## Subida de portadas a GCS (#142)

La imagen de portada de una noticia se sube desde el propio formulario de edición (`/noticias/{slug}/editar`) vía `POST /api/noticias/{slug}/portada` (Route Handler, no Server Action ni signed URL — evita el límite de 1MB de Server Actions y no requiere configurar CORS en el bucket). El archivo se guarda en `noticias/{slug}-portada.<ext>` dentro del bucket `comunidad-chirimoyo` (ADR-0021); una re-subida sobreescribe el objeto anterior. El endpoint **solo sube el archivo**: la ruta resultante se persiste en Firestore como cualquier otro campo, al guardar el formulario (`actualizarNoticia`), no desde el propio endpoint.

El SA runtime de Cloud Run necesita **`roles/storage.objectAdmin`**, otorgado **a nivel del bucket `comunidad-chirimoyo`** (no a nivel de proyecto) — rol nuevo, distinto de `serviceAccountTokenCreator` (Auth) y `datastore.user` (Firestore). Sin este rol, la subida falla en producción con un error de permisos aunque el login/CRUD de noticias funcionen con normalidad.

Solo se aceptan imágenes JPEG/PNG/WebP de hasta 5MB; no hay optimización ni conversión automática (sigue siendo responsabilidad editorial, ver `content/noticias/README.md`). El objeto de una noticia borrada **no** se borra del bucket (limpieza manual si hace falta, mismo criterio que el resto del proyecto).

## Hosting

`firebase.json` usa el target `prod` → site **`admin-chirimoyo`** (ya existente), rewrite `**` → Cloud Run `admin` en **`us-central1`** (Firebase Hosting no soporta rewrites a `northamerica-south1` — ADR-0015). DNS de `admin.chirimoyo.org` en Porkbun (fuera del repo).

## Deploy a producción (#144)

Runbook completo, de punta a punta (prerequisitos, roles IAM, env vars del servicio Cloud Run, provisión en Firebase Console, pasos de deploy, smoke test): [docs/guias/desplegar-admin-produccion.md](../../docs/guias/desplegar-admin-produccion.md). Las secciones de arriba documentan el *por qué* de cada rol/env var por issue; el runbook es la fuente de verdad del *cómo*, en orden.
