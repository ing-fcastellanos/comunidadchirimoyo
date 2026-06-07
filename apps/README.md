# apps/

Frontends Next.js 15 (App Router). Cada app es deployable de forma independiente. Ver [ADR-0001](../docs/decisions/0001-monorepo-layout.md).

| App | Subdominios | Estado |
|-----|-------------|--------|
| `sitio/` | chirimoyo.org · comunidad.* · voluntarios.* | _por scaffoldear (Fase 0)_ |
| `catalogo/` | aves.* (incl. anfibios) | _por scaffoldear (Fase 0)_ |

El scaffold de cada app (Next 15 + Tailwind v4 + shadcn/ui + tokens de diseño) es una issue de Fase 0. Hasta entonces estas carpetas están vacías.

Estrategia multi-subdominio de `sitio`: ver [ADR-0008](../docs/decisions/0008-multisubdominio-una-app.md).
