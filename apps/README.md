# apps/

Frontends Next.js 15 (App Router). Cada app es deployable de forma independiente. Ver [ADR-0001](../docs/decisions/0001-monorepo-layout.md).

| App | Dominio(s) | Estado |
|-----|------------|--------|
| `sitio/` | chirimoyo.org (+ `/comunidad`, `/voluntarios`); `comunidad.*` y `voluntarios.*` vanity 301 | en desarrollo |
| `catalogo/` | fauna.chirimoyo.org (aves, anfibios, reptiles); `aves.*` vanity 301 → `/aves` | en desarrollo |
| `admin/` | admin.chirimoyo.org (panel de gestión: noticias, jornadas) | scaffold (#138), sin login todavía |

Las tres apps usan Next 15 + Tailwind v4 + shadcn/ui + tokens de diseño compartidos. El catálogo (`fauna.chirimoyo.org`, ADR-0024) es un export estático; `sitio` y `admin` corren en Cloud Run (ADR-0015), este último Firebase-native (ADR-0030): sin API propio para su acceso a datos.

Estrategia multi-subdominio de `sitio`: ver [ADR-0008](../docs/decisions/0008-multisubdominio-una-app.md).
