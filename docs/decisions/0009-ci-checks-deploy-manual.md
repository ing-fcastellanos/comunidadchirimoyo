# ADR-0009 — CI de checks (GitHub Actions) + deploy manual

- **Estado:** Accepted
- **Fecha:** 2026-06-07
- **Decisores:** @ing-fcastellanos
- **Issue:** _kickoff_

## Contexto

El repo es **público** y acepta contribuciones externas. Sociedad Salvaje no tiene CI/CD (deploys manuales). Hay que decidir el nivel de automatización: desde nada hasta CI/CD completo con auto-deploy.

## Decisión

**CI de checks, deploy manual.** GitHub Actions corre `lint`, `typecheck` y `build` (frontend) y `lint` + smoke import (API) en cada PR y push a `main`. Los **deploys siguen siendo manuales** (`make deploy_*` / `npm run deploy_*`), como en Sociedad Salvaje.

## Alternativas consideradas

- **CI/CD completo (auto-deploy a Cloud Run/Firebase al merge):** máxima automatización, pero requiere configurar credenciales de deploy (Workload Identity / service account) en GitHub y más setup. Se difiere; el riesgo de un deploy manual es bajo para este proyecto.
- **Manual total (sin Actions), como Sociedad Salvaje:** más simple, pero deja PRs externos sin red de seguridad de calidad. Inaceptable para un repo público que invita a contribuir.

## Consecuencias

### Positivas

- Las contribuciones externas se validan automáticamente (lint/typecheck/build verde antes de merge).
- Sin el costo/riesgo de gestionar credenciales de deploy en CI todavía.

### Negativas

- El deploy sigue dependiendo de que alguien lo ejecute a mano.

### Neutras

- Los workflows usan filtros de `paths`; no corren hasta que las apps/servicio existan.

## Plan de revisión

Migrar a CI/CD completo si la frecuencia de deploys crece o si se suma más de un mantenedor con permisos de deploy.

## Referencias

- `.github/workflows/ci-frontend.yml`, `.github/workflows/ci-api.yml`.
- ADR-0003 (hosting).
