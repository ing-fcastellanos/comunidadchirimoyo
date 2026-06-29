# CLAUDE.md

Guía para Claude (y otros agentes IA) trabajando en este repositorio.

## Identidad del proyecto

**Comunidad Chirimoyo** es un monorepo de sitios de difusión para la defensa del **humedal de Chirimoyo** (norte de Orizaba, Veracruz). Es un proyecto comunitario y ecologista — la mayoría es **contenido**, no transacción.

- `apps/sitio` — Next.js 15 (App Router). Sirve **chirimoyo.org** en un solo dominio, con las secciones por path: landing + linktree + contacto (`/`), **`/comunidad`** (historia, acciones, misión/visión, noticias) y **`/voluntarios`** (jornadas, calendario, inscripción, donaciones). Los subdominios `comunidad.*` y `voluntarios.*` son solo redirects vanity 301 (ADR-0023).
- `apps/catalogo` — Next.js 15 (App Router). Sirve **fauna.chirimoyo.org**: catálogo de fauna con **hub** (`/`: grupos + destacadas + acceso a búsqueda), **paths por grupo** (`/aves`, `/anfibios`, `/reptiles`), **buscador general** en cliente (`/busqueda`), **detalle** (`/<grupo>/<slug>`) y **PDFs** por disciplina (aves + herpetofauna) — todo **estático**. `aves.chirimoyo.org` es solo un redirect vanity 301 a `fauna.chirimoyo.org/aves` (ADR-0024).
- `services/api` — Python 3.12 + Flask + Firestore, en Cloud Run. **Mínimo**: solo inscripciones de voluntarios y formulario de contacto.

El stack y las convenciones se heredan de **Sociedad Salvaje** (`C:\Users\Frank\source_code\sociedadsalvaje`). Lee [README.md](README.md) y [docs/architecture/overview.md](docs/architecture/overview.md) antes de cambios cross-cutting.

## Stack — verdades del proyecto

| Capa | Tecnología |
|---|---|
| Backend lenguaje | Python 3.12 |
| Backend framework | Flask |
| Backend persistencia | **Google Cloud Firestore** (NoSQL) |
| Backend email | SMTP (confirmaciones de inscripción) |
| Backend deploy | Docker → Artifact Registry → Cloud Run (`northamerica-south1`) |
| Frontend lenguaje | TypeScript 5 |
| Frontend framework | Next.js 15 (App Router) |
| Frontend estilos | Tailwind v4 + shadcn/ui (tokens derivados de los diseños v0.dev de aves) |
| Frontend hosting | Cloud Run + Firebase Hosting rewrites |
| Contenido | Markdown/JSON en `content/` |
| Analítica | Privada (Cloudflare Web Analytics, ADR-0020) — sin cookies de rastreo |

**No** hay PostgreSQL, **no** hay Nx/Turborepo/workspaces, **no** hay CMS, **no** hay auth de usuarios, **no** hay pasarela de pagos. Si ves restos de otra stack: márcalo y corrige.

## ⚠️ Avisos críticos

### El catálogo es estático

El buscador y el detalle de aves/anfibios **no llaman al API**. Los datos viven en `content/` (Markdown/JSON) y la búsqueda es **en cliente**. No introduzcas un endpoint de búsqueda sin un ADR que lo justifique. Ver [ADR-0005](docs/decisions/0005-catalogo-estatico-anfibios-categoria.md).

### El API es mínimo

`services/api` existe **solo** para recibir inscripciones de voluntarios y mensajes de contacto. No tiene auth de usuarios, ni RBAC, ni pagos. Ver [ADR-0006](docs/decisions/0006-api-minima.md). Antes de agregarle responsabilidades, abre un ADR.

### Datos de voluntarios = datos personales

Las inscripciones contienen PII. Nunca se loguean. Acceso restringido en Firestore. Aviso de privacidad y consentimiento obligatorios. Ver [ADR-0012](docs/decisions/0012-privacidad-datos-voluntarios.md).

### Credenciales — nunca commitear

- Service accounts de Firestore (`*service_account*.json`).
- Archivos `.env.*`.

