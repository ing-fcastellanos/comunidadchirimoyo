# ADR-0010 — Analítica respetuosa de la privacidad

- **Estado:** Superseded by ADR-0020
- **Fecha:** 2026-06-07
- **Decisores:** @ing-fcastellanos
- **Issue:** _kickoff_

## Contexto

Se quieren métricas de visitas para reportar impacto y difusión a aliados y posibles donantes. Hay que elegir herramienta. El proyecto tiene valores ecologistas y de privacidad, y quiere evitar fricción legal (banners de consentimiento).

## Decisión

Usar **analítica respetuosa de la privacidad** (Plausible o Umami, posiblemente auto-hospedado): sin cookies de rastreo, sin datos personales, métricas agregadas. Esto evita el banner de consentimiento de cookies y se alinea con los valores del proyecto.

La elección concreta Plausible (SaaS) vs Umami (self-host) se afina en la issue de Fase 5 según costo y esfuerzo operativo.

## Alternativas consideradas

- **Google Analytics 4:** gratis y potente, pero rastrea usuarios, exige banner de consentimiento y envía datos a Google. Desalineado con los valores del proyecto.
- **Sin analítica:** lo más simple, pero sin datos de impacto desde el inicio; los reportes a aliados/donantes los necesitan.

## Consecuencias

### Positivas

- Métricas suficientes para reportar impacto, sin comprometer privacidad ni requerir banner.
- Coherencia con la identidad ecologista/comunitaria.

### Negativas

- Plausible SaaS tiene costo mensual; Umami self-host implica operar un servicio más.
- Menos granularidad que GA4 (aceptable; no se necesita perfilado).

### Neutras

- Se integra en ambas apps vía un único script.

## Plan de revisión

Reconsiderar la herramienta concreta según costo. Volver a GA4 solo si aparece una necesidad de analítica avanzada que justifique el costo de privacidad (improbable).

## Referencias

- ROADMAP Fase 5, ADR-0012 (privacidad).
