## Context

El catálogo (`apps/catalogo`) es estático: las fichas viven en `content/fauna/<grupo>/<slug>/index.md` y un loader server-only (`lib/content.ts`) las lee en build; los tipos puros viven en `lib/fauna-schema.ts` (seguros para cliente), la presentación de enums en `lib/dictionary.ts`, la búsqueda en cliente en `lib/search.ts` y el detalle en `lib/ficha.ts`. El esquema se definió en Fase 1 (spec `esquema-ficha-fauna`, 12 requisitos) orientado a aves.

Al explorar #87 se confirmó que el esquema ya soporta casi todo lo que la herpetofauna necesita: `audios[]` (canto de anuros), `distribucion.residente[]`, `conservacion.nom059` (incl. `pr`), las secciones del cuerpo y `estatusMigratorio="residente"`. Lo único pendiente es group-aware: el enum `Grupo` aún encarna el plan combinado viejo (`"anfibios-reptiles"`), `categoria` está cableado a gremios de ave, y falta un criterio de talla. Este cambio es el cimiento del que dependen #88 (migración), #84 (rutas), #85 (filtro de búsqueda) y #92 (verificación de detalle).

## Goals / Non-Goals

**Goals:**
- Separar `Grupo` en `aves` | `anfibios` | `reptiles` (ADR-0024) en el tipo y en el loader.
- Permitir criterio de talla (`medidas.criterio`) sin romper aves.
- Documentar `categoria` como vocabulario por grupo y proveer sus chips de presentación para herpetofauna.
- Dejar el catálogo verde (`typecheck` OK, 64 fichas de aves intactas) **sin** depender de rutas o contenido nuevos.

**Non-Goals:**
- Construir el filtro por grupo en la búsqueda (#85), las rutas `/[grupo]` (#84) ni migrar contenido (#88).
- Cambiar el `href` `/aves/${slug}` → `/${grupo}/${slug}` (depende de que exista la ruta; va en #84).
- Renombrar `estatusMigratorio`, agregar `resumen_*`, o extender el vocabulario visual (`forma`/`donde`) a herps.

## Decisions

- **`Grupo` separado, no combinado.** `"aves" | "anfibios" | "reptiles"`, alineado con ADR-0024 (1 grupo taxonómico = 1 path) y con `content/fauna/{anfibios,reptiles}/` de #88. _Alternativa descartada:_ mantener `"anfibios-reptiles"` combinado — contradice ADR-0024 y mezcla dos grupos en un path.

- **`categoria` queda `string` abierto; el vocabulario por grupo vive en documentación + `dictionary.ts`.** El tipo no se cierra por grupo (evita un union genérico frágil); el contrato group-aware se expresa en `content/README.md` (qué valores valen por grupo) y en los chips de `dictionary.ts`. `lib/search.ts` mapea categoría→id de forma group-aware (hoy `CATEGORIA_ID` solo conoce gremios de ave y cae a `"terrestres"` por defecto, lo que sería incorrecto para herps). _Alternativa descartada:_ tipos `CategoriaAves`/`CategoriaHerps` cerrados — más rígido, más churn, y la validación del loader no comprueba enums de todos modos.

- **`medidas.criterio?: string` aditivo.** Un string libre (p. ej. `"LHC (hocico-cloaca)"`) en vez de un enum, porque el criterio de talla varía por taxón y es texto de presentación. Aves siguen usando `envergadura` (campo aparte ya existente) o `medidas` sin criterio. _Alternativa descartada:_ enum cerrado de criterios — innecesario para un rótulo.

- **Filtros visuales sin tocar (decisión C).** `forma`/`donde` mantienen su vocabulario de ave; las fichas de herps los **omiten** (ya son opcionales). Con ~12 especies, el filtro de siluetas —pensado para decenas de aves— no aporta; se difiere un vocabulario por grupo a cuando lleguen insectos/mamíferos. El dato queda preparado (campos opcionales) sin cerrar la puerta.

- **Plomería de consumo segura ahora, riesgosa después.** En este cambio entran solo los ajustes que no dependen de rutas nuevas: campo `group` en `Bird`, `CATEGORIA_ID` group-aware, `relacionadas()` acotada al `grupo`, y el rótulo de `medidas` por `criterio`. El `href` group-namespaced se deja para #84 para no generar enlaces 404 mientras la ruta `/[grupo]/[slug]` no exista.

## Risks / Trade-offs

- **`Grupo` es un cambio de tipo "BREAKING".** → Mitigación: no existe contenido del grupo combinado viejo; el cambio es de tipos. `grep` por `"anfibios-reptiles"` en `apps/catalogo` antes de cerrar para no dejar referencias colgando.

- **`categoria` abierta no valida valores.** Un typo (`Tortuga` vs `Tortugas`) no falla el build; solo no casa el chip. → Mitigación: documentar el vocabulario cerrado por grupo en `content/README.md` y que la migración (#88) emita exactamente esos valores; opcionalmente, un aviso (no error) en el loader si la categoría no está en el vocabulario conocido de su grupo.

- **`relacionadas()` acotada al grupo reduce resultados** para grupos pequeños (un reptil con pocas especies podría quedarse corto). → Mitigación: aceptable en Fase 2; si hace falta, ampliar a "mismo grupo, luego cualquier grupo" más adelante.

- **Coordinación con #84/#85.** Exponer `Bird.group` sin que #85 lo filtre aún no causa daño (campo inerte). El `href` diferido evita el riesgo real. → Mitigación: los comentarios de coordinación ya están en #84/#85.
