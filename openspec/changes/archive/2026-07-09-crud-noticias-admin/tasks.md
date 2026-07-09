## 1. Acceso a Firestore en admin

- [x] 1.1 Crear `apps/admin/lib/firestore.ts` (singleton lazy vía ADC, espejo de `apps/sitio/lib/firestore.ts`, reusando la `App` ya inicializada por `firebase-admin.ts`)
- [x] 1.2 Verificar en el emulator local (`FIRESTORE_EMULATOR_HOST`, ya configurado en `.env.local` de #139) que el cliente conecta correctamente — verificado en la sesión e2e del grupo 7

## 2. Tipos y validación

- [x] 2.1 Crear `apps/admin/lib/noticias/types.ts` con `Noticia`/`NoticiaMeta`/`EstadoNota` (mismos campos que `apps/sitio/lib/noticias.ts`, sin duplicar por paquete compartido — ADR-0001)
- [x] 2.2 Crear `apps/admin/lib/noticias/slug.ts` con la función de slugify (kebab-case, sin tildes/ñ)
- [x] 2.3 Crear `apps/admin/lib/noticias/validation.ts` (validación manual: título/resumen no vacíos, fecha ISO, tags kebab-case, portadaAlt requerido si hay portada)

## 3. Server actions de escritura

- [x] 3.1 Crear `apps/admin/lib/noticias/actions.ts` con `crearNoticia`, `actualizarNoticia`, `alternarEstado`, `borrarNoticia` (server actions, `"use server"`)
- [x] 3.2 Implementar chequeo de unicidad de slug en `crearNoticia` (rechazar si `noticias/{slug}` ya existe)
- [x] 3.3 Implementar semántica de `createdAt`/`updatedAt`/`publishedAt` (D4: `publishedAt` solo se fija la primera vez)
- [x] 3.4 Implementar `borrarNoticia` como hard delete con verificación de estado previo (para disparar revalidación si estaba publicada)

## 4. Revalidación cross-app

- [x] 4.1 Agregar `SITIO_BASE_URL` y `REVALIDATE_SECRET` a `apps/admin/.env.example` y documentar en `apps/admin/README.md` (deben coincidir con los de `apps/sitio`)
- [x] 4.2 Crear helper `apps/admin/lib/noticias/revalidar.ts`: `fetch(POST /api/revalidate)` con el tag `noticias`, envuelto en try/catch, no lanza si falla
- [x] 4.3 Invocar el helper desde los server actions solo cuando el estado es o fue `publicado` (crear+publicar, editar publicada, despublicar, borrar publicada)
- [x] 4.4 Verificar manualmente con el emulator + un `apps/sitio` local corriendo que la revalidación llega y también que un fallo (secreto incorrecto) no bloquea la escritura — verificado: `POST /api/revalidate` respondió 200 al publicar y al despublicar; la nota apareció/desapareció en `apps/sitio` de inmediato

## 5. Diseño visual (Claude Design, antes de codear)

- [x] 5.1 Revisar `components/_shared.jsx` del proyecto "Guia aves chirimoyo" en Claude Design para reusar primitivos (Section, Badge, Icon, etc.)
- [x] 5.2 Construir mockup de la lista de noticias (tabla/cards con título, fecha, estado, acciones)
- [x] 5.3 Construir mockup del formulario de crear/editar (campos + editor markdown con tabs editar/vista previa)
- [x] 5.4 Revisar los mockups con el usuario antes de traducir a código — aprobado (el usuario ajustó el ancho fijo del botón alternar-estado en la lista)

## 6. UI en apps/admin

- [x] 6.1 Crear `apps/admin/app/(authed)/noticias/page.tsx` (lista, server component, lee vía `getAllNoticiasAdmin` o equivalente sin caché de sitio)
- [x] 6.2 Crear `apps/admin/app/(authed)/noticias/nueva/page.tsx` (formulario de creación)
- [x] 6.3 Crear `apps/admin/app/(authed)/noticias/[slug]/editar/page.tsx` (formulario de edición, slug deshabilitado)
- [x] 6.4 Crear componente de formulario compartido (client component, `useActionState`, reporta errores de validación)
- [x] 6.5 Crear componente editor markdown (`textarea` + tabs "Editar"/"Vista previa", reusando `Markdown.tsx`)
- [x] 6.6 Agregar `react-markdown` y `remark-gfm` como dependencias directas de `apps/admin/package.json` (copiar `Markdown.tsx` de `apps/sitio` o extraer a ruta compartida por copia)
- [x] 6.7 Agregar acciones de borrar (con diálogo de confirmación) y alternar estado en la lista
- [x] 6.8 Enlazar/reemplazar el placeholder `app/(authed)/dashboard/page.tsx` con acceso a la sección de noticias

## 7. Verificación end-to-end

- [x] 7.1 Con emulators corriendo (Firestore + Auth), crear una noticia en borrador, editarla, publicarla, verificar que aparece en `apps/sitio` local tras revalidar — OK (slug autogenerado `jornada-de-prueba-de-verificacion`, apareció en `/comunidad/noticias`)
- [x] 7.2 Despublicarla y verificar que desaparece del listado público tras revalidar — OK (revalidación 200; en dev el listado del sitio muestra también borradores por diseño existente, se confirmó el estado real vía la lista del admin y quedó en "Borrador" con `publishedAt` sin sobreescribirse)
- [x] 7.3 Borrarla y verificar que el documento ya no existe en el emulator — OK (lista del admin bajó de 2 → 1 → 0)
- [x] 7.4 Probar el caso de slug duplicado y de validación fallida (fecha inválida, portada sin portadaAlt) — OK (mensajes de error correctos en ambos casos, sin escribir nada en Firestore)
- [x] 7.5 `npm run typecheck && npm run build` en `apps/admin` (confirmar que `next build` no toca Firestore) — OK (todas las rutas de noticias son `ƒ` dinámicas)

## 8. OpenSpec y PR

- [ ] 8.1 `/opsx:archive` del cambio `crud-noticias-admin`, sincronizando `openspec/specs/noticias-admin/spec.md`
- [ ] 8.2 Commit en branch `feature/fase6-crud-noticias-admin` y PR contra `main`
