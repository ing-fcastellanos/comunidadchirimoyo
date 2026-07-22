## 1. Config de producción

- [x] 1.1 Crear `apps/admin/.env.production` con los 6 `NEXT_PUBLIC_FIREBASE_*` como placeholders vacíos y comentario explicativo (mismo patrón que `apps/sitio/.env.production`/`apps/catalogo/.env.production`)
- [x] 1.2 Confirmar que `.gitignore` raíz ya permite versionar `apps/*/.env.production` (verificado en explore/design — sin cambios esperados, solo confirmar)

## 2. Runbook de deploy

- [x] 2.1 Crear `docs/guias/desplegar-admin-produccion.md` con panorama + diagrama ASCII (docker:build/push → gcloud run deploy → firebase deploy)
- [x] 2.2 Documentar prerequisitos: tabla de los 3 roles IAM (rol, para qué, síntoma si falta)
- [x] 2.3 Documentar env vars runtime del servicio Cloud Run (`SITIO_BASE_URL`, `REVALIDATE_SECRET`) y cómo configurarlas vía `gcloud run services update`
- [x] 2.4 Documentar provisión manual en Firebase Console (proveedor Email/Password, primer usuario admin)
- [x] 2.5 Documentar confirmación de que CI ya cubre `admin` (matrix de `ci-frontend.yml` desde #138)
- [x] 2.6 Documentar pasos de deploy (secuencia de comandos, equivalente a `npm run deploy_prod`)
- [x] 2.7 Checklist de smoke manual post-deploy (login, crear/publicar noticia, subir portada, crear/editar/borrar jornada, logout)
- [x] 2.8 Sección de rollback y referencias

## 3. README

- [x] 3.1 Agregar sección "Deploy a producción" en `apps/admin/README.md` enlazando al runbook nuevo, sin duplicar el contenido ya existente por issue
