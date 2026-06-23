## Why

El esquema de ficha de fauna se diseñó en Fase 1 a partir de las aves y todavía encarna el plan viejo: `grupo` es `"aves" | "anfibios-reptiles"` (combinado). Antes de migrar anfibios y reptiles (épica #16) hay que generalizar el esquema a **group-aware** para que esos grupos —y a futuro insectos/mamíferos— encajen sin falsear semántica. La buena noticia: el esquema ya está ~80% listo (audio, `distribucion.residente`, `conservacion.nom059`, secciones del cuerpo y `estatusMigratorio="residente"` ya existen, vindicando ADR-0025); este cambio cubre el 20% restante, que es el cimiento del que dependen #88, #84, #85 y #92.

## What Changes

- **BREAKING (tipo):** `Grupo` pasa de `"aves" | "anfibios-reptiles"` a `"aves" | "anfibios" | "reptiles"` (grupos separados, ADR-0024). En la práctica no rompe contenido: aún no existe ninguna ficha del grupo combinado. `apps/catalogo/lib/content.ts` actualiza `GRUPOS = ["aves","anfibios","reptiles"]`.
- `medidas` admite un campo opcional `criterio?: string` (p. ej. `"LHC (hocico-cloaca)"` para herpetofauna vs. envergadura de ave), de forma aditiva.
- `categoria` (sub-filtro) se documenta como **vocabulario por grupo**: aves = gremios ecológicos (Vadeadoras…); anfibios = `Anuros` · `Salamandras`; reptiles = `Lagartijas` · `Serpientes` · `Tortugas`. Sigue siendo `string` abierto en el tipo; el contrato es de documentación + presentación (chips en `lib/dictionary.ts`).
- Los campos de **búsqueda visual** (`forma`, `donde`) permanecen con su vocabulario orientado a aves; para herpetofauna **se omiten** (decisión C: en Fase 2 los herps se filtran por texto + tamaño + color). No se agregan valores de herp al vocabulario cerrado.
- `lib/dictionary.ts` agrega los chips de categoría de herpetofauna.
- Plomería de consumo *segura* (no dependiente de rutas nuevas): `relacionadas()` se acota al mismo `grupo`; las medidas se rotulan con `criterio` cuando exista.

## Capabilities

### New Capabilities

_(ninguna — este cambio no introduce una capability nueva)_

### Modified Capabilities

- `esquema-ficha-fauna`: el enum de `grupo` se separa en `aves`/`anfibios`/`reptiles`; `medidas` gana `criterio?` opcional; la semántica de `categoria` se vuelve group-aware (vocabulario por grupo); los tipos del loader (`Grupo`, `Medidas`) se actualizan. Núcleo y demás campos sin cambios.

## Impact

- **Sub-dominio afectado:** `aves` (`apps/catalogo`). No toca `sitio`, `voluntarios`, `api` ni `foundation`.
- **Código:** `lib/fauna-schema.ts` (tipos `Grupo`, `Medidas`), `lib/content.ts` (`GRUPOS`), `lib/dictionary.ts` (chips de categoría herp), `lib/ficha.ts` (rótulo de medidas, `relacionadas` por grupo), `lib/search.ts` (campo `group` en `Bird`, `CATEGORIA_ID` group-aware). `content/README.md` y `content/fauna/aves/_ejemplo.md` (documentación del esquema).
- **Verificación:** `npm run typecheck` en `apps/catalogo` pasa; las 64 fichas de aves siguen válidas (cambios aditivos/no destructivos).
- **ADRs:** se apoya en ADR-0024 (grupos por path) y ADR-0025 (esquema group-aware); no rompe convención que exija ADR nuevo.

### No-goals

- **No** se construye el filtro por grupo en la búsqueda (eso es #85); aquí solo se expone el campo `group` en el registro `Bird` y el vocab de categoría por grupo.
- **No** se crean las rutas `/[grupo]/[slug]` ni se cambia el `href` `/aves/${slug}` → `/${grupo}/${slug}` (depende de la ruta nueva; se hace en #84 para no dejar enlaces rotos).
- **No** se migra contenido de anfibios/reptiles (eso es #88).
- **No** se renombra `estatusMigratorio` (se conserva como "eje de presencia"; admite `residente`).
- **No** se agregan campos `resumen_*` (el resumen se deriva del cuerpo, como en aves).
