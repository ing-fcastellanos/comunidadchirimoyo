## Why

El equipo comunitario necesita crear y editar jornadas/eventos de voluntariado sin tocar el repo ni esperar un deploy (ADR-0028), igual que ya pueden hacerlo con noticias (#140). Hoy la colección Firestore `jornadas` (#134/#137) solo se puebla vía el seed one-shot; no existe ninguna forma de escritura. Este cambio agrega el segundo CRUD real del panel, completando el alcance de contenido dinámico de la Fase 6 (noticias + jornadas).

## What Changes

- Nueva sección `app/(authed)/jornadas/` en `apps/admin`: lista (recurrentes + eventos mezclados, sin paginación), crear, editar y borrar.
- Server actions para las escrituras (crear/editar/borrar), con validación server-side manual (sin zod/yup, misma convención de #140).
- Slug autogenerado (slugify del título) al crear, inmutable en edición; chequeo de unicidad contra el doc ID.
- `kind` (`recurrente` | `evento`) se fija al crear y es inmutable — convertir uno en otro requiere borrar+recrear.
- Formulario condicional según `kind`: recurrencia (`semanal` | `mensual-ordinal` + día + ordinales) para recurrentes, `fecha` para eventos.
- `tipo` (`limpieza` | `pajareada` | `evento`) como `<select>` de un enum cerrado — validado server-side, porque `apps/sitio/components/voluntarios/ProximasJornadas.tsx` tiene un mapeo hardcodeado a exactamente esos 3 valores y un valor fuera de ese conjunto rompe `/voluntarios` en runtime.
- Sin campo de estado borrador/publicado: a diferencia de noticias, toda jornada en Firestore está inmediatamente visible. Toda escritura dispara la revalidación del tag `jornadas` (vía el endpoint `/api/revalidate` ya existente en `apps/sitio`), sin la lógica condicional que sí necesita noticias.
- Diseño visual (lista + formulario) generado primero en Claude Design antes de traducirse a código, siguiendo el flujo ya usado en `/noticias` (#140) y `/login` (#139).

## Capabilities

### New Capabilities
- `jornadas-admin`: CRUD de jornadas/eventos desde `apps/admin` — creación, edición, borrado, validación server-side (incluyendo el enum cerrado de `tipo`), generación/inmutabilidad de slug y `kind`, y disparo incondicional de la revalidación on-demand del sitio.

### Modified Capabilities
(ninguna — `contenido-dinamico` ya documenta el contrato de forma del documento `jornadas`, acceso server-only y el endpoint de revalidación; este cambio los consume tal cual, sin alterar sus requisitos. `jornadas-voluntarios` ya documenta que "editar una jornada desde el admin y revalidar" refleja el cambio en el sitio — este cambio es exactamente lo que esa expectativa anticipaba.)

## Impact

- **Código nuevo:** `apps/admin/lib/jornadas/` (tipos + validación + server actions + revalidación), `apps/admin/app/(authed)/jornadas/**` (lista, crear, editar), componentes de formulario condicional por `kind`.
- **Código modificado:** `apps/admin/app/(authed)/dashboard/page.tsx` (agrega un card "Jornadas" junto al de "Noticias" de #140).
- **Dependencias:** ninguna nueva — reusa `firebase-admin` (ya presente), sin editor markdown (a diferencia de noticias, `descripcion` es un textarea plano).
- **Sin cambios:** `services/api` (Flask, ADR-0006 intacto), reglas de Firestore (`deny-all` preservado), `auth-admin` (gate de sesión sin cambios), esquema de datos de `jornadas` (ADR-0028, ya definido en `contenido-dinamico`), `firestore.indexes.json` (la lectura de jornadas no usa `where`/`orderBy`, no requiere índice compuesto).
- **Subdominios afectados:** admin (nuevo CRUD), sitio/voluntarios (consumidor pasivo de la revalidación, sin cambios de código).
