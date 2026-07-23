# Desplegar chirimoyo.org (sitio + api) a producción

Runbook para llevar `apps/sitio` (`chirimoyo.org`) y `services/api` (`api.chirimoyo.org`, uso interno) al código actual. Cubre el issue [#53](https://github.com/ing-fcastellanos/comunidadchirimoyo/issues/53).

> **No es un primer deploy.** `sitio` y `api` ya están en Cloud Run desde el scaffold de Fase 0 (2026-06-08) — DNS/Hosting/Cloud Run ya funcionan. El problema es que **nadie volvió a desplegar** desde entonces: `chirimoyo.org` sirve hoy el placeholder "ANDAMIAJE" del scaffold, y `POST /api/contacto` responde `501 "No implementado"` (el stub original, no la implementación real de #46). Todo lo construido en Fase 3-6 está mergeado en main pero nunca llegó a producción. Este runbook documenta el redeploy real, no la infra desde cero.

## Panorama

```
1. PREREQUISITOS   Secret Manager habilitado + secret MAIL_PASSWORD + IAM del SA
                    de api · verificar .dockerignore de ambas apps
2. DEPLOY API       primero — services/api, con secrets SMTP
3. VERIFICAR API    /health (200) + /api/contacto y /api/voluntarios YA NO 501
4. DEPLOY SITIO     después — apps/sitio (su contacto depende de api)
5. VANITY REDIRECTS comunidad.*/voluntarios.* → Porkbun, redirect plano (igual
                    que aves.chirimoyo.org)
6. SMOKE TEST       checklist manual end-to-end (contacto real, jornadas, etc.)
7. CIERRE           marcar el checklist del issue #53
```

`api.chirimoyo.org` (DNS público del API) **queda fuera de alcance** de este runbook: el navegador nunca llama a esa URL directamente — `apps/sitio` la usa server-side vía `API_URL`, apuntando a la URL cruda de Cloud Run.

## Arquitectura del deploy

```
services/api                    Artifact Registry         Cloud Run              apps/sitio
┌──────────────────────┐        (northamerica-south1)     (northamerica-south1)  ┌──────────────────────┐
│ docker build/push       │──────▶┌──────────────────┐──────▶│ servicio "api"      │◀── API_URL (server) ──│ npm run deploy_prod   │
│  + gcloud run deploy    │       │ containers/api    │      └───────────────────┘                        │  ├ docker:build         │
│  (no `make` en          │       └──────────────────┘                                                    │  ├ docker:push          │
│   PowerShell/Windows)   │                                                                                │  ├ gcloud run deploy    │
└──────────────────────┘                                                                                    │  └ firebase deploy      │
         ▲                                                                                                  └──────────┬───────────┘
         │ MAIL_PASSWORD (Secret Manager)                                                                              ▼
┌──────────────────────┐                                                                                    Firebase Hosting (site "chirimoyo")
│  chirimoyo-api SA     │                                                                                    rewrite ** → Cloud Run "sitio" (us-central1)
└──────────────────────┘                                                                                    → chirimoyo.org / www

                    comunidad.chirimoyo.org ──301 (Porkbun, plano)──▶ chirimoyo.org/comunidad
                    voluntarios.chirimoyo.org ──301 (Porkbun, plano)──▶ chirimoyo.org/voluntarios
```

## 1. Prerequisitos (una sola vez)

### 1.1 Secret Manager + secret `MAIL_PASSWORD`

Confirmado en la exploración: `secretmanager.googleapis.com` **no está habilitada** en el proyecto `chirimoyo`, y el service account `chirimoyo-api` solo tiene `roles/datastore.user` — nada de acceso a secrets todavía.

```powershell
gcloud services enable secretmanager.googleapis.com --project=chirimoyo

# Crea el secret (vacío) y agrega la primera versión con el valor real.
# Se escribe a un archivo temporal (evita el salto de línea que agregaría un pipe)
# y se borra enseguida.
gcloud secrets create MAIL_PASSWORD --project=chirimoyo --replication-policy=automatic
$mailPasswordFile = Join-Path $env:TEMP "mail_password.txt"
[System.IO.File]::WriteAllText($mailPasswordFile, "<contraseña/app-password real de la cuenta SMTP>")
gcloud secrets versions add MAIL_PASSWORD --project=chirimoyo --data-file="$mailPasswordFile"
Remove-Item $mailPasswordFile

# Otorga acceso al SA de la API, scoped al secret (no a nivel de proyecto).
gcloud secrets add-iam-policy-binding MAIL_PASSWORD `
  --project=chirimoyo `
  --member="serviceAccount:chirimoyo-api@chirimoyo.iam.gserviceaccount.com" `
  --role="roles/secretmanager.secretAccessor"
```

### 1.2 Verificar `.dockerignore` de ambas apps

Ya confirmado en la exploración — **sin acción**, documentado aquí solo para que el próximo deploy no repita el bug encontrado en `admin` (`.env.local` horneado en el build por falta de `.dockerignore`, [ver PR #162](https://github.com/ing-fcastellanos/comunidadchirimoyo/pull/162)):

| App | `.dockerignore` | Excluye `.env*.local` |
|---|---|---|
| `apps/sitio` | ✅ existe | ✅ |
| `services/api` | ✅ existe | ✅ (`.env`, `.env.*`, excepto `.env.example`) |

### 1.3 Índice compuesto de Firestore para `noticias`

**Encontrado durante el primer deploy real** (no en la exploración original): la lectura de noticias en `/comunidad` filtra por `estado` y ordena por `fecha` — Firestore exige un índice compuesto para esa combinación. Estaba definido en `services/api/firestore.indexes.json` desde que se construyó la feature, pero **nunca se había desplegado a la base real** (el emulator de Firestore no exige índices compuestos, así que nadie lo notó hasta pegarle a producción). Síntoma: `/comunidad` responde 500, y el log del contenedor (`stderr`) muestra `FAILED_PRECONDITION: The query requires an index`.

```powershell
firebase deploy --only firestore:indexes --project chirimoyo
```

Desde `services/api` (donde vive `firebase.json`). El build del índice es asíncrono — puede tardar varios minutos incluso para una colección pequeña. Verifica el estado antes de asumir que sigue roto:

```powershell
gcloud firestore indexes composite list --project=chirimoyo --format="table(name,state)"
# Espera a que el estado sea READY (no CREATING) antes de reprobar /comunidad
```

Ya está desplegado y `READY` al momento de escribir este runbook — este paso solo es necesario de nuevo si se agrega una consulta nueva que requiera otro índice compuesto (Firestore te da el link exacto para crearlo en el propio mensaje de error).

## 2. Deploy de `services/api` (primero)

Desde `services/api`:

```powershell
# NOTA: usa docker build/push directos, no `make docker_build`/`make docker_push` —
# `make` no está disponible por defecto en PowerShell en Windows (no es un typo:
# si lo corres y falla con "term 'make' is not recognized", el siguiente comando
# de todos modos "funciona" pero re-despliega la imagen VIEJA sin que te enteres).
docker build -t northamerica-south1-docker.pkg.dev/chirimoyo/containers/api:latest .
docker push northamerica-south1-docker.pkg.dev/chirimoyo/containers/api:latest
gcloud run deploy api `
  --image=northamerica-south1-docker.pkg.dev/chirimoyo/containers/api:latest `
  --project=chirimoyo `
  --region=northamerica-south1 `
  --platform=managed `
  --service-account=chirimoyo-api@chirimoyo.iam.gserviceaccount.com `
  --allow-unauthenticated `
  --min-instances=0 `
  --port=8080 `
  --set-env-vars="ENV=prod,MAIL_SERVER=smtp.gmail.com,MAIL_PORT=587,MAIL_USERNAME=noreplychirimoyo@gmail.com,MAIL_DEFAULT_SENDER=noreplychirimoyo@gmail.com,CONTACTO_INBOX=contacto@chirimoyo.org,VOLUNTARIOS_INBOX=voluntarios@chirimoyo.org" `
  --set-secrets="MAIL_PASSWORD=MAIL_PASSWORD:latest"
```

(El `Makefile` de `services/api` tiene un target `deploy_prod` equivalente a `docker_build` + `docker_push` + `gcloud run deploy`, pero **requiere GNU Make**, no disponible por defecto en PowerShell/Windows — de ahí los comandos directos arriba. En una máquina con `make` instalado, `make deploy_prod` funciona pero tampoco incluye las banderas de env vars/secrets; agrégalas ahí si prefieres no repetirlas a mano en cada deploy.)

### Verificación inmediata

```powershell
curl.exe -s https://api-9902000097.northamerica-south1.run.app/health
# → {"status":"ok","service":"api","version":"..."}

curl.exe -s -X POST -H "Content-Type: application/json" -d '{}' `
  https://api-9902000097.northamerica-south1.run.app/api/contacto
# → 400 "Solicitud inválida" (NO 501 "No implementado" — si ves 501, el deploy no tomó el código nuevo)
```

> Se usa `curl.exe` explícitamente (no `curl` a secas) para evitar el alias de PowerShell hacia `Invoke-WebRequest`, que no acepta las mismas banderas.

## 3. Deploy de `apps/sitio` (después)

> **Encontrado durante el primer deploy real:** `content/` (historia, misión/visión, enlaces del landing — ADR-0004) vive en la raíz del monorepo, fuera del build context de Docker de `sitio` (`npm run docker:build` construye con contexto `apps/sitio`). El código resuelve la ruta como `../../content` relativo a `process.cwd()`, lo cual solo funciona en local — dentro del container, `process.cwd()` es `/app`, así que la ruta calculada termina en `/content` (no existe). Esto rompía el build (`ENOENT` en `next build`) **y** el runtime (páginas como `/comunidad` combinan `content/` con Firestore vía ISR on-demand, así que Next.js vuelve a leer `content/` cada vez que revalida, no solo en el build). Ya está resuelto en `apps/sitio/Dockerfile` (named build context `--build-context content=../../content`, copiado tanto en `builder` como en `runner`, con `CONTENT_DIR` explícito) y en `package.json` (`docker:build` ya incluye la bandera) — `npm run deploy_prod` ya la usa automáticamente, no hace falta nada manual.

Verifica primero que la variable `API_URL` del servicio Cloud Run `sitio` apunte a la URL real de `api` (server-only, el navegador nunca la ve):

```powershell
gcloud run services update sitio --project=chirimoyo --region=us-central1 `
  --update-env-vars="API_URL=https://api-9902000097.northamerica-south1.run.app"
```

Luego, desde `apps/sitio`:

```powershell
npm run deploy_prod
```

> **Orden importante:** el formulario de contacto de `sitio` llama a `api` — desplegar `sitio` antes de que `api` sirva el código real solo movería el problema, no lo resolvería.

### Verificación inmediata

Visita `https://chirimoyo.org`, `/comunidad` y `/voluntarios` — ninguna debe mostrar "ANDAMIAJE" ni "Placeholder del scaffold". Si lo siguen mostrando, el build probablemente reusó una imagen cacheada — reintenta con `docker build --no-cache` o confirma que los archivos fuente realmente cambiaron respecto al último build.

## 4. Redirects vanity (`comunidad.*` / `voluntarios.*`)

Igual que el precedente ya viviendo de `aves.chirimoyo.org` (ADR-0024): **redirect plano**, sin preservar subpath — `comunidad.chirimoyo.org/lo-que-sea` cae en `chirimoyo.org/comunidad`, no en `chirimoyo.org/comunidad/lo-que-sea`. Esto se configura en Porkbun (DNS, fuera del repo — panel de Porkbun → dominio `chirimoyo.org` → URL Forwarding/Redirect):

- `comunidad.chirimoyo.org` → `https://chirimoyo.org/comunidad` (301, sin "include path")
- `voluntarios.chirimoyo.org` → `https://chirimoyo.org/voluntarios` (301, sin "include path")

### Verificación

```powershell
curl.exe -sI https://comunidad.chirimoyo.org/cualquier-cosa | Select-String "location"
# → location: https://chirimoyo.org/comunidad

curl.exe -sI https://voluntarios.chirimoyo.org/cualquier-cosa | Select-String "location"
# → location: https://chirimoyo.org/voluntarios
```

## 5. Smoke test manual en producción

- [ ] **Landing** (`chirimoyo.org/`): hero, linktree, donaciones, aliados — no el placeholder de scaffold.
- [ ] **Comunidad** (`/comunidad`): historia, misión/visión, noticias (leídas de Firestore, ver ADR-0028).
- [ ] **Voluntarios** (`/voluntarios`): jornadas, calendario, inscripción, donaciones.
- [ ] **Formulario de contacto**: envío real de prueba → `201`, el mensaje aparece en `contacto_mensajes` (Firestore), llega el aviso a `contacto@chirimoyo.org` y la confirmación al remitente.
- [ ] **Inscripción de voluntarios**: envío real de prueba → `201`, aparece en la colección de inscripciones, llega el aviso a `voluntarios@chirimoyo.org`.
- [ ] **Redirects vanity**: `comunidad.*`/`voluntarios.*` responden 301 a la raíz de su sección.
- [ ] **Analítica**: pageview en Cloudflare Web Analytics para `chirimoyo.org`.
- [ ] **SSL** válido en `chirimoyo.org`, `www`, y ambos vanity.

## 6. Cierre

- Marcar el checklist del issue [#53](https://github.com/ing-fcastellanos/comunidadchirimoyo/issues/53) (los ítems de DNS/Hosting/Cloud Run del apex ya estaban resueltos desde el scaffold — lo nuevo es el redeploy real, los secrets y los vanity redirects).
- Si el smoke falla en `api`, revisar primero si de verdad se re-desplegó (comparar el digest de imagen de la revisión activa) antes de asumir un bug de código.

## Rollback

- **Cloud Run** (`api` o `sitio`): consola → servicio → Revisiones → dirigir tráfico a la revisión anterior. Para `api`, la revisión anterior es el scaffold-stub — solo úsala como rollback de emergencia, no revierte el problema que motivó este deploy.
- **Firebase Hosting** (`sitio`): consola → Hosting → site `chirimoyo` → historial de versiones → Rollback.
- **Secrets**: `gcloud secrets versions disable <version>` si un valor de `MAIL_PASSWORD` resultó incorrecto, sin borrar el secret.

## Notas

- **Smoke manual, sin automatización nueva** — mismo criterio que los runbooks de fauna y admin.
- **Solo producción** por ahora — no hay ambiente de QA ([ADR-0003](../decisions/0003-hosting-db-ambientes.md)).
- Las reglas de seguridad de Firestore **ya están desplegadas y vigentes** (verificado vía la API de Firebase Rules) — no requieren ninguna acción en este runbook.

## Referencias

- [ADR-0004](../decisions/0004-contenido-en-repo.md) — contenido en `content/` (raíz del monorepo).
- [ADR-0006](../decisions/0006-api-minima.md) — API mínima.
- [ADR-0012](../decisions/0012-privacidad-datos-voluntarios.md) — privacidad de datos de voluntarios/contacto.
- [ADR-0028](../decisions/0028-noticias-jornadas-dinamicas-firestore.md) — noticias/jornadas en Firestore (origen de la consulta que necesita el índice compuesto).
- [ADR-0015](../decisions/0015-sitio-cloud-run-us-central1.md) — Cloud Run para `sitio`.
- [ADR-0023](../decisions/0023-fusion-secciones-paths-vanity-redirects.md) — paths + vanity redirects.
- [ADR-0024](../decisions/0024-catalogo-fauna-dominio-unico-grupos-por-path.md) — precedente de `aves.chirimoyo.org`.
- [apps/sitio/README.md](../../apps/sitio/README.md), [services/api/README.md](../../services/api/README.md).
- Issues [#46](https://github.com/ing-fcastellanos/comunidadchirimoyo/issues/46) (contacto), [#53](https://github.com/ing-fcastellanos/comunidadchirimoyo/issues/53) (este deploy).
