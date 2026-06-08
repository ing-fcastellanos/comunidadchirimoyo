# apps/catalogo

Catálogo de fauna del humedal de Chirimoyo → **aves.chirimoyo.org** (aves + anfibios/reptiles como categoría).

Next.js 15 (App Router) · TypeScript · Tailwind v4. **Catálogo 100% estático** (ADR-0005): export estático servido directo por Firebase Hosting, **sin Cloud Run ni Docker** (ADR-0014).

## Comandos

```bash
npm install
npm run dev            # servidor de desarrollo (:3000)
npm run build          # genera out/ (estático)
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm run sync:tokens    # regenera app/tokens.css desde docs/design-system/
npm run deploy_prod    # build + firebase deploy (hosting:prod)
```

Para previsualizar el export: `npx serve out`.

## Sistema de diseño

Los tokens viven en `app/tokens.css`, **generado** desde la fuente canónica `docs/design-system/tokens.css` con `npm run sync:tokens` (no editar a mano; ver [ADR-0013](../../docs/decisions/0013-tokens-compartidos-por-copia.md)). `app/globals.css` importa Tailwind y luego los tokens. Fuentes en `lib/fonts.ts` (next/font). Primitivas en `components/ui/`.

## Contenido

`lib/content.ts` lee `content/fauna/` desde la raíz del repo en build (override con `CONTENT_DIR`). Hoy es un stub tipado; el parseo real llega en #10/#11 según el esquema de #9.

## Hosting

`firebase.json` publica `out/` directo (target `prod`). El site `aves-chirimoyo` en `.firebaserc` es provisional — se fija al conectar el dominio `aves.chirimoyo.org` (#3). Deploy a producción en #15.

## Pendiente (otros issues)

Listado (#11) · buscador/filtros (#12) · detalle por especie (#13) · PDF (#14) · migrar datos+imágenes (#10) · deploy (#15).
