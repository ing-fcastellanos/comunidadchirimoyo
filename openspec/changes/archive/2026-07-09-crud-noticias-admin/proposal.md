## Why

El equipo comunitario necesita publicar y editar noticias sin tocar el repo ni esperar un deploy (ADR-0028). Hoy `apps/sitio` ya lee noticias desde Firestore en runtime (#134/#136), pero no existe ninguna forma de **escribir** en esa colección: la única fuente de escritura es el seed one-shot. `apps/admin` ya tiene login funcionando (#139); este cambio agrega la primera funcionalidad real del panel — el CRUD de noticias — implementando ADR-0030 (server actions + Admin SDK, sin extender el API Flask).

## What Changes

- Nuevo módulo `apps/admin/lib/firestore.ts`: cliente Firestore lazy-singleton vía ADC, espejo de `apps/sitio/lib/firestore.ts`.
- Nueva sección `app/(authed)/noticias/` en `apps/admin`: lista (todas, borrador+publicado, por fecha desc, sin paginación), crear, editar, borrar y alternar borrador/publicado.
- Server actions para las escrituras (create/update/delete/toggle-estado), con validación server-side manual (sin zod/yup) y `useActionState` para reportar errores al formulario.
- Slug autogenerado (slugify del título) al crear, inmutable en edición; chequeo de unicidad contra el doc ID.
- Timestamps de sistema: `createdAt`/`updatedAt` en cada escritura correspondiente; `publishedAt` se fija **una sola vez**, la primera vez que `estado` pasa a `publicado`, y nunca se sobreescribe después.
- Integración best-effort con el endpoint existente `POST /api/revalidate` de `apps/sitio`: se llama (con `{ tag: "noticias" }` y el secreto compartido) en cualquier escritura donde el estado sea o haya sido `publicado`; un fallo de red no bloquea ni revierte la escritura en Firestore, solo se muestra un aviso no bloqueante.
- Nuevas env vars server-only en `apps/admin`: `SITIO_BASE_URL` y `REVALIDATE_SECRET` (mismo valor que en `apps/sitio`), documentadas en `.env.example` y README.
- Editor del cuerpo (markdown) con textarea + vista previa, reusando `apps/sitio/components/ui/Markdown.tsx` (sin HTML crudo, ADR-0026).
- Campos `portada`/`portadaAlt` como texto plano (URL/ruta ya subida manualmente) — la subida real de archivos es #142, fuera de alcance.
- El placeholder `app/(authed)/dashboard/page.tsx` de #138/#139 se reemplaza por la sección real de noticias (o la sección de noticias se agrega junto a él, como primer contenido real del dashboard).
- Diseño visual (lista + formulario) generado primero en Claude Design antes de traducirse a código, siguiendo el flujo ya usado en `/login` (#139) y `/proteccion` (#78).

## Capabilities

### New Capabilities
- `noticias-admin`: CRUD de noticias desde `apps/admin` — creación, edición, borrado, transición borrador↔publicado, validación server-side, generación/inmutabilidad de slug, semántica de timestamps de sistema, y disparo best-effort de la revalidación on-demand del sitio.

### Modified Capabilities
(ninguna — `contenido-dinamico` ya documenta el contrato de forma del documento, acceso server-only y el endpoint de revalidación; este cambio los consume tal cual, sin alterar sus requisitos. `apps-admin` ya anticipa que el placeholder de `(authed)/dashboard` sería reemplazado por el dashboard real.)

## Impact

- **Código nuevo:** `apps/admin/lib/firestore.ts`, `apps/admin/lib/noticias/` (tipos + validación + server actions), `apps/admin/app/(authed)/noticias/**` (lista, crear, editar), componentes de formulario y editor markdown.
- **Código modificado:** `apps/admin/app/(authed)/dashboard/page.tsx` (reemplazado o enlazado desde la nueva sección), `apps/admin/.env.example`, `apps/admin/README.md`.
- **Dependencias:** ninguna nueva (reusa `firebase-admin`, ya presente en `apps/admin/package.json`; reusa `react-markdown`/`remark-gfm` — verificar si ya están en `apps/admin` o si hay que agregarlos, mismo caso que `@opentelemetry/api` en #139).
- **Sin cambios:** `services/api` (Flask, ADR-0006 intacto), reglas de Firestore (`deny-all` preservado), `auth-admin` (gate de sesión sin cambios), esquema de datos de `noticias` (ADR-0028, ya definido en `contenido-dinamico`).
- **Subdominios afectados:** admin (nuevo CRUD), sitio (consumidor pasivo de la revalidación, sin cambios de código).
