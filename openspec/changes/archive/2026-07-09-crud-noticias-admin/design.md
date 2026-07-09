## Context

`apps/sitio` ya lee noticias desde Firestore (`noticias-db.ts` + `noticias-cache.ts`, tag `noticias`, `unstable_cache` con `revalidate: 3600`), y expone `POST /api/revalidate` protegido por `REVALIDATE_SECRET` — ambos construidos en #134/#136 ya pensando en que el admin sería el consumidor de escritura. `apps/admin` tiene login (#139): `lib/firebase-admin.ts` (Auth únicamente), `lib/session.ts`, gate en `app/(authed)/layout.tsx`, y un placeholder en `app/(authed)/dashboard/page.tsx`. No existe todavía ningún acceso a Firestore desde `apps/admin`.

Este cambio construye la primera escritura real: el CRUD de noticias, server-side vía Firebase Admin SDK, sin RBAC (un solo rol, ADR-0029) y sin tocar el API Flask (ADR-0006) ni las reglas `deny-all` de Firestore.

## Goals / Non-Goals

**Goals:**
- Crear, editar, borrar y alternar `borrador`↔`publicado` para noticias, con validación server-side.
- Mantener el documento Firestore 100% compatible con el contrato ya definido en `contenido-dinamico` (mismos campos, mismo doc ID = slug).
- Disparar la revalidación del sitio de forma best-effort cuando el cambio afecta contenido público.
- Reusar el patrón de acceso a Firestore y el editor markdown ya existentes en el monorepo, sin introducir dependencias nuevas de validación.

