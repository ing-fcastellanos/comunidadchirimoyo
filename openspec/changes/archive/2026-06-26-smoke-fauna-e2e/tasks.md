# Tasks — smoke-fauna-e2e

## 1. Script `smoke-fauna.mts`

- [x] 1.1 Crear `apps/catalogo/scripts/smoke-fauna.mts` (tsx; resolver `OUT_DIR` desde `import.meta.url`, default `apps/catalogo/out`; patrón de `validar-fichas.mts`). Helper de reporte que acumula resultados `{ nombre, estado: pass|skip|fail, detalle }` y al final imprime una línea por chequeo + resumen, `process.exitCode = 1` (no `process.exit`, para drenar handles limpiamente) si hay ≥1 `fail`
- [x] 1.2 **Guard de build**: si `out/index.html` no existe → fail inmediato con mensaje «corre `npm run build` primero»
- [x] 1.3 **Resolver de rutas** (`cleanUrls`): `/p` resuelve si existe `out/p.html` | `out/p/index.html` | `out/p`; `/` → `out/index.html`. Ignora externos, anclas (`#`), query (`?`)
- [x] 1.4 **Chequeo rutas marco**: afirmar que `/`, `/aves`, `/anfibios`, `/reptiles`, `/busqueda`, `/aves/buscador` resuelven y no están vacíos; + un detalle por grupo derivado (primer `out/<grupo>/*.html`)
- [x] 1.5 **Chequeo enlaces internos**: extraer `href="/…"` (regex) del HTML de las páginas marco, filtrar a `/<grupo>/<slug>` (aves|anfibios|reptiles), dedup, afirmar que cada destino resuelve (1.3); reportar los rotos
- [x] 1.6 **Chequeo PDFs**: `out/catalogo-aves-chirimoyo.pdf` y `out/catalogo-herpetofauna-chirimoyo.pdf` existen, tamaño > 0 y empiezan con `%PDF`
- [x] 1.7 **Chequeo sin-API**: recorrer `.html`/`.js` de `out/` y afirmar 0 coincidencias del patrón `SMOKE_API_PATTERN`; default apunta al backend real (`\.a\.run\.app` | `/api/(contacto|inscripci)` | `api\.chirimoyo`), NO el genérico `/api/` (falso positivo del runtime de Next); reportar archivo(s) en caso de fuga
- [x] 1.8 **Chequeo vanity (opt-in, default SKIP)**: por defecto SKIP sin tocar red (el host resuelve a 200 antes de configurar el 301); con `SMOKE_VANITY=1` → `fetch(VANITY_URL, { redirect: "manual" })` con `AbortController`+timeout (clear en `finally`): 301 con `location` que empieza por `https://fauna.chirimoyo.org/aves` → pass; cualquier otra respuesta / no resuelve / timeout → fail. Vars: `VANITY_URL` (default `https://aves.chirimoyo.org/`), `SMOKE_VANITY`

## 2. Integración en package.json

- [x] 2.1 Añadir script `"smoke": "tsx ./scripts/smoke-fauna.mts"` en `apps/catalogo/package.json`
- [x] 2.2 Enganchar en `deploy_prod`: `... && npm run build && npm run smoke && npm run firebase:deploy:prod` (smoke tras build, antes del deploy)

## 3. Verificación

- [x] 3.1 `npm run build` y luego `npm run smoke` → pasa en verde con el build actual (vanity en SKIP por DNS no configurado)
- [x] 3.2 Prueba negativa de humo: renombrar temporalmente un PDF o romper un enlace y confirmar que el smoke **falla** (exit ≠ 0); restaurar
- [x] 3.3 Confirmar que el reporte distingue claramente `pass` / `skip` (vanity) / `fail` y que `SMOKE_VANITY=0` omite el check de red
- [x] 3.4 Actualizar `apps/catalogo/README.md` (sección scripts/hosting) mencionando `npm run smoke` y su lugar en `deploy_prod`
