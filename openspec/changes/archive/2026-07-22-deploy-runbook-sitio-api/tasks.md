## 1. Runbook — panorama y arquitectura

- [x] 1.1 Crear `docs/guias/desplegar-sitio-produccion.md` con panorama (diagrama ASCII: api → sitio → vanity redirects) y contexto de por qué es un redeploy real, no un primer deploy
- [x] 1.2 Documentar hallazgos de la exploración: estado real de `sitio`/`api` (scaffold desde 2026-06-08), Firestore rules ya aplicadas (sin acción), `aves.*` como precedente de vanity redirect

## 2. Runbook — redeploy de services/api

- [x] 2.1 Documentar habilitar Secret Manager (`gcloud services enable secretmanager.googleapis.com`)
- [x] 2.2 Documentar crear el secret `MAIL_PASSWORD` y otorgar `roles/secretmanager.secretAccessor` a `chirimoyo-api@chirimoyo.iam.gserviceaccount.com`
- [x] 2.3 Documentar el comando de deploy con `--set-env-vars` (vars no secretas) + `--set-secrets` (MAIL_PASSWORD)
- [x] 2.4 Documentar verificación post-deploy: `GET /health` (200) y `POST /api/contacto`/`/api/voluntarios` con payload inválido (400, no 501)

## 3. Runbook — redeploy de apps/sitio

- [x] 3.1 Documentar el redeploy real (`npm run deploy_prod`) y por qué la revisión previa no cuenta (mismo digest de imagen que el scaffold)
- [x] 3.2 Documentar verificación de `API_URL` en el Cloud Run de `sitio` apuntando a la URL de Cloud Run de `api`
- [x] 3.3 Documentar verificación post-deploy: `/`, `/comunidad`, `/voluntarios` ya no sirven el placeholder "ANDAMIAJE"

## 4. Runbook — redirects vanity

- [x] 4.1 Documentar los pasos manuales en Porkbun para `comunidad.chirimoyo.org` y `voluntarios.chirimoyo.org` (redirect plano, igual que `aves.*`)
- [x] 4.2 Documentar verificación con `curl -I` confirmando 301 a la raíz de sección (sin preservar subpath)

## 5. Runbook — smoke test y cierre

- [x] 5.1 Checklist de smoke manual consolidado (api + sitio + redirects + formulario de contacto end-to-end)
- [x] 5.2 Sección de rollback y referencias (ADRs 0006, 0012, 0015, 0023, 0024; issues #46, #53)
- [x] 5.3 Nota explícita: `api.chirimoyo.org` (DNS público) queda fuera de alcance (D5)
