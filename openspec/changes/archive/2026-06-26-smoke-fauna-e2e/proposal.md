## Why

La Fase 2 («Anfibios») agregó herpetofauna, renombró el catálogo a `fauna.chirimoyo.org` con tres grupos por path (ADR-0024), añadió el buscador general, el índice por grupo, los PDF y las destacadas. Antes de cerrar la fase hace falta una verificación **end-to-end repetible** de que el flujo completo del catálogo sigue íntegro tras todos esos cambios (#95). Hoy no existe ninguna red de seguridad: un enlace roto a `/<grupo>/<slug>`, un PDF corrupto o una fuga al API pasarían inadvertidos hasta producción.

## What Changes

- **Nuevo script `scripts/smoke-fauna.mts`** (tsx, mismo patrón que `validar-fichas.mts`) que **afirma sobre el `out/` ya construido** del catálogo:
  1. **Rutas** existen y no están vacías: hub `/`, índices `/aves` `/anfibios` `/reptiles`, `/busqueda`, `/aves/buscador`, y **un detalle por grupo**.
  2. **Enlaces internos** `/<grupo>/<slug>` extraídos del HTML resuelven a archivos reales en `out/` (no 404).
  3. **PDFs** `out/*.pdf` existen e íntegros (empiezan con `%PDF`).
  4. **Sin API**: ningún `.html`/`.js` de `out/` referencia una URL de API (catálogo estático, ADR-0005/0006).
- **Capa de red opt-in para el vanity**: comprobación HTTP que afirma `aves.chirimoyo.org` → **301** `https://fauna.chirimoyo.org/aves`. Hace **SKIP (no falla)** si el DNS aún no está configurado o no responde; se vuelve aserción real una vez exista el redirect.
- **`npm run smoke`** en `apps/catalogo/package.json`; **enganchado en la cadena `deploy_prod`** (antes del deploy).
- Cierra **#95** y la **Fase 2**.

## No-goals

- **No** se introduce un framework de testing (Vitest/Jest/Cypress) ni una suite de browser e2e con Playwright. El script es una aserción sobre artefactos estáticos + un check HTTP; `tsx` ya está en devDeps, así que **no añade dependencia ni requiere ADR**.
- **No** se ejecuta la búsqueda en cliente dentro de un navegador real (la hidratación/filtrado en browser queda fuera; se cubrió manualmente en #85). Un e2e de navegador sería un cambio mayor (roza «test infra sistemática» → ADR) y es frágil con las imágenes remotas de GCS.
- **No** se configura el vanity 301 en sí (DNS/Hosting): eso lo aplica el operador (instrucciones aparte). El script solo lo **verifica**.
- **No** corre el `build`: asume `out/` presente y avisa si falta (el build vive en `deploy_prod` antes del smoke).

## Capabilities

### New Capabilities
- `smoke-catalogo-fauna`: contrato del smoke test end-to-end del catálogo — qué superficies, enlaces, PDFs y ausencia de API se verifican sobre el `out/` estático, más el check opt-in del vanity 301.

### Modified Capabilities
<!-- ninguna -->

## Impact

- **Sub-dominio afectado:** aves (catálogo, `fauna.chirimoyo.org`).
- **Código (`apps/catalogo`):** nuevo `scripts/smoke-fauna.mts`; script `smoke` y enganche en `deploy_prod` en `package.json`.
- **Dependencias:** ninguna nueva (usa `tsx`, ya presente; el check HTTP usa `fetch` nativo de Node).
- **Sin cambios** en API, esquema, ni convenciones documentadas → **no requiere ADR**.
