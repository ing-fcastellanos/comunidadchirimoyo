## Why

La Fase 6 hace **dinámicos** las noticias y las jornadas/eventos moviéndolos de `content/` a Firestore ([ADR-0028](../../../docs/decisions/0028-noticias-jornadas-dinamicas-firestore.md)). Antes de que el sitio las lea (#136/#137) o el admin las gestione (#140/#141), hay que **definir el contrato de datos y la capa de acceso**: qué forma tienen los documentos, cómo se accede a Firestore desde Node (hoy nunca lo ha tocado), y cómo se prueba en local sin ambiente QA. Este cambio (issue #134) es ese cimiento: sin él, seed, sitio y admin no tienen sobre qué construir.

## What Changes

- **Contrato de esquema** de dos colecciones Firestore, capturado en una **capability OpenSpec nueva** (`contenido-dinamico`) como fuente de verdad que seed/sitio/admin honran:
  - `noticias/{slug}` — `titulo`, `resumen`, `autor`, `fecha` (ISO editorial), `portada`, `portadaAlt`, `estado` (`borrador`|`publicado`), `tags[]`, `cuerpo` (markdown), + `createdAt`/`updatedAt`/`publishedAt` (Timestamp de sistema).
  - `jornadas/{slug}` — **una sola colección** con discriminador `kind` (`recurrente`|`evento`): base (`titulo`, `tipo`, `hora`, `lugar`, `inscripcion`, `descripcion`) + `recurrencia{}` si recurrente / `fecha` si evento. La **expansión de recurrencia a fechas se queda en el front** (`proximasJornadas`); Firestore solo guarda la regla.
  - **doc ID = `slug`** en ambas (clave natural estable; preserva las URLs actuales).
- **Módulo de acceso server-only** con **`firebase-admin`** (Node): init **lazy singleton** por ADC (mismo patrón que `getDbClient` de Python, sin llave JSON; a prueba del hot-reload de Next), + funciones de **lectura** y **escritura básicas**. Cada app declara su propio slice de tipos/acceso (sin tooling de monorepo, ADR-0001); este cambio lo estrena donde primero se necesita.
- **`firestore.indexes.json`** nuevo (no existía) con el índice compuesto de noticias (`estado` + `fecha desc`), enganchado al deploy de Firebase.
- **IAM**: los service accounts runtime del sitio y del admin necesitan `roles/datastore.user` (hoy solo lo tiene `chirimoyo-api`). Se documenta en el runbook (no es código).
- **Dev local con Firestore emulator**: setup para trabajar sin tocar prod (crítico para las escrituras del admin; para el sitio que solo lee, prod es inocuo).
- **Smoke de verificación**: escribe un doc, lo lee, lo borra — para validar la capa de acceso sin depender del seed (#135).

## No-goals

- **No** se migra ni siembra el contenido existente (eso es #135) — este cambio crea el contrato y la capa, no los datos.
- **No** se adapta ninguna página del sitio ni se implementa ISR/revalidación (eso es #136/#137).
- **No** se crea la app admin ni su CRUD (eso es #138–#141).
- **No** se toca el **API Flask** ni se le agregan endpoints (se **preserva [ADR-0006](../../../docs/decisions/0006-api-minima.md)**; el acceso a Firestore para estos datos es 100% desde Node server-side).
- **No** cambian las **reglas de Firestore**: siguen `deny-all` para el client SDK (acceso solo server-side vía Admin SDK, [ADR-0012](../../../docs/decisions/0012-privacidad-datos-voluntarios.md)).
- **No** se introduce paquete compartido ni workspace: cada app espeja el contrato en su propio código (deuda aceptada, como los tokens por copia, ADR-0013).

## Capabilities

### New Capabilities
- `contenido-dinamico`: contrato de las colecciones Firestore `noticias` y `jornadas` (forma de documento, doc ID, discriminador de jornadas) y la capa de acceso server-only con `firebase-admin` (init por ADC, lecturas y escrituras, reglas `deny-all` intactas). Fuente de verdad que seed, sitio y admin honran.

### Modified Capabilities
<!-- ninguna: no se modifica el comportamiento del API Flask (ADR-0006 preservado); las capabilities de noticias/jornadas del sitio se tocan en #136/#137, no aquí -->

## Impact

- **Sub-dominios afectados:** foundation (contrato + infra Firestore) y, tangencialmente, sitio/admin (que consumirán la capa en issues posteriores).
- **Infra/GCP:** `firestore.indexes.json` nuevo + deploy; IAM `roles/datastore.user` a los SA runtime de sitio y admin; Firestore emulator para dev.
- **Dependencias:** nueva dependencia `firebase-admin` (Node) donde aterrice el módulo de acceso.
- **Docs:** capability OpenSpec `contenido-dinamico`; pasos de IAM y emulator en el runbook (se detallan en #144).
- **Sin** cambios en el API Flask, en las reglas de Firestore, ni en convenciones documentadas → **no requiere ADR nuevo** (implementa el ya aceptado ADR-0028).
