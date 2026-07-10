## Context

`apps/sitio` ya lee jornadas desde Firestore (`jornadas-db.ts` + `jornadas-cache.ts`, tag `jornadas`, `unstable_cache` con `revalidate: 3600`), y `POST /api/revalidate` ya acepta `{ tag: "jornadas" }` (construido en #134/#137). `apps/admin` completó su primer CRUD real con noticias (#140): `lib/firestore.ts`, el patrón de server actions + `useActionState`, validación manual, Claude Design como paso previo a codear. Este cambio construye el segundo CRUD, reusando toda esa infraestructura, pero con un modelo de datos distinto (una colección con discriminador `kind`, sin estado borrador/publicado).

## Goals / Non-Goals

**Goals:**
- Crear, editar y borrar jornadas/eventos, con validación server-side (incluyendo el enum cerrado de `tipo`, crítico para no romper `/voluntarios`).
- Mantener el documento Firestore 100% compatible con el contrato ya definido en `contenido-dinamico` (mismos campos, mismo doc ID = slug, mismo discriminador `kind`).
- Disparar la revalidación del sitio en toda escritura (sin condicionar por estado, porque no existe).
- Reusar al máximo la infraestructura de #140 (`lib/firestore.ts`, patrón de actions, `Campo`, slugify) sin duplicar lo que ya es genérico.

**Non-Goals:**
- CRUD de noticias (ya hecho, #140).
- Cambiar el modelo de recurrencia o la expansión a próximas ocurrencias (`proximasJornadas` se queda intacta en `apps/sitio/lib/jornadas.ts`).
- RBAC o roles diferenciados (ADR-0029: un solo rol editor).
- Agregar nuevos valores de `tipo` — el conjunto cerrado (`limpieza`/`pajareada`/`evento`) es una restricción del front, no de este cambio.
- Corregir el placeholder "Chirimoyo Itinerante" de `content/jornadas/README.md` (es contenido de seed, no de este código; se corrige editorialmente desde el admin una vez exista).

## Decisions

### D1 — Reusar `apps/admin/lib/firestore.ts` sin cambios
Ya existe (#140), es genérico para cualquier colección. No requiere modificación para jornadas.

### D2 — Tipos por copia
`apps/admin/lib/jornadas/types.ts` espeja `TipoJornada`, `JornadaRecurrente`, `EventoJornada` de `apps/sitio/lib/jornadas.ts`. Mismo patrón que `apps/admin/lib/noticias/types.ts` — duplicación deliberada (ADR-0001, sin tooling de monorepo).

### D3 — Sin estado, revalidación incondicional
A diferencia de noticias, la colección `jornadas` no tiene concepto de borrador — todo documento es inmediatamente visible en `/voluntarios` (confirmado en `jornadas-db.ts`, que hace un `.get()` plano sin filtrar por ningún campo de estado). Por lo tanto, **toda** escritura (crear, editar, borrar) llama a `revalidarJornadas()` sin condición — no hay equivalente al chequeo "¿fue publicado?" de noticias. Esto simplifica las server actions respecto a las de noticias-admin.

**Alternativa descartada:** agregar un campo `activo`/`visible` a jornadas para permitir "borradores" también aquí. Rechazada: no está en el modelo de datos actual (ADR-0028/`contenido-dinamico` no lo define), y el issue no lo pide — introducirlo ahora sería una ampliación de alcance no solicitada.

### D4 — Slug inmutable, mismo patrón que noticias
`slug = slugify(titulo)` al crear, doc ID, deshabilitado en edición. Reusa la misma función `slugify` de `apps/admin/lib/noticias/slug.ts` (se mueve o se referencia desde un lugar neutral, ver Open Questions) — no se reimplementa.

### D5 — `kind` inmutable tras crear
Igual razonamiento que el slug: `kind` determina la forma entera del documento (`recurrencia` vs `fecha`). Cambiarlo requeriría reescribir el documento por completo; se trata como una operación de borrar+recrear, fuera de este cambio.

### D6 — `tipo` como enum cerrado, validado server-side
**Restricción real, no preferencia de diseño:** `apps/sitio/components/voluntarios/ProximasJornadas.tsx` indexa `TIPO: Record<TipoJornada, {icono, etiqueta}>` con exactamente 3 llaves. Un valor de `tipo` fuera de `limpieza | pajareada | evento` hace que esa página truene en runtime (acceso a propiedad de `undefined`). El formulario usa un `<select>` restringido, y la validación server-side rechaza cualquier otro valor antes de escribir en Firestore — es una defensa en profundidad indispensable, no opcional.

### D7 — Formulario condicional por `kind`
Un solo componente de formulario con una sección que cambia según `kind`:
- `recurrente`: `recurrencia.tipo` (`semanal` | `mensual-ordinal`), `dia` (`<select>` de los 7 días en español sin acentos, coincidente con `content/jornadas/README.md`), y si `mensual-ordinal`, `ordinales` (checkboxes 1º–5º, mínimo uno).
- `evento`: `fecha` (input `date`, ISO `YYYY-MM-DD`).

**Alternativa descartada:** dos formularios separados (uno por `kind`). Rechazada: duplicaría los campos base (título, tipo, hora, lugar, inscripción, descripción) sin beneficio; un solo formulario con una sección condicional es más simple de mantener.

### D8 — `hora` requerida
El spec `jornadas-voluntarios` dice "SHALL declarar al menos... hora". El placeholder "Chirimoyo Itinerante" con `hora: ""` está marcado como incompleto en su propio README — no es un precedente a seguir. `hora` se valida como no vacía.

### D9 — `inscripcion` como checkbox, default `true`
Coincide con el contenido curado existente (ambas jornadas recurrentes y el evento tienen `inscripcion: true`).

### D10 — `descripcion` como textarea plano, sin editor markdown
A diferencia del `cuerpo` de noticias (contenido editorial largo), `descripcion` es una frase corta mostrada en una tarjeta de `/voluntarios` — no amerita el editor con tabs de vista previa de #140.

### D11 — Lista sin columna de estado
Tabla con título, tipo (badge+ícono, mismo mapeo visual que `ProximasJornadas.tsx`), una columna de "regla/fecha" que resume en texto la recurrencia o la fecha del evento, y acciones (editar, borrar) — sin publicar/despublicar, porque no aplica (D3).

### D12 — Revalidación: archivo espejo, no abstracción compartida
`apps/admin/lib/jornadas/revalidar.ts` es un archivo paralelo a `apps/admin/lib/noticias/revalidar.ts` (llama `POST /api/revalidate` con `{ tag: "jornadas" }`). Se decide **no** refactorizar a un helper genérico parametrizado por tag, siguiendo la convención ya establecida en `apps/sitio` (donde `noticias-cache.ts` y `jornadas-cache.ts` son archivos separados, no una abstracción común) — consistencia con el estilo del repo por encima de eliminar una duplicación pequeña (~20 líneas).

### D13 — Diseño visual primero en Claude Design
Mismo flujo que `/noticias` (#140): mockup de la lista + el formulario condicional en el proyecto "Guia aves chirimoyo", revisado por el usuario, y solo después traducido a `apps/admin/app/(authed)/jornadas/`.

### D14 — `slugify` se importa desde `noticias/slug.ts`, no se duplica
A diferencia de `revalidar.ts` (D12, sí se duplica porque cada uno pega a un tag distinto), `slugify` es una función pura de ~6 líneas sin nada capability-específico. Se importa `apps/admin/lib/noticias/slug.ts` desde `jornadas/actions.ts` en vez de copiarla — no hay valor en duplicar algo que no puede divergir por dominio.

## Risks / Trade-offs

- **[Riesgo] Un valor de `tipo` inválido rompe `/voluntarios` en producción** → Mitigación: validación server-side estricta contra el enum cerrado (D6) antes de cualquier escritura; el `<select>` del formulario ya restringe la entrada en la UI.
- **[Riesgo] `kind` inmutable puede frustrar un cambio de opinión (evento → recurrente)** → Mitigación: aceptado como trade-off explícito (D5), igual que la inmutabilidad del slug en noticias; es una operación rara y manual si se necesita.
- **[Trade-off] Revalidación incondicional en cada escritura** → sin costo real: a diferencia de noticias (donde condicionar evita revalidaciones innecesarias en ediciones de borrador), aquí toda escritura es pública por definición, así que la revalidación siempre es necesaria.
- **[Trade-off] Duplicación de `revalidar.ts` y `slug.ts` entre noticias y jornadas** → aceptado (D12), consistente con la convención de archivos espejo del repo.

## Migration Plan

No hay migración de datos (el esquema Firestore ya existe desde #134/#135). Pasos de despliegue:
1. Deploy de `apps/admin` con el CRUD de jornadas — no requiere nuevas env vars (reusa `SITIO_BASE_URL`/`REVALIDATE_SECRET` de #140).
2. Verificación manual: crear una jornada recurrente y un evento puntual, editarlos, confirmar que `/voluntarios` los refleja tras revalidar, borrarlos.

Sin rollback especial: app deployable independiente (ADR-0001); revertir es re-desplegar la revisión anterior de Cloud Run `admin`.

## Open Questions

Ninguna pendiente — todas las decisiones (D1-D14) fueron cerradas explícitamente en `/opsx:explore 141` y en la redacción de este documento.
