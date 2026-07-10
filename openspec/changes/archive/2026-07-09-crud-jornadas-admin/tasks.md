## 1. Tipos y validación

- [x] 1.1 Crear `apps/admin/lib/jornadas/types.ts` con `TipoJornada`/`JornadaRecurrente`/`EventoJornada` (mismos campos que `apps/sitio/lib/jornadas.ts`)
- [x] 1.2 Crear `apps/admin/lib/jornadas/validation.ts` (validación manual: título/hora no vacíos, `tipo` restringido al enum cerrado, `dia`/`ordinales` si recurrente, `fecha` ISO si evento)

## 2. Lectura y server actions

- [x] 2.1 Crear `apps/admin/lib/jornadas/read.ts` con `getAllJornadasAdmin()` y `existeJornada(slug)` (espejo de `noticias/read.ts`, sin filtrar por estado)
- [x] 2.2 Crear `apps/admin/lib/jornadas/actions.ts` con `crearJornada`, `actualizarJornada`, `borrarJornada` (server actions, `"use server"`), reusando `slugify` de `apps/admin/lib/noticias/slug.ts` (D14, sin duplicar)
- [x] 2.3 Implementar chequeo de unicidad de slug en `crearJornada`
- [x] 2.4 Crear `apps/admin/lib/jornadas/revalidar.ts` (espejo de `noticias/revalidar.ts`, D12): `fetch(POST /api/revalidate)` con `{ tag: "jornadas" }`, try/catch, no lanza si falla
- [x] 2.5 Invocar el helper de revalidación desde los 3 server actions incondicionalmente (D3, sin chequeo de estado)

## 3. Diseño visual (Claude Design, antes de codear)

- [x] 3.1 Construir mockup de la lista de jornadas (tabla con título, tipo con badge/ícono, resumen de regla/fecha, acciones)
- [x] 3.2 Construir mockup del formulario de crear/editar con la sección condicional según `kind` (recurrencia vs fecha)
- [x] 3.3 Revisar los mockups con el usuario antes de traducir a código — aprobado sin cambios

## 4. UI en apps/admin

- [x] 4.1 Crear `apps/admin/app/(authed)/jornadas/page.tsx` (lista, server component)
- [x] 4.2 Crear `apps/admin/app/(authed)/jornadas/nueva/page.tsx` (formulario de creación, con selector de `kind` inicial)
- [x] 4.3 Crear `apps/admin/app/(authed)/jornadas/[slug]/editar/page.tsx` (formulario de edición, slug y `kind` deshabilitados)
- [x] 4.4 Crear componente de formulario compartido (client component, `useActionState`, sección condicional por `kind`, reusando `Campo` de `apps/admin/components/noticias/Campo.tsx`)
- [x] 4.5 Agregar acción de borrar (con diálogo de confirmación, reusando el patrón de `BorrarBoton.tsx`) en la lista
- [x] 4.6 Agregar un card "Jornadas" en `app/(authed)/dashboard/page.tsx`, junto al de "Noticias" de #140

## 5. Verificación end-to-end

- [x] 5.1 Con emulators corriendo (Firestore + Auth), crear una jornada recurrente (semanal), verificar que aparece en `apps/sitio` local (`/voluntarios`) tras revalidar — OK (slug autogenerado, expandida a próximas ocurrencias, visible incluso en el select del formulario de inscripción)
- [x] 5.2 Crear un evento puntual con fecha futura, verificar que también aparece — OK (intercalado correctamente por fecha con las ocurrencias recurrentes)
- [x] 5.3 Editarlos y confirmar que el cambio se refleja tras revalidar — OK (cambio de hora de 16:30→17:00 reflejado en `/voluntarios` tras el `POST /api/revalidate`)
- [x] 5.4 Borrarlos y verificar que los documentos ya no existen en el emulator — OK (lista del admin bajó de 2 → 1 → 0)
- [x] 5.5 Probar el caso de slug duplicado, tipo fuera del enum cerrado, y validación fallida (hora vacía, fecha inválida, mensual-ordinal sin ordinales seleccionados) — OK: hora vacía y ordinales sin seleccionar rechazados con su mensaje; slug duplicado rechazado sin escribir nada; el enum cerrado de `tipo` se confirmó por code-review (no se puede forzar un valor inválido vía el `<select>` de la UI, y `TIPOS_VALIDOS.includes()` lo rechazaría server-side)
- [x] 5.6 `npm run typecheck && npm run build` en `apps/admin` (confirmar que `next build` no toca Firestore) — OK (todas las rutas de jornadas son `ƒ` dinámicas)

## 6. OpenSpec y PR

- [ ] 6.1 `/opsx:archive` del cambio `crud-jornadas-admin`, sincronizando `openspec/specs/jornadas-admin/spec.md`
- [ ] 6.2 Commit en branch `feature/fase6-crud-jornadas-admin` y PR contra `main` (usar `Closes #141` en inglés en la descripción, ver memoria de feedback sobre palabras clave de cierre)
