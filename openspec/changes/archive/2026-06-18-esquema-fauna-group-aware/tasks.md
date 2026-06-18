## 1. Tipos del esquema (`lib/fauna-schema.ts`)

- [x] 1.1 Cambiar `Grupo` de `"aves" | "anfibios-reptiles"` a `"aves" | "anfibios" | "reptiles"`.
- [x] 1.2 Agregar `criterio?: string` a la interfaz `Medidas` (aditivo).
- [x] 1.3 Añadir comentario en `EstatusMigratorio` documentándolo como "eje de presencia" (admite `residente`; no se renombra).
- [x] 1.4 Documentar junto a `Categoria` que su vocabulario es group-aware (aves=gremios; anfibios=Anuros/Salamandras; reptiles=Lagartijas/Serpientes/Tortugas).

## 2. Loader (`lib/content.ts`)

- [x] 2.1 Actualizar `GRUPOS` a `["aves", "anfibios", "reptiles"]`.
- [x] 2.2 Mapear `medidas` tal cual (ya pasa el objeto completo, incluye `criterio` sin cambios); verificar que el passthrough no pierda el campo.
- [x] 2.3 Confirmar que la validación de núcleo sigue tolerando los grupos que aún no existen en disco (anfibios/reptiles vacíos en este punto).

## 3. Presentación de enums (`lib/dictionary.ts`)

- [x] 3.1 Agregar los chips/labels de categoría de herpetofauna: `Anuros`, `Salamandras` (anfibios) y `Lagartijas`, `Serpientes`, `Tortugas` (reptiles), con estilo coherente con los gremios de aves (`CATS`).
- [x] 3.2 No agregar valores de herp a `SHAPES`/`WHERES`/`SIZES` (decisión C: herps omiten `forma`/`donde`).

## 4. Búsqueda (`lib/search.ts`) — plomería segura

- [x] 4.1 Agregar el campo `group: Grupo` al registro `Bird` y poblarlo desde `f.grupo` en `fichaToBird`.
- [x] 4.2 Volver group-aware el mapeo de categoría: que `CATEGORIA_ID` (o su reemplazo) reconozca las categorías de herp y no caiga a `"terrestres"` por defecto para herps.
- [x] 4.3 NO cambiar el `href` `/aves/${slug}` (se difiere a #84 junto con la ruta `/[grupo]/[slug]`); dejar nota/TODO que lo enlace a #84.

## 5. Detalle (`lib/ficha.ts`)

- [x] 5.1 Acotar `relacionadas()` al mismo `grupo` (que una rana no jale aves).
- [x] 5.2 Rotular las medidas con `medidas.criterio` (p. ej. "LHC (hocico-cloaca)") cuando exista, en vez de asumir "envergadura".

## 6. Documentación del esquema

- [x] 6.1 Actualizar `content/README.md`: enum de `grupo` (3 valores), `medidas.criterio`, y el vocabulario de `categoria` por grupo.
- [x] 6.2 Revisar `content/fauna/aves/_ejemplo.md` para que siga válido (no requiere `criterio`; es opcional).

## 7. Verificación

- [x] 7.1 `grep` por `"anfibios-reptiles"` en `apps/catalogo` y eliminar referencias colgantes.
- [x] 7.2 `npm run typecheck` en `apps/catalogo` pasa.
- [x] 7.3 `npm run lint`/build del catálogo: las 64 fichas de aves siguen válidas y el catálogo renderiza igual que antes (sin regresiones).
