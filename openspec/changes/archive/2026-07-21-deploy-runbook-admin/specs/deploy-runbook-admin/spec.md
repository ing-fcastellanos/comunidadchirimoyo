## ADDED Requirements

### Requirement: Runbook de deploy a producción para apps/admin
El proyecto SHALL proveer un runbook en `docs/guias/desplegar-admin-produccion.md` que documente, de punta a punta, el proceso de deploy de `apps/admin` a producción (Cloud Run + Docker + Firebase Hosting), incluyendo prerequisitos (roles IAM, env vars runtime del servicio, provisión en Firebase Console), pasos de deploy, checklist de smoke manual y rollback.

#### Scenario: Alguien intenta el primer deploy real de admin
- **WHEN** un desarrollador necesita desplegar `apps/admin` a producción por primera vez
- **THEN** encuentra en `docs/guias/desplegar-admin-produccion.md` los 3 roles IAM requeridos (con su propósito y síntoma si falta cada uno), las env vars runtime a configurar en el servicio Cloud Run (`SITIO_BASE_URL`, `REVALIDATE_SECRET`), los pasos de Firebase Console, la secuencia de comandos de deploy y un checklist de verificación manual post-deploy

### Requirement: Placeholders de configuración pública para el build de Docker
El proyecto SHALL proveer `apps/admin/.env.production` con los 6 `NEXT_PUBLIC_FIREBASE_*` como placeholders vacíos, siguiendo el mismo patrón que `apps/sitio/.env.production` y `apps/catalogo/.env.production`, de forma que el archivo llegue al contexto de build de Docker.

#### Scenario: Build de Docker de admin en producción
- **WHEN** se ejecuta `npm run deploy_prod` (que incluye `docker:build`) sobre `apps/admin` con `apps/admin/.env.production` rellenado con los valores reales de Firebase Console
- **THEN** el bundle del cliente producido por `next build` incluye los valores reales de `NEXT_PUBLIC_FIREBASE_*` en vez de `undefined`
