# ADR-0020 — Analítica web: Cloudflare Web Analytics

- **Estado:** Accepted
- **Fecha:** 2026-06-15
- **Decisores:** @ing-fcastellanos
- **Issue:** [#24](https://github.com/ing-fcastellanos/comunidadchirimoyo/issues/24)

## Contexto

El [ADR-0010](0010-analitica-privada.md) decidió usar analítica respetuosa de la privacidad (sin cookies, sin banner, métricas agregadas) y nombró como candidatas a **Plausible o Umami**, dejando la elección concreta para la Fase 5.

Al aterrizar la implementación se decidió **seguimiento por dominio** (4 dominios: `chirimoyo.org`, `comunidad.chirimoyo.org`, `voluntarios.chirimoyo.org`, `aves.chirimoyo.org`) y se chocó con los planes reales:

- **Umami Cloud free** solo permite **1 website**; el multi-sitio es de pago ($20/mes).
- **Plausible** no tiene free tier (solo prueba).
- Self-host de Umami daría sitios ilimitados gratis, pero suma un servicio always-on con BD — contra el ethos del proyecto (API mínima, scale-to-zero, catálogo estático).

Ninguna de las candidatas del ADR-0010 cumple "seguimiento por dominio gratis". **Cloudflare Web Analytics** —no contemplada en el 0010— sí.

## Decisión

Usar **Cloudflare Web Analytics** mediante su **beacon JS manual** (sin enrutar DNS ni hosting por Cloudflare). Se crea **un "site" por dominio** → un token por dominio → separación nativa por dominio, gratis. Sin cookies, sin almacenamiento en el navegador, sin banner de consentimiento.

Este ADR **supersede al ADR-0010 en la elección de herramienta**. Se conservan íntegros los principios del 0010: analítica sin rastreo personal, sin cookies, sin banner, métricas agregadas.

## Alternativas consideradas

- **Cloudflare Web Analytics (elegida):** gratis sin límite de sitios ni eventos; cookieless; beacon JS que no requiere mover DNS/hosting; incluye Web Vitals. Contra: métricas básicas (sin eventos personalizados ni embudos), posible subconteo por ad-blockers (`cloudflareinsights.com`), el dato lo procesa Cloudflare.
- **Umami Cloud free (1 site + filtro por hostname):** gratis y más rica (eventos custom a futuro), pero la separación por dominio es por filtro dentro de una sola propiedad, no nativa.
- **Umami Cloud Pro ($20/mes):** 4 propiedades reales separadas, pero costo recurrente no justificado hoy.
- **Plausible Cloud:** sin free tier; descartada por costo desde el inicio.
- **Umami self-host:** sitios ilimitados gratis, pero opera un servicio + BD permanentes; contra el ethos de mínima operación.

## Consecuencias

### Positivas

- **Seguimiento por dominio real y gratuito** (el objetivo original).
- Cookieless, sin banner, sin PII — alineado con los valores del proyecto y la LFPDPPP.
- No requiere mover DNS/hosting a Cloudflare; funciona con Firebase/Porkbun.
- **Web Vitals / rendimiento** de regalo.

### Negativas

- Métricas **básicas**: sin eventos personalizados ni embudos. Si en el futuro se necesitan, hay que reconsiderar (Umami/Plausible de pago).
- Posible **subconteo** por bloqueadores que filtran el beacon de Cloudflare.
- El dato lo procesa **Cloudflare** (tercero, respetuoso de privacidad, no Google).

### Neutras

- Retención de datos ~6 meses (similar a Umami free).
- Requiere una cuenta de Cloudflare (gratuita).

## Plan de revisión

Reconsiderar si aparece la necesidad de analítica avanzada (eventos personalizados, embudos, mayor retención) que justifique migrar a una herramienta de pago (Umami/Plausible) o self-host.

## Referencias

- Supersede a [ADR-0010](0010-analitica-privada.md). Relacionado con [ADR-0012](0012-privacidad-datos-voluntarios.md) (privacidad).
- Issue [#24](https://github.com/ing-fcastellanos/comunidadchirimoyo/issues/24) · Cambio OpenSpec `analitica-privada-cloudflare`.
- [Cloudflare Web Analytics — docs](https://developers.cloudflare.com/web-analytics/about/).