Bloqueados por `.gitignore` raíz. Edítalos en tu máquina, no los muevas al repo.

### Sin tooling de monorepo

No introduzcas Nx, Turborepo ni workspaces sin ADR. Cada app/servicio se construye independiente con sus scripts nativos. Ver [ADR-0001](docs/decisions/0001-monorepo-layout.md).

## Estructura de carpetas

```
comunidadchirimoyo/
├── apps/<sitio>/      cada front es deployable independiente
├── services/<nombre>/ cada backend es deployable independiente
├── content/           Markdown/JSON: fichas de fauna (aves, anfibios, reptiles), landing, noticias, historia, jornadas
├── docs/              documentación cross-cutting
│   ├── decisions/     ADRs numerados monotónicamente
│   ├── adr/           _template.md + _index.md
│   └── architecture/  overview.md
├── scripts/           setup-*.sh (GitHub project, labels, milestones, issues)
├── openspec/          contrato de comportamiento (specs + changes)
└── CLAUDE.md, README.md, ROADMAP.md
```

## Convenciones de cambios

### Frontend

- Next.js 15 App Router. Server Components por defecto; `"use client"` solo cuando se necesite estado/hooks/eventos del browser.
- Tailwind v4 + shadcn/ui. Tokens de color/tipografía en `app/globals.css` — no hardcodear colores fuera de ahí.
- Path alias `@/` a la raíz del proyecto.
- Componentes de layout reutilizables en `components/layout/`.
- Solo español por ahora, pero estructura preparada para i18n futuro (no hardcodear strings de forma que impida traducir después). Ver [ADR-0011](docs/decisions/0011-diseno-i18n.md).

### Backend

- División: `controllers/` → entrada HTTP, `services/` → lógica, `datastore/` → Firestore, `models/` → entidades.
- Cambios de comportamiento → actualiza la spec OpenSpec correspondiente en el mismo cambio.
- No introduzcas Django, FastAPI, SQLAlchemy ni otra capa de persistencia sin discusión.

### Contenido

- Fichas, noticias y jornadas en `content/` como Markdown/JSON. Respeta el esquema definido en su issue/spec.
- Imágenes optimizadas; nombres en kebab-case.
- **Markdown editorial** (cuerpos de notas de comunidad): se renderiza con `react-markdown` + `remark-gfm` vía `apps/sitio/components/ui/Markdown.tsx`, **sin HTML crudo** ([ADR-0026](docs/decisions/0026-renderizador-markdown.md)). El *layout estructurado* (landing, fichas) sigue usando los parsers caseros `splitSecciones`/`parseSecciones` — no son markdown libre. Ya no es cierto el "cero dependencias de markdown".

### OpenSpec

- Cambios de comportamiento del backend → siempre un cambio en `openspec/changes/<name>/`.
- Las specs en `openspec/specs/<capability>/spec.md` son la fuente de verdad del backend.

### Flujo obligatorio para nuevos requerimientos

```
/opsx:explore → [v0.dev si aplica] → /opsx:propose → /opsx:apply → /opsx:archive
```

No implementar sin haber pasado por explore + propose. v0.dev solo para issues con UI de diseño nuevo (el catálogo de aves ya tiene diseños v0.dev que marcan la pauta visual del proyecto).

### ADRs

Decisiones no triviales (nuevo servicio, cambio de stack, romper convenciones) → `docs/decisions/NNNN-titulo.md`. Numeración monotónica. Inmutables una vez `Accepted` (se supersede, no se edita). Actualiza el índice en [docs/adr/_index.md](docs/adr/_index.md).

## Cosas que **no** existen todavía

Para que ningún agente las invente:

- No hay CI/CD de deploy automático (solo CI de checks en PR; deploys manuales).
- No hay suite de tests unitarios/integración con framework (Jest/Vitest) aún. Sí existen **scripts de validación** ad-hoc del catálogo: `npm run validate:fichas` (esquema de fichas) y `npm run smoke` (smoke test e2e sobre el `out/`), enganchados en `deploy_prod`.
- No hay infraestructura como código.
- No hay monitoreo/alertas más allá de Cloud Logging.

Si algún día se introduce alguno: ADR + actualizar este archivo.
