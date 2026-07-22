## Context

`apps/admin` (Fase 6, #138-#143) se construyó y verificó enteramente contra emulators (Firestore/Auth) y, para la subida de portadas, contra el bucket real de GCS — pero **nunca contra un deploy real a Cloud Run**. El conocimiento operativo (roles IAM, env vars, pasos de Firebase Console) quedó documentado, correctamente, pero **disperso**: cada sección del README de `apps/admin` lo agregó por separado a medida que cada issue lo necesitaba (#139 para Auth, #140/#141 para Firestore, #142 para GCS). Nadie había intentado ensamblar esas piezas en un solo flujo de deploy de punta a punta hasta la exploración de #144 — que fue cuando apareció el hallazgo de `.env.production`.

`apps/sitio` y `apps/catalogo` ya tienen precedente para dos patrones distintos: fauna es export estático (sin Cloud Run, runbook ya existe) y sitio es Cloud Run + Docker igual que admin, pero **sitio tampoco tiene un runbook propio** — solo su `.env.production` (para el token de Cloudflare). Este cambio construye el primer runbook Cloud Run+Docker del proyecto, usando el de fauna como referencia de formato, no de contenido técnico.

## Goals / Non-Goals

**Goals:**
- Cerrar el hueco de `.env.production` antes de que alguien intente el primer deploy real y se encuentre con un Firebase Web SDK roto en producción.
- Consolidar en un solo documento todo lo que hace falta ANTES de desplegar (IAM, env vars, Firebase Console) y los pasos del deploy en sí.
- Confirmar (no inventar) que el CI ya cubre `admin`.

**Non-Goals:**
- CI/CD automático — ADR-0009 se preserva, los deploys siguen siendo manuales.
- Un script de smoke test automatizado — se decidió explícitamente un checklist manual (D4), coherente con el bajo volumen del proyecto y el precedente de que ni siquiera `sitio` (ya en producción) tiene uno.
- Cambiar el Dockerfile, `firebase.json`, `.firebaserc` o los scripts `deploy_run`/`deploy_prod` — ya están correctos, el problema era la ausencia de `.env.production`, no el pipeline en sí.
- Rellenar `apps/admin/.env.production` con valores reales — el asistente no tiene las credenciales de Firebase de producción; el archivo se crea con placeholders vacíos, igual que `.env.example`, y el usuario los completa antes de desplegar.

## Decisions

### D1 — Crear `apps/admin/.env.production` con placeholders

Mismo patrón que `apps/sitio/.env.production` y `apps/catalogo/.env.production` (ambos ya cubiertos por la excepción `!apps/*/.env.production` del `.gitignore` raíz — verificado, sin cambios necesarios ahí). Contiene los 6 `NEXT_PUBLIC_FIREBASE_*` con valor vacío y un comentario explicando de dónde sacarlos (Firebase Console → Project Settings → General → Your apps → Web app) y que **son públicos por diseño** (viajan en el JS del navegador, no son secretos de servidor) — mismo razonamiento ya presente en `.env.example`.

**Alternativa descartada:** pasar estos valores como Docker build-args (`--build-arg`) en vez de un archivo versionado. Rechazada: introduce una superficie nueva (modificar `Dockerfile` + `docker:build` script) para resolver exactamente el mismo problema que el patrón ya establecido (`*.env.production`) resuelve con cero código nuevo — inconsistente con el resto del monorepo sin ninguna ventaja real, dado que estos valores son públicos de cualquier forma.

### D2 — Runbook nuevo, formato de fauna, contenido de Cloud Run+Docker

`docs/guias/desplegar-admin-produccion.md` reusa la estructura de `desplegar-fauna-produccion.md` (panorama con diagrama ASCII, prerequisitos, deploy, smoke, cierre, rollback, referencias) pero el diagrama y los pasos reflejan el pipeline real de `admin`:

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

**Alternativa descartada:** copiar el runbook de `sitio` como base. Rechazada: `sitio` no tiene runbook propio todavía — no hay nada que copiar; `fauna` sí tiene uno completo y bien probado, aunque su pipeline técnico (export estático) sea distinto, así que se reusa su *forma*, no su contenido técnico.

### D3 — Consolidar IAM/env vars/Firebase Console en el runbook, README enlaza sin duplicar

El runbook se convierte en la fuente de verdad operativa (el "cómo", en orden, de punta a punta); el README conserva sus secciones actuales (documentan el "por qué" de cada rol/env var, con contexto histórico por issue — útil para entender decisiones pasadas) y gana un enlace explícito. Tabla consolidada en el runbook:

| Rol IAM | Para qué | Si falta |
|---|---|---|
| `roles/iam.serviceAccountTokenCreator` | firmar `createSessionCookie`/`verifyIdToken` | login falla en producción (500), funciona en local |
| `roles/datastore.user` | leer/escribir Firestore (noticias/jornadas) | CRUD falla en producción |
| `roles/storage.objectAdmin` (bucket `comunidad-chirimoyo`) | subir portadas | subida de portada falla en producción |

Env vars runtime del servicio Cloud Run (se configuran **una sola vez** vía `gcloud run services update admin --set-env-vars=...` o consola — `deploy_run` no las pasa, y `gcloud run deploy` conserva las ya configuradas en la revisión anterior en deploys subsecuentes que no las tocan):
- `SITIO_BASE_URL=https://chirimoyo.org`
- `REVALIDATE_SECRET=<idéntico al configurado en el Cloud Run de sitio>`

### D4 — Smoke test manual, sin automatización nueva

Confirmado con el usuario: checklist manual post-deploy (login → crear noticia → publicar → verificar en el sitio → subir portada → verificar en el sitio → crear/editar/borrar jornada → logout), mismo formato que el checklist de fauna. Sin script nuevo en `package.json` — ni `sitio` (ya en producción) tiene uno hoy; introducir automatización de smoke test es un cambio de alcance mayor que este issue, y se puede revisar más adelante si los deploys se vuelven frecuentes (mismo "plan de revisión" que ya anticipa ADR-0009).

### D5 — Confirmación de CI, sin cambios al workflow

`ci-frontend.yml` ya incluye `admin` en su matrix desde #138 (verificado leyendo el archivo). El runbook y el README lo mencionan como ya resuelto — no se toca `.github/workflows/`.

## Risks / Trade-offs

- **[Riesgo] El usuario podría olvidar rellenar `.env.production` con valores reales antes del primer deploy** (el archivo se crea vacío) → Mitigación: el runbook lo marca como paso explícito de "Prerequisitos" antes de correr `deploy_prod`, con el mismo tratamiento que el resto de los prerequisitos ya documentados para fauna (verificación antes de continuar).
- **[Riesgo] `REVALIDATE_SECRET` desincronizado entre los Cloud Run de `sitio` y `admin`** — ya documentado como riesgo aceptado en #140 (best-effort, no bloquea la escritura en Firestore); el runbook solo lo repite en el contexto de "primera configuración", no introduce un riesgo nuevo.
- **[Trade-off] Checklist manual en vez de smoke automatizado** — más lento de ejecutar en cada deploy, pero proporcional al volumen de deploys esperado (bajo, sin CI/CD); mismo trade-off ya aceptado implícitamente por `sitio`.

## Migration Plan

No aplica migración de datos ni infraestructura nueva — es documentación + un archivo de configuración con placeholders. Pasos para que el runbook sea usable:
1. El usuario rellena `apps/admin/.env.production` con los valores reales de Firebase Console.
2. El usuario sigue el runbook para el primer deploy real a `admin.chirimoyo.org`.
3. Si el smoke test manual falla en algún punto, el runbook mismo sirve de guía de diagnóstico (cada paso está atado a un rol IAM o env var específico).

## Open Questions

Ninguna pendiente — D1-D5 fueron cerradas explícitamente en `/opsx:explore 144` y confirmadas por el usuario (tratar el hallazgo de `.env.production` como parte de este mismo cambio, y smoke test manual sin automatización).
