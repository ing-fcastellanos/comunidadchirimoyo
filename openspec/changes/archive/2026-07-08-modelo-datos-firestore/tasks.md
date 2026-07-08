# Tasks — modelo-datos-firestore (issue #134)

## 1. Dependencia + cliente

- [x] 1.1 Añadir `firebase-admin` a `apps/sitio` (dependencia Node nueva; primer uso de Firebase en el front).
- [x] 1.2 `apps/sitio/lib/firestore.ts` — init **lazy singleton** del cliente por **ADC** (sin llave JSON), con guarda contra el hot-reload de Next (`globalThis`). Respeta `FIRESTORE_EMULATOR_HOST` cuando esté presente (dev). Módulo **server-only** (nunca importable desde cliente), mismo espíritu que `getDbClient` de Python.

## 2. Tipos + lectura (slice del sitio, espeja el spec `contenido-dinamico`)

- [x] 2.1 Tipos TS `Noticia`/`NoticiaMeta` y `Jornada` (`kind: recurrente|evento`) en `apps/sitio/lib/`, espejando el contrato del spec. Reusar/alinear con los tipos que ya exponen `lib/noticias.ts` y `lib/jornadas.ts` para que #136/#137 cambien lo mínimo.
- [x] 2.2 Funciones de **lectura** server-only: listar noticias (filtrable por `estado`, orden `fecha` desc), obtener noticia por slug, obtener jornadas (todas; la expansión de recurrencia se queda en el front). Sin adaptar aún las páginas (eso es #136/#137).

## 3. Infra Firestore

- [x] 3.1 `services/api/firestore.indexes.json` (archivo nuevo) con el índice compuesto de noticias `(estado ASC, fecha DESC)`; engancharlo en el bloque `firestore` de `services/api/firebase.json`.
- [x] 3.2 Confirmar que `services/api/firestore.rules` sigue `deny-all` (sin cambios) — el acceso es solo server-side.
- [x] 3.3 Anotar para el runbook (#144): IAM `roles/datastore.user` a los SA runtime de `sitio` y `admin` (hoy solo `chirimoyo-api`), y los pasos del emulator. No es código en este cambio.

## 4. Dev local (emulator)

- [x] 4.1 Configurar el **Firestore emulator** para dev (config + comando de arranque documentado), de modo que las escrituras de dev no toquen prod (crítico para el admin más adelante).

## 5. Verificación

- [x] 5.1 Smoke **write → read → delete** de un documento efímero (script standalone que usa el init de 1.2): prueba conectividad, ADC/IAM y el contrato **incluyendo escritura**, sin depender del seed (#135). Corre contra el emulator; opción contra prod para validar IAM real.
- [x] 5.2 `npm run build` + `typecheck` de `apps/sitio` en verde; confirmar que `lib/firestore.ts` es server-only (no entra en ningún bundle de cliente).
