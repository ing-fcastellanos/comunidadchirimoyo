# ADR-0011 — Sistema de diseño desde v0.dev; solo-español con estructura i18n-ready

- **Estado:** Accepted
- **Fecha:** 2026-06-07
- **Decisores:** @ing-fcastellanos
- **Issue:** _kickoff_

## Contexto

El catálogo de aves ya tiene diseños trabajados en **v0.dev** (buscador y detalle). No hay un brand kit formal aparte. Hay que decidir (a) la fuente del sistema de diseño para todos los sitios y (b) la estrategia de idiomas, considerando que el humedal atrae aves migratorias y potencialmente avistadores internacionales.

## Decisión

1. **Sistema de diseño derivado de los diseños v0.dev de aves.** Se extraen paleta, tipografías y tono y se vuelven el sistema compartido (tokens en `app/globals.css`) para `apps/sitio` y `apps/catalogo`. Coherencia visual sin partir de cero.
2. **Solo español por ahora.** Se prepara la estructura para i18n futuro (no hardcodear strings de forma que impida traducir después; organizar copy para que sea extraíble), pero **no** se traduce todavía.

## Alternativas consideradas

- **Definir identidad desde cero:** retrasaría todo con una fase de branding. Innecesario teniendo ya los diseños v0.dev.
- **Brand kit externo completo:** no existe hoy.
- **ES+EN desde el inicio:** atraería turismo internacional, pero duplica el trabajo de contenido y traducción desde el día 1, sin demanda comprobada aún.
- **ES con catálogo bilingüe:** punto medio; se descarta por ahora para no añadir complejidad de i18n parcial, pero es el candidato natural si se decide internacionalizar (los nombres científicos ya son referencia global).

## Consecuencias

### Positivas

- Identidad coherente y rápida de implementar.
- Estructura lista para añadir EN sin reescribir.

### Negativas

- Audiencia internacional limitada hasta que se traduzca.
- Extraer un sistema de diseño de mocks v0.dev requiere un paso de normalización (tokens) en Fase 0.

### Neutras

- Los exports de v0.dev (buscador, detalle) se incorporarán al explore de Fase 1.

## Plan de revisión

Añadir EN (empezando por el catálogo de aves) si hay demanda de avistadores internacionales o interés de aliados de fuera.

## Referencias

- ADR-0005 (catálogo), diseños v0.dev. ROADMAP Fase 0 (sistema de diseño) y Fase 1 (aves).
