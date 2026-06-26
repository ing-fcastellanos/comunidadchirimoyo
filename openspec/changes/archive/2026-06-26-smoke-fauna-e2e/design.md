## Context

`apps/catalogo` exporta estático (`output: export` → `out/`) y se sirve por Firebase Hosting con `cleanUrls: true, trailingSlash: false`: una ruta `/aves/<slug>` se sirve desde `out/aves/<slug>.html` (Next export genera archivos planos `<path>.html`, p. ej. ya vimos `out/busqueda.html`, `out/index.html`). Ya existe el molde `scripts/validar-fichas.mts` (tsx, `node:fs/promises`, reporte `✓/✖`, `process.exit(1)` al fallar) y se corre vía `npm run`. `tsx` está en devDeps; `fetch` es nativo en Node 18+. El catálogo no tiene hoy ninguna referencia a un API (grep da 0). El vanity `aves.chirimoyo.org → fauna.chirimoyo.org/aves` (ADR-0024) aún no está configurado.

## Goals / Non-Goals

**Goals:**
- Verificación end-to-end **repetible y determinista** del `out/` del catálogo, cubriendo los criterios de #95.
- Cero dependencias nuevas, cero ADR; reusar el patrón tsx existente.
- Engancharse a `deploy_prod` como puerta previa al deploy.
- Verificar el vanity 301 sin bloquear mientras no esté configurado.

**Non-Goals:**
- Suite de browser e2e (Playwright manejando la página) — frágil con imágenes remotas de GCS, roza test infra → ADR.
- Ejecutar el `build` dentro del smoke (lo hace `deploy_prod` antes).
- Configurar el redirect del vanity (lo aplica el operador).

## Decisions

**D1 — Afirmar sobre `out/`, no sobre un navegador.** El smoke lee los artefactos estáticos ya construidos. Determinista, sin red salvo el vanity, sin colgarse esperando imágenes del bucket. *Alternativa descartada:* Playwright contra `out/` servido — más fiel al «cargan» del criterio, pero lento/flaky por las imágenes remotas y empieza a ser una suite de browser.

**D2 — Resolución de rutas según `cleanUrls`.** Un enlace `/p` se considera servible si existe `out/p.html` **o** `out/p/index.html` **o** un archivo `out/p` (assets/PDF). El resolver normaliza, ignora anclas (`#…`), query (`?…`), externos (`http(s)://`, `mailto:`) y la raíz `/` → `out/index.html`.

**D3 — Superficie esperada explícita + detalle derivado.** Las rutas «marco» se listan explícitas (`/`, `/aves`, `/anfibios`, `/reptiles`, `/busqueda`, `/aves/buscador`). El **detalle por grupo** se deriva: por cada grupo, tomar el primer `out/<grupo>/<algo>.html` existente y afirmar que carga; así no se hardcodean slugs que pueden cambiar.

**D4 — Enlaces internos sin parser DOM.** Extraer `href="/…"` con regex sobre el HTML de las páginas marco, filtrar a internos `/<grupo>/<slug>` (grupos válidos: aves|anfibios|reptiles), deduplicar y afirmar que **cada destino resuelve** (D2). Evita añadir cheerio/jsdom.

**D5 — Check «sin API».** Afirmar que ningún `.html`/`.js` de `out/` contiene una URL de API. Patrón configurable (`SMOKE_API_PATTERN`); el default apunta al **backend real**: host de Cloud Run (`\.a\.run\.app`), `api.chirimoyo`, o los endpoints `/api/(contacto|inscripci)`. **No** el genérico `/api/`: el runtime de Next incluye `e.startsWith("/api/")` en `main-*.js`, que sería un falso positivo. Con el patrón preciso, el `out/` actual da 0 coincidencias.

**D6 — Vanity opt-in (default SKIP).** El check del vanity es **opt-in explícito**, no auto-intento. Motivo descubierto en la implementación: `aves.chirimoyo.org` **hoy resuelve a 200** (no a error de red), así que una rama «error de red → SKIP» no protegería —caería en FAIL antes de configurar el redirect—. Reglas:
- `SMOKE_VANITY` ≠ `"1"` (default) → **SKIP** con nota «export SMOKE_VANITY=1 cuando el 301 esté configurado». No toca la red.
- `SMOKE_VANITY=1` → verificación estricta: `fetch(VANITY_URL, { redirect: "manual" })` con `AbortController` + timeout (limpiado en `finally`); **pass** si `status === 301` y `location` empieza por `https://fauna.chirimoyo.org/aves`; cualquier otra cosa (200, location distinto, no resuelve/timeout) → **FAIL**.
Así pasa verde hoy (SKIP) y se vuelve aserción real cuando el operador active el flag tras configurar el DNS.

**D8 — Salida limpia.** El script usa `process.exitCode = 1` (no `process.exit`) para que Node drene los handles; con el fetch del vanity esto evita la aserción de libuv en Windows al salir con un timer/socket a medio cerrar.

**D7 — Reporte y exit.** Una línea `✓/⚠/✖` por chequeo, resumen final con conteo de `pass/skip/fail`; `process.exit(1)` si hay ≥1 FAIL (los SKIP no rompen). `npm run smoke` corre el script; `deploy_prod` lo intercala tras `build` y antes de `firebase deploy`.

## Risks / Trade-offs

- **`out/` ausente/viejo** → el smoke afirmaría sobre un build obsoleto. Mitigación: si falta `out/index.html`, FAIL inmediato con «corre `npm run build` primero»; en `deploy_prod` siempre va tras el build.
- **Regex de enlaces frágil** → podría perder hrefs en atributos exóticos. Mitigación: el alcance es `href="/…"` en HTML server-rendered, suficiente para enlaces de navegación; el objetivo es detectar `/<grupo>/<slug>` rotos, no auditar todo el HTML.
- **Falso verde del vanity** mientras hace SKIP → es intencional y queda **explícito en el reporte** (⚠ «vanity no configurado»), no silencioso.
- **No cubre la búsqueda en cliente real** (Non-Goal). Aceptado: se validó en #85; el smoke afirma que `/busqueda` y su JS se exportan.

## Open Questions

Ninguna abierta. Alcance, inclusión del vanity (opt-in/SKIP) y patrón del script confirmados con el usuario.
