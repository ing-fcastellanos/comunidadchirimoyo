# Comunidad Chirimoyo

Sitios web de la **Comunidad Chirimoyo** — un grupo de vecinos y ecologistas que defiende **el humedal de Chirimoyo**, al norte de Orizaba, Veracruz. El humedal es hogar de biodiversidad y de aves residentes y migratorias, y ha resistido intentos de reducción, contaminación y privatización. Este monorepo da difusión a esa lucha y al espacio natural.

## Sitios

| URL | Qué es | App |
|---|---|---|
| `chirimoyo.org` | Landing principal: introducción a la lucha, linktree, contacto | `apps/sitio` |
| `chirimoyo.org/comunidad` | Historia, acciones, visión/misión y noticias | `apps/sitio` |
| `chirimoyo.org/voluntarios` | Jornadas de limpieza, calendario, inscripción y donaciones | `apps/sitio` |
| `fauna.chirimoyo.org` | Catálogo de fauna (aves, anfibios y reptiles): hub, índices por grupo, buscador, detalle y PDFs | `apps/catalogo` |
| `api.chirimoyo.org` | Servicio mínimo: inscripciones de voluntarios y contacto | `services/api` |

`comunidad.chirimoyo.org` y `voluntarios.chirimoyo.org` se conservan solo como **redirects vanity 301** hacia su path equivalente (ADR-0023). `aves.chirimoyo.org` es un **vanity 301** hacia `fauna.chirimoyo.org/aves` (ADR-0024).

## Stack

- **Frontend**: Next.js 15 (App Router) · TypeScript 5 · Tailwind v4 · shadcn/ui
- **Backend**: Python 3.12 · Flask · Google Cloud Firestore
- **Infra**: Docker → Artifact Registry → Cloud Run · Firebase Hosting (rewrites) · región `northamerica-south1`
- **Contenido**: Markdown/JSON versionado en `content/` (sin CMS)

## Estructura

```
comunidadchirimoyo/
├── apps/
│   ├── sitio/        Next 15 → landing + comunidad + voluntarios
│   └── catalogo/     Next 15 → fauna (aves, anfibios, reptiles)
├── services/
│   └── api/          Flask + Firestore (inscripciones + contacto)
├── content/          Markdown/JSON: fauna (aves, anfibios, reptiles), landing, noticias, historia, jornadas
├── docs/             documentación del monorepo (arquitectura, ADRs, gestión)
├── scripts/          setup-*.sh (labels, milestones, project, issues)
└── openspec/         specs + changes (contrato de comportamiento)
```

## Cómo trabajamos

Todo requerimiento sigue el flujo:

```
/opsx:explore → [v0.dev si hay UI] → /opsx:propose → /opsx:apply → /opsx:archive
```

El trabajo se organiza en GitHub Issues + Projects v2 + Milestones por fase. Ver [`docs/project-management.md`](docs/project-management.md) y el [`ROADMAP.md`](ROADMAP.md).

## Contribuir

Es un proyecto comunitario y abierto. Ver [`CONTRIBUTING.md`](CONTRIBUTING.md) y el [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md). Las vulnerabilidades se reportan según [`SECURITY.md`](SECURITY.md).

## Licencia

[MIT](LICENSE).
