# Roadmap

El trabajo está dividido en fases ordenadas por dependencia técnica y prioridad de difusión. Cada fase es un **milestone** en GitHub. Ver [`docs/project-management.md`](docs/project-management.md) para el detalle del proceso.

## Modelo de fases

| Fase | Milestone | Foco | Por qué |
|------|-----------|------|---------|
| **0** | Foundation | Repo, monorepo skeleton, docs+ADRs, CI de checks, GCP/Firebase, DNS, sistema de diseño, scaffolds | Habilita todo lo demás |
| **1** | Aves | Datos en repo, listado+buscador, detalle, PDF, deploy del catálogo | Trabajo más avanzado y mayor diferenciador del humedal |
| **2** | Anfibios | Anfibios/reptiles integrados como grupos por path, hub con destacadas, buscador general, PDFs por disciplina, dominio único `fauna.chirimoyo.org` (ADR-0024) | Reusa toda la Fase 1; consolida el catálogo como guía de fauna |
| **3** | Presencia | `chirimoyo.org` (landing + linktree + contacto) + `comunidad` (historia, acciones, misión, noticias) | Narrativa pública de la lucha |
| **4** | Voluntarios | Jornadas, calendario, formulario de inscripción (API), donaciones informativas, emails | Convocatoria a jornadas de limpieza |
| **5** | Difusión & pulido | Analítica, SEO/OpenGraph, accesibilidad, sitemap, performance, observabilidad básica | Maximizar alcance y calidad |

## Decisiones de arquitectura

Las decisiones no triviales se documentan como [ADRs](docs/adr/_index.md). Las que enmarcan este roadmap:

- ADR-0001 — Layout del monorepo (2 apps + 1 service)
- ADR-0004 — Contenido en repo (sin CMS)
- ADR-0005 — Catálogo de fauna estático; anfibios como categoría
- ADR-0006 — API mínima (inscripciones + contacto)
- ADR-0008 — Multi-subdominio desde una sola app
- ADR-0024 — Catálogo de fauna en dominio único `fauna.chirimoyo.org`, grupos por path
- ADR-0025 — Esquema de ficha de fauna group-aware

## Principios

- **Difusión, no transacción.** La mayoría de los sitios son contenido. El backend existe solo donde de verdad hace falta.
- **Datos propios.** La inscripción de voluntarios vive en nuestra Firestore, no en servicios de terceros.
- **Privacidad por defecto.** Analítica sin rastreo personal; datos personales mínimos y con consentimiento.
- **Abierto.** Repo público, licencia MIT, contribuciones bienvenidas.
