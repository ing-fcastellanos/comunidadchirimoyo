# ADR-0013 — Tokens de diseño compartidos por copia desde una fuente canónica

- **Estado:** Accepted
- **Fecha:** 2026-06-08
- **Decisores:** @ing-fcastellanos
- **Issue:** #4 (sistema de diseño)

## Contexto

El sistema de diseño (tokens de color/tipografía/sombra, primitivas) debe ser **idéntico** en las dos apps Next (`sitio` y `catalogo`), que se construyen y despliegan de forma independiente. [ADR-0011](0011-diseno-i18n.md) fija que los tokens viven en `globals.css`; [ADR-0001](0001-monorepo-layout.md) prohíbe `packages/`/workspaces sin un ADR. Hay que decidir cómo comparten el sistema de diseño dos apps que no pueden importar un módulo común sin introducir tooling de monorepo.

## Decisión

Mantener una **fuente canónica** en `docs/design-system/` (`tokens.css`, `fonts.ts`, `primitives/`, `README.md`) y **copiar** los tokens a cada app con un script Node (`scripts/sync-design-tokens.mjs`), que escribe `apps/<app>/app/tokens.css`. Las apps importan su copia desde `globals.css`. **No** se introduce `packages/`, workspaces ni dependencias entre apps.

## Alternativas consideradas

- **Paquete compartido (`packages/design`)**: elimina la duplicación, pero introduce workspaces/tooling de monorepo que el proyecto evitó a propósito; requeriría enmendar ADR-0001. Desproporcionado para 2 apps y un bloque de ~50 líneas de tokens.
- **Duplicar a mano sin canónico**: barato, pero los tokens divergen silenciosamente entre apps con el tiempo. El script de sincronización lo evita conservando una sola fuente de verdad.
- **Importar un archivo raíz compartido vía rutas relativas** (p. ej. `../../docs/design-system/tokens.css`): rompe el aislamiento de build de cada app (Docker context por app) y complica los Dockerfiles. Descartada.

## Consecuencias

### Positivas

- Respeta ADR-0001: cada app se construye sola, sin workspaces.
- Una sola fuente de verdad; las copias se regeneran con un comando.
- Onboarding trivial: el `globals.css` de cada app es estándar.

### Negativas

- Duplicación física de `tokens.css` en cada app (mitigado: generada, no editada a mano).
- Riesgo de olvido de re-sincronizar tras editar el canónico (mitigable con un check de CI que falle si las copias difieren).

### Neutras

- Las primitivas (`.tsx`) también se copian a `components/ui/` de cada app durante el scaffold.

## Plan de revisión

Reconsiderar (hacia `packages/` + un ADR que enmiende ADR-0001) si aparece código compartido real y sustancial entre las apps (más allá de tokens y unas primitivas), o si la sincronización por copia se vuelve una fuente recurrente de bugs.

## Referencias

- ADR-0001 (sin tooling de monorepo), ADR-0011 (sistema de diseño desde v0.dev).
- `docs/design-system/`, `scripts/sync-design-tokens.mjs`.
- Change OpenSpec `establish-design-system`.
