## Why

El proyecto quiere métricas de visitas para reportar impacto y difusión a aliados y posibles donantes, pero hoy **ninguna de las apps tiene analítica**. La decisión de fondo (analítica sin cookies, sin banner) viene de [ADR-0010](../../../docs/decisions/0010-analitica-privada.md) y existe la épica [#24](https://github.com/ing-fcastellanos/comunidadchirimoyo/issues/24); falta ejecutarla con una herramienta concreta.

## What Changes

- **Herramienta elegida: Cloudflare Web Analytics** ([ADR-0020](../../../docs/decisions/0020-analitica-cloudflare-web-analytics.md), que **supersede al ADR-0010** en la elección de herramienta). Razón: el free tier de Umami solo permite 1 website y queremos **seguimiento por dominio**; Cloudflare es gratis sin límite de sitios, cookieless y no requiere mover DNS/hosting.
- **Seguimiento por dominio.** Un "site"/token de Cloudflare por cada uno de los 4 dominios públicos: `chirimoyo.org`, `comunidad.chirimoyo.org`, `voluntarios.chirimoyo.org` (los tres servidos por `apps/sitio`) y `aves.chirimoyo.org` (`apps/catalogo`).
- **Componente de analítica compartido** insertado en el `app/layout.tsx` de ambas apps, que carga el **beacon JS de Cloudflare** solo cuando hay config y resuelve el token según el host.
- **Configuración por variable de entorno `NEXT_PUBLIC_CF_BEACON_TOKENS`** (mapa host→token), inyectada en el build de `catalogo` y en el entorno de Cloud Run de `sitio`.
- **Línea de transparencia** en el aviso/página de privacidad de `sitio`: declara analítica agregada sin rastreo ni datos personales (no requiere banner, coherente con [ADR-0012](../../../docs/decisions/0012-privacidad-datos-voluntarios.md)). **Diferida a [#44](https://github.com/ing-fcastellanos/comunidadchirimoyo/issues/44)** (aún no existe la página de privacidad).
- **Verificación de no-PII:** comprobación en runtime de que no se sientan cookies, no se recolecta PII y no aparece banner.

### No-goals

- **No** se introduce Google Analytics / Firebase Analytics ni ninguna herramienta con cookies de rastreo.
- **No** se enruta el DNS/hosting por Cloudflare: se usa el beacon JS manual.
- **No** se agrega banner de consentimiento.
- **No** se instrumentan **eventos personalizados ni embudos** (Cloudflare WA free no los ofrece); solo pageviews agregados + Web Vitals. Si se necesitan a futuro, se reconsidera la herramienta (ver ADR-0020).
- **No** se toca `services/api` (la analítica es 100% client-side).

## Capabilities

### New Capabilities
- `analitica-web`: integración de analítica web respetuosa de la privacidad (Cloudflare Web Analytics) en las apps de cara al público — carga condicional del beacon, resolución del token por dominio, configuración por entorno, garantías de no-cookies/no-PII/no-banner, y la declaración de transparencia en el aviso de privacidad.

### Modified Capabilities
<!-- Ninguna: la transparencia en privacidad y la integración se modelan dentro de la nueva capability analitica-web; no cambian requisitos de sitio-app/catalogo-app a nivel de spec. -->

## Impact

- **Sub-dominios afectados:** `sitio` (chirimoyo.org, comunidad, voluntarios), `aves` (catalogo) y `foundation` (env vars de deploy + aviso de privacidad + ADR-0020). `api` no se toca.
- **Código:**
  - `apps/sitio/app/layout.tsx` y `apps/catalogo/app/layout.tsx` — insertar el componente de analítica.
  - Componente compartido `components/Analytics.tsx` en cada app, copiado entre apps ([ADR-0013](../../../docs/decisions/0013-tokens-compartidos-por-copia.md), compartir por copia, sin tooling de monorepo).
  - Página/aviso de privacidad en `apps/sitio` — añadir la línea de transparencia (diferido a #44).
- **Configuración / deploy:** nueva env var `NEXT_PUBLIC_CF_BEACON_TOKENS` en el build de `catalogo` y en el servicio Cloud Run de `sitio`. Documentado en los README/guías de despliegue.
- **Dependencias:** ninguna librería npm nueva (el beacon se carga vía `next/script` desde el CDN de Cloudflare).
- **Cuenta externa:** cuenta de Cloudflare (gratuita) + alta de los 4 "sites" para obtener los tokens.
- **ADRs:** **nuevo ADR-0020** (supersede ADR-0010); respeta ADR-0012.
- **Issue:** desglosa y cierra (parte de) la épica #24.
