## Context

ADR-0008 servía `chirimoyo.org`, `comunidad.chirimoyo.org` y `voluntarios.chirimoyo.org`
desde una sola app (`apps/sitio`) mediante un `middleware.ts` que reescribe por `Host`:
`comunidad.*` → `/comunidad`, `voluntarios.*` → `/voluntarios`. Hecho clave: los subdominios
**nunca fueron sitios separados** — misma app, mismo build, mismo deploy. Las rutas internas
de Next ya son `/comunidad/...` y `/voluntarios/...`.

ADR-0023 (Accepted) supersede a ADR-0008 y decide servir esas secciones como **paths** bajo
`chirimoyo.org`, conservando los subdominios solo como **redirects vanity 301**. Este change
implementa esa decisión en código, contenido, spec y docs. `aves.chirimoyo.org` queda fuera:
es `apps/catalogo`, app y deploy propios.

Estado actual relevante:
- `apps/sitio/lib/links.ts` exporta `COMUNIDAD_URL`, `VOLUNTARIOS_URL`, `AVES_URL` como
  absolutas. Las consumen `Header.tsx`, `CierreCTA.tsx`, `Hero.tsx` (todos vía `<a href>`).
- `apps/catalogo/lib/links.ts` exporta su propio `COMUNIDAD_URL` (lo usan `Hero`, `ElHumedal`,
  `not-found`).
- `content/landing/enlaces.json` lista los tres sitios del ecosistema con URLs absolutas.
- `apps/sitio/.env.example` define `NEXT_PUBLIC_CF_BEACON_TOKENS` con claves por host.

## Goals / Non-Goals

**Goals:**
- Servir `comunidad` y `voluntarios` como paths internos de `chirimoyo.org`, sin ruteo por host.
- Eliminar `apps/sitio/middleware.ts` (queda sin función tras quitar el rewrite por host).
- Mantener funcionando los enlaces del catálogo (`apps/catalogo`) hacia la comunidad sin romper
  por diferencia de origen.
- Dejar specs y docs coherentes con ADR-0023.

**Non-Goals:**
- Configurar el DNS / Firebase Hosting (un site + 301) — eso es #53. Aquí solo se **documenta**
  el runbook del redirect.
- Tocar `aves.chirimoyo.org` como app.
- Reestructurar la analítica por dominio (change `analitica-privada-cloudflare`).
- Migrar `<a>` a `<Link>` ni introducir navegación SPA.

## Decisions

### 1. `apps/sitio`: URLs relativas para comunidad/voluntarios, absoluta para aves
`COMUNIDAD_URL = "/comunidad"`, `VOLUNTARIOS_URL = "/voluntarios"`, `AVES_URL` permanece
`https://aves.chirimoyo.org`. Razón: comunidad y voluntarios son rutas del **mismo origen**
que cualquier página de `apps/sitio`, así que un href relativo resuelve correctamente bajo
`chirimoyo.org`. Aves es otro origen/deploy → debe seguir absoluto.
**Alternativa descartada:** una sola variable base + concatenación. Innecesario para 2 paths fijos.

### 2. Mantener `<a href>` (no migrar a `<Link>`)
Los consumidores (`Header`, `CierreCTA`, `Hero`) siguen usando `<a href={URL}>`. Con href
relativo el navegador hace una recarga completa al cambiar de sección — aceptable para un sitio
de contenido y mantiene el diff mínimo.
**Alternativa descartada:** migrar a `next/link` para navegación SPA. Mejor UX teórica, pero
mayor superficie de cambio y riesgo; se puede hacer después si se justifica.

### 3. `apps/catalogo`: `COMUNIDAD_URL` absoluto al **vanity**
El catálogo se sirve en `aves.chirimoyo.org` (otro origen). Una ruta relativa `/comunidad`
apuntaría a `aves.chirimoyo.org/comunidad` (404). Se mantiene **absoluto**, pero apuntando al
vanity `https://comunidad.chirimoyo.org`, que hace 301 al path canónico `chirimoyo.org/comunidad`.
**Alternativa descartada:** apuntar directo a `https://chirimoyo.org/comunidad`. Funciona igual,
pero usar el vanity centraliza el destino canónico en la regla de redirect (un solo lugar que
cambiar si el path canónico se mueve) y es coherente con el rol de difusión del vanity.

### 4. Eliminar `middleware.ts` completo
Tras quitar el rewrite por host, el middleware queda sin lógica. Se borra el archivo entero en
vez de dejar un `middleware` vacío (que igual ejecutaría el matcher en cada request sin propósito).

### 5. Redirect vanity: documentar, no configurar
La regla 301 (`comunidad.*`, `voluntarios.*` → path equivalente, preservando subpath) se
**documenta** en el runbook/README para que #53 la ejecute. No se toca infraestructura en este
change (no hay IaC en el repo).

### 6. `.env.example`: limpiar claves de subdominio
`NEXT_PUBLIC_CF_BEACON_TOKENS` se reduce a la clave que realmente renderiza la app
(`chirimoyo.org`); se retiran `comunidad.*` y `voluntarios.*` (ahora solo redirigen, nunca
cargan el beacon). Es ejemplo de configuración, no afecta runtime por sí mismo.

## Risks / Trade-offs

- **[Catálogo apunta a un vanity aún no configurado]** → mientras #53 no cree el redirect,
  `comunidad.chirimoyo.org` puede no resolver. Mitigación: el vanity ya existía bajo ADR-0008
  apuntando a la app; el riesgo real solo aparece cuando #53 reconfigure DNS, y ahí se valida
  el 301 como parte del deploy.
- **[Enlaces impresos/publicados con `comunidad.chirimoyo.org`]** → siguen vivos vía el 301,
  pero apuntan a una URL ya no canónica. Aceptado explícitamente en ADR-0023.
- **[Recarga completa al navegar entre secciones]** → consecuencia de mantener `<a>`. Aceptable
  para sitio de contenido; revisable a futuro.
- **[Analítica por dominio queda inconsistente]** → `comunidad.*`/`voluntarios.*` dejan de emitir
  pageviews. Fuera de alcance aquí; se resuelve en `analitica-privada-cloudflare` / #53. Se
  limpian las claves del `.env.example` para no inducir a error.

## Migration Plan

1. Editar `apps/sitio/lib/links.ts`, `apps/catalogo/lib/links.ts`, `content/landing/enlaces.json`.
2. Borrar `apps/sitio/middleware.ts`.
3. Limpiar `apps/sitio/.env.example`.
4. Actualizar spec `sitio-app` (delta), docs y runbook del redirect.
5. Verificar build de ambas apps y enlaces internos relativos.
6. El deploy real (un site + 301) lo ejecuta #53; rollback de este change = revertir el commit
   (no hay migración de datos ni estado persistente).

## Open Questions

- Ninguna pendiente: las dos decisiones abiertas en exploración (destino del `COMUNIDAD_URL` del
  catálogo y `<a>` vs `<Link>`) ya se resolvieron (vanity / mantener `<a>`).
