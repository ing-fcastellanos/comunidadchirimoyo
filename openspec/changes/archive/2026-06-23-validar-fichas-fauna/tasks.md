## 1. Módulo puro de validación

- [x] 1.1 Crear `apps/catalogo/lib/fauna-validate.ts` (puro, sin `node:fs`/`node:path`): tipos `Severidad`, `Problema { campo, mensaje, severidad }` y `ValidarCtx { slugCarpeta, grupo, slugsVistos: Set<string>, seleccionCurada?: string }`.
- [x] 1.2 Definir `CATEGORIAS_POR_GRUPO: Record<Grupo, string[]>` y los sets de enums (`estatusMigratorio`, `gradoOcurrencia`, `estatusDistribucion`, `nom059`, `forma`, `tamano`, `colores`, `donde`) reutilizando los literales de `fauna-schema.ts`.
- [x] 1.3 Implementar `validarFicha(data, cuerpo, ctx): Problema[]` con todos los checks `error`: núcleo + `genero`; enums; `categoria` group-aware; `foto.credito`/`foto.alt` y ≥1 foto; `slug == carpeta` y unicidad (vía `ctx.slugsVistos`); `temporada.meses` ∈ 1–12; vocabularios visuales cerrados cuando estén presentes; `## Descripción` presente.
- [x] 1.4 Añadir el check `warning` de portada: `fotos[0]` vs `ctx.seleccionCurada` por *stem* (sin extensión, case-insensitive).

## 2. Refactor del loader

- [x] 2.1 En `apps/catalogo/lib/content.ts`, reemplazar `camposNucleoFaltantes` por una llamada a `validarFicha`; filtrar `severidad === "error"` y lanzar con la lista (back-compat del build).
- [x] 2.2 Eliminar el silenciamiento `data.genero ?? ""` (ahora `genero` lo valida `validarFicha`); construir `genero` desde `data.genero`.
- [x] 2.3 Verificar que el loader siga armando `ctx` mientras itera (carpeta, grupo, acumulador de slugs) sin que la función pura toque disco.

## 3. Script de validación

- [x] 3.1 Crear `apps/catalogo/scripts/validar-fichas.mts`: recorrer `content/fauna/{aves,anfibios,reptiles}/`, leer cada `index.md` con `gray-matter`, cargar `print/photo-selections.json`, llamar `validarFicha` acumulando problemas por ficha.
- [x] 3.2 Imprimir reporte legible agrupado por ficha (grupo/slug → campo → severidad → mensaje) con resumen final (conteo de errores/warnings); `process.exit(1)` si hay ≥1 `error`.
- [x] 3.3 Resolver `content/` con la misma lógica del loader (`CONTENT_DIR` o `../../content`).
- [x] 3.4 Añadir `"validate:fichas": "tsx ./scripts/validar-fichas.mts"` a los scripts de `apps/catalogo/package.json`.

## 4. Integración CI

- [x] 4.1 Añadir step `Validar fichas` en `.github/workflows/ci-frontend.yml` con `if: matrix.app == 'catalogo' && steps.exists.outputs.go == 'true'` corriendo `npm run validate:fichas`.

## 5. Verificación

- [x] 5.1 `npx tsc --noEmit` en `apps/catalogo` sin errores (el módulo puro y el loader tipan).
- [x] 5.2 `npm run validate:fichas` corre sobre los 76 fichas y termina en 0 (datos actuales limpios); confirmar que reporta por ficha y no aborta al primero (probar localmente con una ficha temporalmente inválida y revertir).
- [x] 5.3 `npm run build` en `apps/catalogo` sigue verde (loader back-compat).
