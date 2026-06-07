# services/

Backends deployables de forma independiente. Ver [ADR-0001](../docs/decisions/0001-monorepo-layout.md).

| Servicio | Qué hace | Estado |
|----------|----------|--------|
| `api/` | Flask + Firestore. **Mínimo**: inscripciones de voluntarios + contacto | _por scaffoldear (Fase 0)_ |

Alcance acotado del API: ver [ADR-0006](../docs/decisions/0006-api-minima.md). El comportamiento se documenta en specs OpenSpec (`openspec/specs/`).