**Non-Goals:**
- CRUD de jornadas/eventos (#141).
- Subida real de archivos de imagen (#142) — portada queda como texto plano por ahora.
- RBAC o roles diferenciados (ADR-0029: un solo rol editor).
- Cambios al esquema de datos de `noticias` o a las reglas de Firestore.
- Historial/versionado de ediciones (fuera de alcance; se pierde con la migración de ADR-0028, aceptado ahí).

## Decisions

### D1 — Cliente Firestore en admin: espejo exacto de `apps/sitio/lib/firestore.ts`
`apps/admin/lib/firestore.ts` reusa el mismo patrón (singleton lazy en `globalThis`, ADC vía `applicationDefault()`, sin llave JSON). Es el mismo proyecto Firebase (`chirimoyo`) que ya usa `firebase-admin` para Auth en este mismo app, así que solo se agrega el `Firestore` client sobre la misma `App` ya inicializada por `getApps()[0]` — no hace falta una segunda inicialización de `initializeApp`.

**Alternativa descartada:** un módulo compartido entre `apps/sitio` y `apps/admin` (paquete interno). Rechazada: el proyecto no usa tooling de monorepo (ADR-0001); duplicar ~15 líneas de singleton es más barato que introducir un paquete compartido.

### D2 — Server Actions para las escrituras, no route handlers
El bug documentado en #139 (`Server Action + cookies().set() + redirect()` → loop de redirect bajo el rewrite de Firebase Hosting) es específico al **flujo de sesión**: escribir una cookie httpOnly y depender de que el siguiente request la traiga. Las escrituras de noticias no tocan cookies ni hacen `redirect()` — usan `revalidatePath`/devuelven estado de formulario vía `useActionState`. Es el patrón estándar de Next 15 para mutaciones desde un formulario, y es el que pide el issue original (#140).

### D3 — Slug: doc ID inmutable, autogenerado al crear
`slug = slugify(titulo)` al crear (normaliza tildes/ñ, kebab-case). Antes de escribir, se verifica que `noticias/{slug}` no exista (`doc.get()` → si existe, error de validación "ya existe una noticia con ese título/slug"). En edición, el campo se muestra pero deshabilitado — cambiar el slug requeriría borrar+recrear el documento, lo que rompe cualquier URL/OG ya compartida del detalle en `apps/sitio`. Si en el futuro se necesita renombrar, es una operación explícita separada (fuera de alcance).

### D4 — Timestamps de sistema
- `createdAt`: se fija una sola vez, al crear (server timestamp).
- `updatedAt`: se sobreescribe en cada escritura (create/update/delete no aplica, delete borra el doc).
- `publishedAt`: se fija **solo** la primera vez que `estado` pasa de `borrador` a `publicado`; nunca se vuelve a tocar, ni al despublicar ni al republicar. Esto es coherente con el seed (`seed-firestore.mts`), que deriva `publishedAt` de la fecha editorial solo si `estado == publicado`, y con la semántica de "cuándo salió originalmente" en vez de "última vez que estuvo visible".

**Alternativa descartada:** actualizar `publishedAt` en cada republicación. Rechazada porque ningún lector actual (`noticias-db.ts`) usa `publishedAt` para ordenar o mostrar nada (usa `fecha`, el campo editorial) — no hay beneficio funcional y sí una superficie más para inconsistencias con el seed.

### D5 — Revalidación best-effort, acoplada al estado público
Se llama `POST {SITIO_BASE_URL}/api/revalidate` con `Authorization: Bearer {REVALIDATE_SECRET}` y body `{ tag: "noticias" }` cuando la escritura afecta contenido que **es o fue** público: crear+publicar, editar una noticia publicada, despublicar, o borrar una publicada. Editar un borrador no dispara nada (no hay nada público que actualizar). La llamada se envuelve en `try/catch`: si falla (red, secreto mal configurado, sitio caído), la escritura en Firestore **ya se completó** y no se revierte; se retorna un aviso no bloqueante en el estado del formulario/acción (ej. "Guardado, pero no se pudo notificar al sitio — se actualizará solo en unos minutos" gracias al `revalidate: 3600` de `unstable_cache`). Esto prioriza que el trabajo editorial nunca se pierda por un problema de red transitorio entre dos apps de Cloud Run.

### D6 — Configuración cross-app
Nuevas env vars server-only en `apps/admin`: `SITIO_BASE_URL` (ej. `https://chirimoyo.org` en prod; en local/dev, la URL del `next dev` de `apps/sitio` si se prueba end-to-end, u omitirse para que la revalidación simplemente falle silenciosamente en dev) y `REVALIDATE_SECRET` (mismo valor que en `apps/sitio/.env` — se documenta en ambos READMEs que deben coincidir). Ninguna se expone como `NEXT_PUBLIC_*`.

### D7 — Portada como texto plano (interino hasta #142)
Los campos `portada`/`portadaAlt` se editan como inputs de texto simples: se espera que el usuario pegue la ruta relativa dentro del bucket de comunidad (ej. `noticias/foto.webp`, coherente con cómo `mediaUrl()` la resuelve en `apps/sitio`) o, si ya la subió a mano, la ruta completa. No hay preview de imagen en este cambio. #142 reemplaza este input por un widget de upload real sin tocar el esquema del documento.

### D8 — Editor de cuerpo: textarea + vista previa
Client component con dos paneles (o tabs "Editar"/"Vista previa"): un `<textarea>` para el markdown crudo y un panel que renderiza con el mismo `Markdown.tsx` de `apps/sitio` (copiado/reusado en `apps/admin`, mismo `react-markdown` + `remark-gfm`, sin `rehype-raw` — se agregan como dependencias nuevas a `apps/admin/package.json`). No se agrega toolbar de formato (negrita/enlace/etc.) en esta primera versión — el equipo editorial ya conoce markdown básico por las noticias existentes en `content/noticias/*.md`.

### D9 — Borrado: hard delete con confirmación
`doc.delete()` tras un diálogo de confirmación en el cliente (no hay estado "archivado" en el esquema). Si la noticia borrada estaba `publicado`, dispara D5 igual que una despublicación.

### D10 — Validación manual, sin librería
Funciones de validación a mano en `apps/admin/lib/noticias/validation.ts` (requeridos: `titulo`, `resumen`, `fecha` ISO válida; `tags` como array de strings kebab-case; `portadaAlt` requerido si hay `portada`, igual que documenta `content/noticias/README.md`). Sigue la convención actual del repo — no hay `zod`/`yup` en ningún `package.json` todavía, y este cambio no es el lugar para introducirlo (impacta también a #141, mejor decidirlo si/cuando ese issue lo justifique con más volumen de formularios).

## Risks / Trade-offs

- **[Riesgo] Secreto de revalidación desincronizado entre `apps/sitio` y `apps/admin`** → Mitigación: documentado explícitamente en ambos READMEs; falla de forma segura (best-effort, no rompe la escritura) si están desincronizados, y el revalidate horario (`revalidate: 3600`) corrige la mayoría de los casos igual.
- **[Riesgo] Slug inmutable puede frustrar una corrección de título con typo grave** → Mitigación: aceptado como trade-off explícito (D3); el título editorial (`titulo`) sí es editable libremente, solo el slug/URL queda fijo. Si se necesita renombrar, es un caso raro y manual (borrar+recrear vía consola/script).
- **[Riesgo] Sin historial de ediciones** → si alguien borra o edita mal una noticia, no hay "deshacer". Mitigación: ya aceptado en ADR-0028 (se pierde el historial de git); mitigable a futuro con un export/backup periódico, fuera de alcance aquí.
- **[Trade-off] Sin paginación en la lista** → aceptable al volumen editorial actual (community news, no un blog de alto volumen); se revisará si el conteo de noticias crece significativamente.

## Migration Plan

No hay migración de datos (el esquema Firestore ya existe desde #134/#135). Pasos de despliegue:
1. Agregar `SITIO_BASE_URL` y `REVALIDATE_SECRET` a la configuración de Cloud Run del servicio `admin` (mismo secreto ya configurado en el servicio `sitio`).
2. Deploy de `apps/admin` con el CRUD nuevo.
3. Verificación manual: crear una noticia de prueba en borrador, publicarla, confirmar que aparece en `chirimoyo.org/comunidad` tras la revalidación, despublicarla, confirmar que desaparece, borrarla.

Sin rollback especial: es una app deployable independiente (ADR-0001); revertir es re-desplegar la revisión anterior de Cloud Run `admin`. No afecta a `apps/sitio` ni a los datos existentes.

## Open Questions

Ninguna pendiente — todas las decisiones (D1-D10) fueron cerradas explícitamente en `/opsx:explore 140` antes de este documento.
