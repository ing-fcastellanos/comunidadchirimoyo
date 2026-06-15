## Context

ADR-0010 fijó "analítica respetuosa de la privacidad, sin cookies, sin banner" y nombró como candidatas a Plausible/Umami, dejando la elección concreta para Fase 5. La exploración cerró: **seguimiento por dominio** + línea de transparencia. Al implementar, el free tier de Umami resultó limitado a **1 website** y Plausible no tiene free tier; **Cloudflare Web Analytics** (no contemplada en 0010) sí da multi-dominio gratis. Eso motiva [ADR-0020](../../../docs/decisions/0020-analitica-cloudflare-web-analytics.md), que supersede al 0010 en la herramienta.

Estado actual: ambos `app/layout.tsx` son idénticos y sin scripts. Topología:

- `apps/sitio` (Cloud Run, ADR-0015) sirve **3 dominios** con middleware multi-subdominio: `chirimoyo.org`, `comunidad.chirimoyo.org`, `voluntarios.chirimoyo.org`.
- `apps/catalogo` (export estático en Firebase Hosting, ADR-0014) sirve **1 dominio**: `aves.chirimoyo.org`.

DNS en Porkbun, hosting en Firebase → **el sitio no está detrás de Cloudflare**, así que se usa el **beacon JS manual** (no se enruta DNS por Cloudflare). Restricciones: sin tooling de monorepo (compartir por copia, ADR-0013); catálogo estático (script puro cliente); coherencia con "sin cookies de rastreo".

## Goals / Non-Goals

**Goals:**
- Pageviews agregados visibles **por dominio** en el panel de Cloudflare (un "site"/token por dominio).
- Integración client-side limpia en ambas apps, activable/desactivable por entorno.
- Cero cookies, cero PII, cero banner — verificable en runtime.
- Una declaración de transparencia en el aviso de privacidad (diferida a #44).

**Non-Goals:**
- Eventos personalizados / embudos (Cloudflare WA free no los ofrece).
- Enrutar DNS/hosting por Cloudflare; cualquier cambio en `services/api`.
- Banner de consentimiento.

## Decisions

### D1 — Cloudflare Web Analytics sobre Umami/Plausible
El free tier de Umami limita a 1 website; queremos 4 (por dominio). Plausible no tiene free tier. Self-host de Umami añadiría servicio+BD always-on (contra el ethos). Cloudflare WA es **gratis sin límite de sitios**, cookieless, y funciona con beacon JS sin mover DNS. Contra: métricas básicas (sin eventos), posible subconteo por ad-block. Formalizado en ADR-0020 (supersede 0010). **Alternativas:** Umami free 1-site + filtro por hostname; Umami Pro $20/mes; Plausible (de pago).

### D2 — Un "site"/token de Cloudflare por dominio (4 tokens)
Se da de alta **un site por dominio** en Cloudflare → 4 tokens de beacon. La asociación host→token vive en una variable de entorno con mapa JSON: `NEXT_PUBLIC_CF_BEACON_TOKENS='{"chirimoyo.org":"<token>",...}'`. Separación nativa por dominio, gratis.

### D3 — Resolución del token en cliente por `window.location.hostname`
`sitio` decide el dominio en tiempo de request (middleware), pero el token se resuelve **en el cliente** leyendo `window.location.hostname` contra el mapa. Sirve igual al export estático de `catalogo` (sin servidor) y a los 3 hosts de `sitio` con un solo build. Si el host no está en el mapa (localhost, preview), no se inyecta el beacon.

### D4 — Componente `Analytics` compartido por copia (ADR-0013)
Componente cliente (`"use client"`) idéntico en cada app (`components/Analytics.tsx`), copiado entre apps (no hay workspaces). Usa `next/script` con `strategy="afterInteractive"`. Renderiza `null` si no hay config o el host no mapea. Se inserta en `<body>` de cada `app/layout.tsx`.

### D5 — Beacon de Cloudflare
Se carga `https://static.cloudflareinsights.com/beacon.min.js` con el atributo `data-cf-beacon={"token":"<token-resuelto>"}`. Cloudflare WA no usa cookies ni almacenamiento en el navegador (no requiere banner). El src es constante; la única config por entorno es el mapa host→token.

### D6 — Transparencia en privacidad (diferida a #44)
La línea de transparencia se añadirá al aviso/página de privacidad de `sitio`. Como esa página aún no existe, la tarea queda **diferida al issue #44** (creación del aviso de privacidad).

## Risks / Trade-offs

- **Métricas básicas (sin eventos/embudos).** → Aceptable para "reportar impacto". Si se necesitan eventos, se reconsidera la herramienta (ADR-0020, plan de revisión).
- **Subconteo por ad-blockers que filtran `cloudflareinsights.com`.** → Inherente a cualquier analítica; se acepta (subconteo, no error).
- **El dato lo procesa Cloudflare (tercero).** → Aceptado: cookieless, sin PII; documentado en transparencia.
- **`window.location.hostname` no existe en SSR.** → El componente es `"use client"` y resuelve el token en efecto/cliente; en server render no inyecta nada, sin error de hidratación.
- **Olvidar inyectar la env var en deploy.** → Documentado en READMEs/guías; ausencia de config = analítica off (degradación segura).

## Migration Plan

1. Crear cuenta Cloudflare (gratis) + alta de 4 "sites" → obtener los 4 tokens de beacon.
2. Implementar componente `Analytics` (copia en ambas apps) + insertarlo en layouts.
3. Definir `NEXT_PUBLIC_CF_BEACON_TOKENS` en local (`.env.local`), en el build de `catalogo` y en Cloud Run de `sitio`.
4. Añadir la línea de transparencia al aviso de privacidad (cuando exista — #44).
5. Deploy; verificar en cada dominio: llega pageview al site correcto, sin cookies, sin banner (DevTools → Application/Network).
6. **Rollback:** quitar la env var (analítica off) o revertir el commit; sin estado persistente que migrar.

## Open Questions

- ¿Dónde vivirá el aviso/página de privacidad en `apps/sitio`? (se resuelve en #44).
