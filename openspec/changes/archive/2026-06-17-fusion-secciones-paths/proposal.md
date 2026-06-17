## Why

ADR-0023 (Accepted) supersede a ADR-0008: las secciones `comunidad` y `voluntarios`
dejan de servirse como subdominios dedicados y pasan a ser **paths bajo el dominio
único `chirimoyo.org`** (`/comunidad`, `/voluntarios`). El supuesto original de
ADR-0008 ("`chirimoyo.org` es solo un landing") ya no se sostiene: el sitio creció
con `/aliados`, `/galeria`, `/contacto` y `/privacidad`. Consolidar en un solo
dominio mejora la autoridad SEO de un sitio que apenas arranca y simplifica el deploy
pendiente (#53). Las rutas internas de Next ya son `/comunidad/...` y `/voluntarios/...`,
así que el cambio de código es acotado. Implementa el issue #75.

## What Changes

- `apps/sitio/lib/links.ts`: `COMUNIDAD_URL` y `VOLUNTARIOS_URL` pasan de URLs absolutas
  de subdominio a **rutas relativas** (`/comunidad`, `/voluntarios`); `AVES_URL` queda
  absoluto (app/deploy propio).
- Los consumidores en `apps/sitio` (`Header`, `CierreCTA`, `Hero`) siguen usando `<a href>`
  con el href ahora relativo — **no** se migra a `<Link>` (cambio mínimo, recarga completa
  aceptable).
- `content/landing/enlaces.json`: los `sitios[]` de comunidad/voluntarios usan URLs
  relativas; aves sin cambio.
- **BREAKING (ruteo):** se elimina `apps/sitio/middleware.ts` (ruteo por host). Como queda
  vacío, se borra el archivo completo.
- `apps/catalogo/lib/links.ts`: `COMUNIDAD_URL` **se mantiene absoluto**, apuntando al
  **vanity** `https://comunidad.chirimoyo.org` (el catálogo es otro origen; una ruta
  relativa apuntaría a `aves.chirimoyo.org/comunidad` y rompería). El vanity hace 301 al
  path canónico.
- `apps/sitio/.env.example`: se limpian las claves de subdominio en
  `NEXT_PUBLIC_CF_BEACON_TOKENS` (`comunidad.*`, `voluntarios.*`) que ya no renderizan la app.
- Documentación de **instrucciones del redirect vanity 301** (`comunidad.*` y `voluntarios.*`
  → su path equivalente) en el runbook, aunque la configuración real de DNS/Hosting viva en #53.
- Docs: `CLAUDE.md`, `README.md`, `docs/architecture/overview.md` se actualizan
  (subdominios → paths + vanity).

## Capabilities

### New Capabilities
<!-- Ninguna capability nueva: este cambio modifica comportamiento existente. -->

### Modified Capabilities
- `sitio-app`: se reemplaza el requirement **"Ruteo multi-subdominio por host"** por ruteo
  por paths sin host-rewrite (middleware eliminado); el requirement del **Header del
  ecosistema** cambia para que Comunidad/Voluntarios usen rutas relativas y solo Aves quede
  absoluta; y se reescribe la justificación de `output: standalone` (ya no por el ruteo por
  host, sino por las Server Actions del formulario de contacto).

## Impact

- **Sub-dominios afectados:** `sitio` (apps/sitio: links, middleware, env, header/landing),
  `aves` (apps/catalogo: `lib/links.ts`), `comunidad` y `voluntarios` (pasan a paths +
  vanity redirect).
- **Código:** `apps/sitio/lib/links.ts`, `apps/sitio/middleware.ts` (borrado),
  `apps/sitio/.env.example`, `apps/catalogo/lib/links.ts`, `content/landing/enlaces.json`.
- **Specs:** `openspec/specs/sitio-app/spec.md` (delta).
- **Docs:** `CLAUDE.md`, `README.md`, `docs/architecture/overview.md`, runbook de redirects.
- **ADR:** ya cubierto por ADR-0023 (Accepted); este change lo implementa, no requiere ADR nuevo.

## No-goals

- Configuración real de DNS / Firebase Hosting (un solo site + redirects 301) → vive en **#53**.
- `aves.chirimoyo.org` como app/deploy: **no se toca** (sigue siendo `apps/catalogo` independiente).
- Analítica por dominio (tokens de Cloudflare por host): los efectos de la fusión sobre el
  seguimiento por dominio pertenecen al change `analitica-privada-cloudflare` y al deploy #53.
- No se migran los `<a>` a `<Link>` ni se introduce navegación SPA en este cambio.
