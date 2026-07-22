# Desplegar admin.chirimoyo.org a producción

Runbook para publicar el panel de administración (`apps/admin` → `admin.chirimoyo.org`).
Cubre el issue [#144](https://github.com/ing-fcastellanos/comunidadchirimoyo/issues/144).

> `admin` es **Cloud Run + Docker** (ver [ADR-0015](../decisions/0015-sitio-cloud-run-us-central1.md)),
> igual que `sitio` — **no** es un export estático como `fauna`/`catalogo`
> ([ADR-0014](../decisions/0014-catalogo-export-estatico.md), que no aplica aquí).
> Firebase-native (ADR-0030): sin capa propia de API para su acceso a datos.

## Panorama

```
1. PREREQUISITOS   .env.production rellenado · roles IAM otorgados · env vars del
                    servicio Cloud Run configuradas · Firebase Console provisionado
2. DEPLOY           npm run deploy_prod   (docker:build → docker:push → gcloud run
                    deploy → firebase deploy)
3. SMOKE TEST       checklist manual en producción (sin script automatizado, ver
                    "Notas")
4. CIERRE           verificar dominio, marcar checklist del issue
```

Una sola máquina, un solo comando. No hay CI/CD de deploy automático
([ADR-0009](../decisions/0009-ci-checks-deploy-manual.md)): los deploys son manuales.
El CI de PR/push (`ci-frontend.yml`) ya cubre `admin` en su matrix desde el
issue #138 (lint + typecheck + build en cada PR) — no requiere cambios para este runbook.

## Arquitectura del deploy

```
apps/admin                              Artifact Registry          Cloud Run           Firebase Hosting
┌──────────────────────┐                (northamerica-south1)      (us-central1)       (site: admin-chirimoyo)
│ npm run deploy_prod    │                ┌──────────────────┐      ┌───────────┐        ┌─────────────────────┐
│  ├ docker:build         │──imagen──────▶│ containers/admin  │─────▶│ servicio  │◀──────│ rewrite ** → Cloud   │
│  ├ docker:push          │                └──────────────────┘      │ "admin"   │        │ Run "admin"          │
│  ├ gcloud run deploy    │                                          └───────────┘        │ → admin.chirimoyo.org│
│  └ firebase deploy      │                                                                └─────────────────────┘
└──────────────────────┘
```

`next build` corre dentro de la etapa `builder` del Dockerfile — por eso los
`NEXT_PUBLIC_FIREBASE_*` deben estar en `apps/admin/.env.production` (versionado,
placeholders vacíos por defecto) **antes** de correr `docker:build`, no se pueden
inyectar después vía variables de entorno del servicio Cloud Run.

## 1. Prerequisitos (una sola vez por máquina/proyecto)

### 1.1 Rellenar `apps/admin/.env.production`

El archivo ya existe versionado con los 6 `NEXT_PUBLIC_FIREBASE_*` vacíos (mismo
patrón que `apps/sitio/.env.production`/`apps/catalogo/.env.production` para su
token de Cloudflare). Son valores **públicos** por diseño — rellenarlos con la
config real desde Firebase Console → Project Settings → General → Your apps → Web
app, antes del primer `docker:build`.

### 1.2 Roles IAM del service account de Cloud Run

El servicio `admin` corre con el service account de cómputo por defecto del
proyecto (formato `<PROJECT_NUMBER>-compute@developer.gserviceaccount.com` — no
hay `--service-account` en `deploy_run`). Necesita estos 3 roles, otorgados
incrementalmente a lo largo de Fase 6:

| Rol IAM | Para qué | Síntoma si falta |
|---|---|---|
| `roles/iam.serviceAccountTokenCreator` (otorgado sobre sí mismo, #139) | Firmar `createSessionCookie`/`verifyIdToken` vía la IAM API (`signBlob`) | El login falla en producción con error de permisos (500); funciona en local con credenciales de usuario |
| `roles/datastore.user` (#140/#141) | Leer/escribir Firestore (`noticias`, `jornadas`) | El CRUD de noticias/jornadas falla en producción |
| `roles/storage.objectAdmin`, a nivel del bucket `comunidad-chirimoyo` (#142/#143) | Subir portadas de noticias a GCS | La subida de portada falla en producción; login/CRUD siguen funcionando con normalidad |

### 1.3 Env vars runtime del servicio Cloud Run

Estas **no** se hornean en el build de Docker (a diferencia de las
`NEXT_PUBLIC_FIREBASE_*`) — se leen en cada request. `deploy_run` no tiene
`--set-env-vars`, así que se configuran **una sola vez** por servicio:

```bash
gcloud run services update admin \
  --project=chirimoyo --region=us-central1 \
  --set-env-vars="SITIO_BASE_URL=https://chirimoyo.org,REVALIDATE_SECRET=<mismo valor que el Cloud Run de sitio>"
```

(O equivalente en la consola: Cloud Run → servicio `admin` → Editar y desplegar
nueva revisión → Variables y secretos.) `gcloud run deploy` conserva las env vars
ya configuradas en la revisión anterior en deploys subsecuentes que no las tocan.

| Env var | Valor | Si falta/desincroniza |
|---|---|---|
| `SITIO_BASE_URL` | `https://chirimoyo.org` | La revalidación on-demand del sitio tras publicar/editar/borrar falla (best-effort, la escritura en Firestore no se revierte — ver [README](../../apps/admin/README.md#revalidación-del-sitio)) |
| `REVALIDATE_SECRET` | Idéntico al configurado en el Cloud Run de `sitio` (secreto compartido) | Igual que arriba — la llamada de revalidación responde 401 |

### 1.4 Provisión manual en Firebase Console

1. Habilitar el proveedor **Email/Password** (Authentication → Sign-in method).
2. Crear el **primer usuario admin** (Authentication → Users → Add user) — no hay
   auto-registro, los usuarios se provisionan manualmente.

### 1.5 CI

El matrix de `ci-frontend.yml` ya incluye `admin` desde el issue #138 (lint +
typecheck + build en cada PR/push a main). No requiere ningún cambio para este
runbook — solo se confirma aquí que el checklist item "Checks de CI" del issue
#144 ya está satisfecho.

## 2. Deploy

Desde `apps/admin`, con 1.1–1.4 ya resueltos:

```bash
npm run deploy_prod
```

Esto encadena, en orden:

1. **`docker:build`** — `next build` (`output: "standalone"`) dentro de la etapa
   `builder`, imagen etiquetada `northamerica-south1-docker.pkg.dev/chirimoyo/containers/admin:latest`.
2. **`docker:push`** — sube la imagen a Artifact Registry (`northamerica-south1`).
3. **`gcloud run deploy admin`** — despliega en Cloud Run (`us-central1`,
   `--allow-unauthenticated` porque el gate de acceso vive en la propia app vía
   la cookie de sesión, no en IAM de Cloud Run).
4. **`firebase deploy --only hosting:prod`** — actualiza el rewrite `**` → Cloud
   Run `admin` en el site `admin-chirimoyo`.

## 3. Smoke test manual en producción

Sin script automatizado (ver "Notas"). Checklist a verificar en
`https://admin.chirimoyo.org`:

- [ ] **Login** con el usuario admin creado en 1.4 funciona (sin error 500 de permisos).
- [ ] **Crear** una noticia de prueba.
- [ ] **Publicar** la noticia y verificar que aparece en `chirimoyo.org/comunidad` tras la revalidación.
- [ ] **Subir una portada** a la noticia y verificar que se renderiza en el sitio.
- [ ] **Crear**, **editar** y **borrar** una jornada de prueba; verificar que los cambios se reflejan en `chirimoyo.org/voluntarios`.
- [ ] **Logout** funciona y bloquea el acceso a `/dashboard` sin sesión.

## 4. Cierre

- Marcar el checklist del issue [#144](https://github.com/ing-fcastellanos/comunidadchirimoyo/issues/144).
- Si algo del smoke test falla, **no** revertir el dominio: diagnosticar contra la
  tabla de roles IAM / env vars de la sección 1 (cada paso del smoke está atado a
  un requisito específico) y volver a desplegar tras corregir.

## Rollback

Firebase Hosting guarda versiones anteriores del rewrite, pero el contenido real
lo sirve Cloud Run. Para revertir:

- **Cloud Run**: consola → servicio `admin` → pestaña Revisiones → dirigir 100%
  del tráfico a la revisión anterior (sin necesidad de rebuild).
- **Firebase Hosting** (solo si el rewrite mismo cambió): consola → Hosting →
  site `admin-chirimoyo` → historial de versiones → Rollback.

## Notas

- **Smoke manual, no automatizado**: mismo criterio que `sitio` (ya en
  producción, tampoco tiene script de smoke) — el volumen de deploys esperado es
  bajo y no hay CI/CD de deploy que lo dispare automáticamente. Se puede
  reconsiderar si los deploys se vuelven frecuentes.
- **Solo producción** por ahora — no hay ambiente de QA ([ADR-0003](../decisions/0003-hosting-db-ambientes.md)).
- `fauna`/`aves` (`apps/catalogo`) son export estático, **no** Cloud Run — ver
  [desplegar-fauna-produccion.md](desplegar-fauna-produccion.md) para ese pipeline distinto.

## Referencias

- [ADR-0015](../decisions/0015-sitio-cloud-run-us-central1.md) — Cloud Run para `sitio`/`admin`.
- [ADR-0029](../decisions/0029-auth-admin-firebase-auth.md) — Firebase Auth para el login del panel.
- [ADR-0030](../decisions/0030-app-admin-firebase-native.md) — admin Firebase-native, sin API propio.
- [ADR-0009](../decisions/0009-ci-checks-deploy-manual.md) — deploys manuales.
- [apps/admin/README.md](../../apps/admin/README.md) — detalle histórico por issue de cada rol IAM/env var.
